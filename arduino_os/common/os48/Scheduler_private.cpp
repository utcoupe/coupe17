/*
 *  The MIT License (MIT)
 *
 *  Copyright (c) 2015 DEMIRDJIAN Yves
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 */

#include "Scheduler.h"
#include "Task.h"
#include "Scheduler_context.cpp"

#define OS48_ISCHDL os48::Scheduler::get()

void os48::Scheduler::terminateTask()
{
  OS48_KERNEL_SAFETY_BLOCK
  {
    saveCurrentSP();
    OS48_ISCHDL->dequeuingAliveTaskAndYield(OS48_ISCHDL->getRunningTask(), StTerminated);
  }
  
  blackHole(); //in case of
}

void os48::Scheduler::internalYieldForYieldFnc()
{
  inlineInternalYield();
}

void os48::Scheduler::idleProcess()
{
  for (;;)
  {
    if (OS48_ISCHDL->m_idle_user_fnc != NULL)
      OS48_ISCHDL->m_idle_user_fnc();

    OS48_KERNEL_SAFETY_BLOCK
    {
      OS48_ISCHDL->MCUSleep();
    }
  }
}

void os48::Scheduler::initIdleTask()
{
  if (m_idle_task == NULL)
  {
    m_idle_task = new Task((uintptr_t) &idleProcess, OS48_MINIMAL_TASK_STACK_SIZE + OS48_IDLE_TASK_STACK_SIZE);
    m_idle_task->m_priority = PrIdle;
  }

  m_idle_task->m_state = StQueuing;
}

void os48::Scheduler::initTask(Task* task, TaskPriority priority, bool startImmediately)
{
  task->m_priority = priority;
  task->m_state = StNotStarted;
  task->m_last_execution = timer0_millis;

  if (startImmediately)
  {
    queuingNonAliveTask(task);
    priorityYield(); //yields only if there is a higher priority task ready (depending of the scheduling policy)
  }
}


void os48::Scheduler::addTaskInSleepingQueue(Task* task)
{
  QueueItem<Task>* current_qi = m_sleeping_task_sentinel.getNextQI();
  while (current_qi != &m_sleeping_task_sentinel)
  {
    if ((current_qi->getItem()->m_start_time_sleep + current_qi->getItem()->m_sleep_duration) > (task->m_start_time_sleep + task->m_sleep_duration)) //the queue is ordered by time
    {
      task->linkBeforeQI(current_qi);
      return;
    }

    current_qi = current_qi->getNextQI();
  }

  task->linkBeforeQI(current_qi);
}

void os48::Scheduler::removeTaskFromSleepingQueue(Task* task)
{
  task->unlinkQI();
  task->m_flags &= ~OS48_TASK_FLAG_BLOCKED_TIMEOUT;
}

void os48::Scheduler::queuingNonAliveTask(Task* task)
{
  if (!task->isAlive())
  {
    task->m_state = StQueuing;
    
    if (task->m_priority + 1 <= PrHighest)
    {
        task->linkBeforeQI(m_prior_task_sentinels[task->m_priority + 1]);
    }
    else
    {
        task->linkBeforeQI(m_prior_task_sentinels[PrLowest]);
    }
    
    if (m_prior_task_sentinels[task->m_priority]->getPriority() < task->m_priority)
    {
        m_prior_task_sentinels[task->m_priority] = task;
        redefinePrioritySentinels(task->m_priority, task);
    }    
  }
}

void os48::Scheduler::dequeuingAliveTask(Task* task, TaskState nextState)
{
  if (task->isAlive())
  {
    if (task == m_prior_task_sentinels[task->getPriority()])
    {
      m_prior_task_sentinels[task->getPriority()] = task->getNextItem();
      redefinePrioritySentinels(task->getPriority(), m_prior_task_sentinels[task->getPriority()]);
    }

    task->unlinkQI();
  }

  task->m_state = nextState;
}

void os48::Scheduler::dequeuingAliveTaskAndYield(Task* task, TaskState nextState)
{
  dequeuingAliveTask(task, nextState);
  Task* nextTask = schedule();
  task->cleanQI();
  internalYieldTo(nextTask);
}

void os48::Scheduler::redefinePrioritySentinels(TaskPriority priority, Task* task)
{
  for (uint8_t p = priority + 1; p <= PrHighest; ++p)
  {
    if (m_prior_task_sentinels[p]->getPriority() <= priority)
      m_prior_task_sentinels[p] = task;
  }
}

void os48::Scheduler::initTimeSlot()
{
  switch (m_scheduling_policy)
  {
    case SchPolicyPreemptive:
      OS48_DEFINE_PREEMPTIVE_TIME_SLICE_();
      break;
    case SchPolicyRoundRobin:
      OS48_DEFINE_RROBIN_TIME_SLICE_(m_current_running_task);
      break;
    case SchPolicyRandomPriority:
    case SchPolicyIntelligent :
      OS48_DEFINE_CONSTANT_TIME_SLICE_();
      break;
    default:
      break;
  }
}

bool os48::Scheduler::shouldYield()
{
  if (m_current_running_task->m_priority < m_prior_task_sentinels[PrHighest]->m_priority)
    return m_scheduling_policy == SchPolicyPreemptive || m_scheduling_policy == SchPolicyIntelligent;

  return false;
}

void os48::Scheduler::preStackOverflowDetection()
{
  //sp is inside or above the reserved area at the end of the task stack OR if the mask at the last
  //byte of the stack has changed
  if (*((uint8_t*)((uintptr_t) m_current_running_task->m_stack)) != m_current_running_task->m_id || //last byte != maskID
      (getSavedSP() < ((uintptr_t) m_current_running_task->m_stack + OS48_EXTRA_SIZE_END_TASK_STACK) - 1)) //SP < last byte available - 1
  {
    dequeuingAliveTask(m_current_running_task, StCorrupted);
    m_current_running_task->m_saved_sp = getSavedSP();
    OS48_STOP_KERNEL_TICK();
    m_user_overflow_fnc();
    blackHole();
  }
}

void os48::Scheduler::postStackOverflowDetection()
{
  //if the mask at the first byte of the stack has changed
  if (*((uint8_t*)m_current_running_task->getStackStartAddr()) != m_current_running_task->m_id)
  {
    dequeuingAliveTask(m_current_running_task, StCorrupted);
    OS48_STOP_KERNEL_TICK();
    m_user_overflow_fnc();
    blackHole();
  }
}

void os48::Scheduler::doSleepingTasksProcess()
{
  QueueItem<Task>* current_qi = m_sleeping_task_sentinel.getNextQI(); //the older waiting task

  while (current_qi != &m_sleeping_task_sentinel)
  {
    if ((timer0_millis - current_qi->getItem()->m_start_time_sleep) >= (current_qi->getItem()->m_sleep_duration - 1))
    {
      removeTaskFromSleepingQueue(current_qi->getItem());
      Task* to_wake_up = current_qi->getItem();
      current_qi = current_qi->getNextQI();
      queuingNonAliveTask(to_wake_up);
    }
    else
    {
      break; // no more task to wake up
    }
  }
}

void os48::Scheduler::doScheduleProcess()
{  
#if OS48_ENABLE_STACK_OVERFLOW == 1
  preStackOverflowDetection();
#endif

  doSleepingTasksProcess();

  if (os48_cs_enabled)
  {
#if OS48_ENABLE_STATS == 1
    m_current_running_task->m_millis_count += (timer0_millis - m_current_running_task->m_last_execution);
#endif

    m_current_running_task->m_last_execution = timer0_millis;

#if OS48_ENABLE_CS_EVENTS == 1
    if (m_user_pre_context_switch_fnc != NULL)
      m_user_pre_context_switch_fnc();
#endif

    m_current_running_task->m_saved_sp = getSavedSP();

    if (m_current_running_task->m_state == StRunning)
      m_current_running_task->m_state = StQueuing;

    if (m_coop_next_task != NULL)
      m_current_running_task = m_coop_next_task;
    else
      m_current_running_task = schedule();

    m_current_running_task->m_state = StRunning;

    saveSP(m_current_running_task->m_saved_sp);

#if OS48_ENABLE_STACK_OVERFLOW == 1
    postStackOverflowDetection();
#endif

#if OS48_ENABLE_CS_EVENTS == 1
    if (m_user_post_context_switch_fnc != NULL)
      m_user_post_context_switch_fnc();
#endif

#if OS48_ENABLE_STATS == 1
    m_current_running_task->m_last_execution = timer0_millis;
#endif
  }
  else
  {
    initTimeSlot();
  }

  m_coop_next_task = NULL;
}

os48::Task* os48::Scheduler::scheduleCoop()
{
  if (m_current_running_task->getNextItem() == m_idle_task)
    return m_current_running_task->getNextItem()->getNextItem(); //chooses idle task again if no other task available
  else
    return m_current_running_task->getNextItem();
}

os48::Task* os48::Scheduler::schedulePreemptive()
{
  Task* nextTask = m_current_running_task->getNextItem();
  if (nextTask->m_priority < m_prior_task_sentinels[PrHighest]->m_priority)
    nextTask = m_prior_task_sentinels[PrHighest];

  if (nextTask == m_idle_task)
    m_remaining_time_slice = OS48_IDLE_TASK_TIME_SLICE;
  else
    OS48_DEFINE_PREEMPTIVE_TIME_SLICE_();

  return nextTask;
}

os48::Task* os48::Scheduler::scheduleRoundRobin()
{
  Task* nextTask = m_current_running_task->getNextItem();
  if (nextTask == m_idle_task)
    nextTask = nextTask->getNextItem(); //chooses idle task again if no other task available

  if (nextTask == m_idle_task)
    m_remaining_time_slice = OS48_IDLE_TASK_TIME_SLICE;
  else
    OS48_DEFINE_RROBIN_TIME_SLICE_(nextTask);

  return nextTask;
}

os48::Task* os48::Scheduler::schedulePriorityRandom()
{
  static uint8_t moduloRandom = (PrHighest * (PrHighest + 1));
  uint8_t randomNumber = timer0_millis % moduloRandom;
  TaskPriority priorityChosen = PrHighest;

  for (uint8_t pr = PrLowest; pr < PrHighest; ++pr)
  {
    if (randomNumber < pr * (pr + 1))
    {
      priorityChosen = (TaskPriority)pr;
      if (m_prior_task_sentinels[priorityChosen] != m_idle_task) //skips sentinels pointing on idle task
        break;
    }
  }

  Task* nextTask = m_prior_task_sentinels[priorityChosen];

  if (nextTask == m_idle_task)
  {
    m_remaining_time_slice = OS48_IDLE_TASK_TIME_SLICE;
  }
  else if (nextTask->getNextItem()->m_priority == priorityChosen) //there is at least 2 tasks for this priority in the queue
  {
    m_prior_task_sentinels[priorityChosen] = m_prior_task_sentinels[priorityChosen - 1]->getPreviousItem(); //take the last task of this priority
    m_prior_task_sentinels[priorityChosen]->moveBeforeQI(nextTask); //last task is now first task and the new sentinel
    redefinePrioritySentinels(priorityChosen, m_prior_task_sentinels[priorityChosen]);
    OS48_DEFINE_CONSTANT_TIME_SLICE_();
  }
  else
  {
    OS48_DEFINE_CONSTANT_TIME_SLICE_();
  }

  return nextTask;
}

os48::Task* os48::Scheduler::scheduleIntelligent()
{
  Task* firstTask = m_current_running_task->getNextItem();

  if (firstTask == m_idle_task) //skip the idle task
  {
    firstTask = firstTask->getNextItem();
    if (firstTask == m_idle_task) //there is only the idle task
    {
      m_remaining_time_slice = OS48_IDLE_TASK_TIME_SLICE;
      return m_idle_task;
    }
  }

  Task* currentTask = firstTask;
  Task* bestScoreTask = firstTask;
  uint16_t currentScore;
  uint16_t bestScore = 0; //commonly ~10 -> ~60

  do
  {
    currentScore = currentTask->m_priority * 10 + ((uint16_t) ((uint16_t)timer0_millis - currentTask->m_last_execution)) / 100;
    if (currentTask->m_message_sentinel.getNextQI() != &(currentTask->m_message_sentinel)) //message(s) are pending
      currentScore += 20;

    if (currentScore > bestScore)
    {
      bestScore = currentScore;
      bestScoreTask = currentTask;
    }

    currentTask = currentTask->getNextItem();
    if (currentTask == m_idle_task)
      currentTask = currentTask->getNextItem();
  } while (currentTask != firstTask);

  m_remaining_time_slice = bestScore * 4; //commonly  ~ 40ms -> ~240ms

  return bestScoreTask;
}

//friend functions

inline void os48::tick()
{
  os48SAVE_CONTEXT_ISR();

  os48::Scheduler::saveCurrentSP();
  os48::Scheduler::setSPToKernelArea(); // sets SP to kernel memory area

#if OS48_ENABLE_KT_EVENTS == 1
  if (OS48_ISCHDL->m_user_kernel_tick_enter_fnc != NULL)
    OS48_ISCHDL->m_user_kernel_tick_enter_fnc();
#endif

  --(OS48_ISCHDL->m_remaining_time_slice);
  if (!OS48_ISCHDL->m_remaining_time_slice)
    OS48_ISCHDL->doScheduleProcess();
#if OS48_CHECK_SLEEPING_TASKS_AT_EACH_TICK == 1
  else //checks if we have to schedule because a task needs to be waked up
    OS48_ISCHDL->doSleepingTasksProcess();
#elif OS48_CHECK_SLEEPING_TASKS_AT_EACH_TICK == 2
  else
  {
    OS48_ISCHDL->doSleepingTasksProcess();
    if (OS48_ISCHDL->shouldYield())
      OS48_ISCHDL->doScheduleProcess();
  }
#elif OS48_CHECK_SLEEPING_TASKS_AT_EACH_TICK == 3
  else if (OS48_ISCHDL->isATaskShouldBeAwake()) //checks if we have to schedule because a task needs to be waked up
    OS48_ISCHDL->doScheduleProcess();
#endif

#if OS48_ENABLE_KT_EVENTS == 1
  if (OS48_ISCHDL->m_user_kernel_tick_exit_fnc != NULL)
    OS48_ISCHDL->m_user_kernel_tick_exit_fnc();
#endif

  os48::Scheduler::restoreSavedSP(); // restore SP

  os48RESTORE_CONTEXT();

  asm volatile ("reti");
}

inline void os48::inlineInternalYield()
{
  os48SAVE_CONTEXT();

  os48::Scheduler::saveCurrentSP();
  os48::Scheduler::setSPToKernelArea(); // sets SP to kernel memory area  

  OS48_ISCHDL->doScheduleProcess();

  os48::Scheduler::restoreSavedSP(); // restore SP
  os48RESTORE_CONTEXT();
  
  asm volatile ("ret");
}

//end of friend functions

ISR(TIMER0_COMPA_vect, ISR_NAKED)
{
  os48::tick();
}

#undef OS48_ISCHDL
