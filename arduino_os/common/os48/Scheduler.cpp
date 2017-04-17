/*
 *  The MIT License (MIT)
 *
 *  Copyright (c) 2015 DEMIRDJIAN Yves
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *
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
#include "TaskTimer.h"
#include "TaskWorkQueue.h"
#include "Message.h"
#include "Scheduler_context.cpp"

#define OS48_ISCHDL os48::Scheduler::get()

os48::Scheduler os48::Scheduler::m_instance = Scheduler();

volatile uintptr_t os48::Scheduler::s_saved_SP = 0;

os48::Scheduler::Scheduler()
  :
  m_kernel_tick_frequency(-1),
  m_remaining_time_slice(1),
  m_last_error(SchErrNone),
  m_current_running_task(NULL),
  m_coop_next_task(NULL),
  m_user_overflow_fnc(&blackHole),
#if OS48_ENABLE_CS_EVENTS == 1
  m_user_pre_context_switch_fnc(NULL),
  m_user_post_context_switch_fnc(NULL),
#endif
#if OS48_ENABLE_KT_EVENTS == 1
  m_user_kernel_tick_enter_fnc(NULL),
  m_user_kernel_tick_exit_fnc(NULL),
#endif
  m_idle_user_fnc(NULL)
{
  __malloc_margin = OS48_KERNEL_STACK_SIZE; //size of kernel memory area

  //defines the dynamic memory limit to allow memory allocation beyond brkval, the main stack is no longer appropriate to be used (virtual stacks are created for each task)
  if (!__malloc_heap_end)
    __malloc_heap_end = (char*) (RAMEND - __malloc_margin);

  m_scheduling_policy = SchPolicyRoundRobin;
  m_schedule_fnc_addrs[SchPolicyCoop] = &Scheduler::scheduleCoop;
  m_schedule_fnc_addrs[SchPolicyPreemptive] = &Scheduler::schedulePreemptive;
  m_schedule_fnc_addrs[SchPolicyRoundRobin] = &Scheduler::scheduleRoundRobin;
  m_schedule_fnc_addrs[SchPolicyRandomPriority] = &Scheduler::schedulePriorityRandom;
  m_schedule_fnc_addrs[SchPolicyIntelligent] = &Scheduler::scheduleIntelligent;

  initIdleTask();

  m_prior_task_sentinels[PrIdle] = m_idle_task;
  m_prior_task_sentinels[PrLow] = m_prior_task_sentinels[PrIdle];
  m_prior_task_sentinels[PrBelowNormal] = m_prior_task_sentinels[PrIdle];
  m_prior_task_sentinels[PrNormal] = m_prior_task_sentinels[PrIdle];
  m_prior_task_sentinels[PrAboveNormal] = m_prior_task_sentinels[PrIdle];
  m_prior_task_sentinels[PrHigh] = m_prior_task_sentinels[PrIdle];
}

os48::Scheduler::~Scheduler() {}


os48::Task* os48::Scheduler::createTask(void_fnc_t fnc, size_t stackSize, TaskPriority priority /* = PrNormal */, bool autoStart /* = true */)
{
  clrLastError();

  if (fnc == NULL || priority < PrLowest || priority > PrHighest)
  {
    setLastError(SchErrArgs);
    return NULL;
  }

  OS48_KERNEL_SAFETY_BLOCK
  {
    clrLastError();

    Task* task = new Task((uintptr_t) fnc, stackSize);

    if (task == NULL)
    {
      setLastError(SchErrAlloc);
      return NULL;
    }

    if (task->m_state == StCorrupted)
    {
      setLastError(SchErrTaskCorrupted);
      return NULL;
    }

    initTask(task, priority, autoStart);

    return task;
  }

  return NULL;
}

os48::TaskTimer* os48::Scheduler::createTaskTimer(bool_fnc_t fnc, size_t stackSize, uint32_t period /* = 1000 */, TaskPriority priority /* = PrNormal */, bool delayFirst /* = true */, bool autoStart /* = true */)
{
  clrLastError();

  if (fnc == NULL || priority < PrLowest || priority > PrHighest)
  {
    setLastError(SchErrArgs);
    return NULL;
  }

  OS48_KERNEL_SAFETY_BLOCK
  {
    clrLastError();

    TaskTimer* task = new TaskTimer(fnc, stackSize, period, delayFirst);

    if (task == NULL)
    {
      setLastError(SchErrAlloc);
      return NULL;
    }

    if (task->m_state == StCorrupted)
    {
      setLastError(SchErrTaskCorrupted);
      return NULL;
    }

    initTask(task, priority, autoStart);

    return task;
  }

  return NULL;
}


os48::TaskWorkQueue* os48::Scheduler::createTaskWorkQueue(size_t stackSize, TaskPriority priority /* = PrNormal */, bool autoStart /* = true */)
{
  clrLastError();

  if (priority < PrLowest || priority > PrHighest)
  {
    setLastError(SchErrArgs);
    return NULL;
  }

  OS48_KERNEL_SAFETY_BLOCK
  {
    clrLastError();

    TaskWorkQueue* task = new TaskWorkQueue(stackSize);

    if (task == NULL)
    {
      setLastError(SchErrAlloc);
      return NULL;
    }

    if (task->m_state == StCorrupted)
    {
      setLastError(SchErrTaskCorrupted);
      return NULL;
    }

    initTask(task, priority, autoStart);

    return task;
  }

  return NULL;
}

bool os48::Scheduler::deleteTask(os48::Task* task)
{
  clrLastError();

  if (task == NULL || task == m_idle_task)
  {
    setLastError(SchErrArgs);
    return false;
  }

  OS48_KERNEL_SAFETY_BLOCK
  {
    task->releaseFromAllResources(StDeleted);

    delete task;

    if (m_current_running_task == task)
    {
      m_current_running_task = schedule();
      setSP(m_current_running_task->m_saved_sp);
      os48RESTORE_CONTEXT();

      asm volatile ("ret");
    }
  }

  return true;
}

void os48::Scheduler::setStackOverflowFnc(void_fnc_t overflowFnc /* = NULL */)
{
  OS48_KERNEL_SAFETY_BLOCK
  {
    if (overflowFnc == NULL)
      m_user_overflow_fnc = &blackHole;
    else
      m_user_overflow_fnc = overflowFnc;
  }
}

#if OS48_ENABLE_CS_EVENTS == 1

void os48::Scheduler::setPreContextSwitchFnc(void_fnc_t fnc /* = NULL */)
{
  OS48_KERNEL_SAFETY_BLOCK
  {
    m_user_pre_context_switch_fnc = fnc;
  }
}

void os48::Scheduler::setPostContextSwitchFnc(void_fnc_t fnc /* = NULL */)
{
  OS48_KERNEL_SAFETY_BLOCK
  {
    m_user_post_context_switch_fnc = fnc;
  }
}

#endif //#if OS48_ENABLE_CS_EVENTS == 1

#if OS48_ENABLE_KT_EVENTS == 1

void os48::Scheduler::setKernelTickEnterFnc(void_fnc_t fnc /* = NULL */)
{
  OS48_KERNEL_SAFETY_BLOCK
  {
    m_user_kernel_tick_enter_fnc = fnc;
  }
}

void os48::Scheduler::setKernelTickExitFnc(void_fnc_t fnc /* = NULL */)
{
  OS48_KERNEL_SAFETY_BLOCK
  {
    m_user_kernel_tick_exit_fnc = fnc;
  }
}

#endif //#if OS48_ENABLE_KT_EVENTS == 1

void os48::Scheduler::setIdleUserFnc(void_fnc_t idleUserFnc /* = NULL */)
{
  OS48_KERNEL_SAFETY_BLOCK
  {
    m_idle_user_fnc = idleUserFnc;
  }
}

bool os48::Scheduler::setSchedulingPolicy(SchedulingPolicy schedulingPolicy)
{
  clrLastError();

  if (schedulingPolicy > 4)
  {
    setLastError(SchErrArgs);
    return false;
  }

  OS48_KERNEL_SAFETY_BLOCK
  {
    m_scheduling_policy = schedulingPolicy;
    if (isStarted())
    {
      if (schedulingPolicy == SchPolicyCoop && OS48_IS_KERNEL_TICK_ENABLED())
      {
        OS48_STOP_KERNEL_TICK();
      }
      else if (schedulingPolicy != SchPolicyCoop && !OS48_IS_KERNEL_TICK_ENABLED())
      {
        m_remaining_time_slice = 1;
        OS48_START_KERNEL_TICK();
      }
    }
  }

  return true;
}

void os48::Scheduler::start()
{
  // timer configuration, don't touch to TCNT because it used in arduino lib to calculate time
  OCR0A = 255;
  SREG = 0x00;

  m_kernel_tick_frequency = getMCUFrequency() / (double) ((OS48_TIMER_COUNTER + 1) * OS48_TIMER_PRESCALER);

  // sets up the sleep mode to power save during the idle task execution
  sleep_enable();
  set_sleep_mode(SLEEP_MODE_IDLE);

  //launch the fnc by setting sp at the right location (launches the highest priority fnc)
  m_current_running_task = m_prior_task_sentinels[PrHighest];
  m_current_running_task->m_state = StRunning;

  while (TCNT0 != 0x00)
  {} //wait that the fast pwm mode configured on timer 0 update the register at 0x47 SRAM location (OCR0A)

  if (m_scheduling_policy != SchPolicyCoop)
  {
    initTimeSlot();

    cli();
    OS48_START_KERNEL_TICK();
  }

  cli();
  setSP(OS48_GET_SP_ADDR_TO_SAVED_PC(m_current_running_task->m_saved_sp));
  asm volatile ("reti");
}

bool os48::Scheduler::stop(void_fnc_t stop_fnc)
{
  clrLastError();

  if (stop_fnc == NULL)
  {
    setLastError(SchErrArgs);
    return false;
  }

  OS48_KERNEL_SAFETY_BLOCK
  {
    OS48_STOP_KERNEL_TICK();

    m_kernel_tick_frequency = -1;

    if (m_current_running_task != NULL)
    {
      m_current_running_task->m_state = StQueuing;
      m_current_running_task = NULL;
    }

    setSPToKernelArea();
  }

  stop_fnc();
  blackHole();

  return true;
}

void os48::Scheduler::yield()
{
  //note to me: don't save TCNT0 because arduino lib uses it and it's confusing
  if (m_scheduling_policy == SchPolicyCoop)
  {
    bool ecs = os48_enable_context_switch(); //ebables context switch
    internalYieldForYieldFnc();
    __csRestore(&ecs); //restore context switch previous state
  }
  else
  {
    byte tmpSREG = SREG; cli();

    bool ekt = os48_start_kernel_tick();
    bool ecs = os48_enable_context_switch(); //ebables context switch

    internalYieldForYieldFnc();

    //restore previous state
    __csRestore(&ecs); //restore context switch previous state
    if (m_scheduling_policy != SchPolicyCoop)
      __ktRestore(&ekt);

    SREG = tmpSREG;
  }
}

//should not be used in preemptive modes
bool os48::Scheduler::yieldTo(Task * task, bool delayed /* = false */)
{
  OS48_KERNEL_SAFETY_BLOCK
  {
    clrLastError();

    if (m_scheduling_policy != SchPolicyCoop)
    {
      setLastError(SchErrWrongSchedulingPolicy);
      return false;
    }

    if (! (task->isAlive()))
    {
      setLastError(SchErrTaskIncorrectState);
      return false;
    }

    m_coop_next_task = task;

    if (! (delayed))
      this->yield();
  }

  return true;
}

bool os48::Scheduler::isATaskShouldBeAwake()
{
  QueueItem<Task>* current_qi = m_sleeping_task_sentinel.getNextQI();
  if (current_qi != &m_sleeping_task_sentinel &&
      (timer0_millis - current_qi->getItem()->m_start_time_sleep) >= current_qi->getItem()->m_sleep_duration)
    return true;

  return false;
}

void os48::Scheduler::sendMessage(Task* to, Message* msg)
{
  if (msg == NULL)
    return;

  OS48_KERNEL_SAFETY_BLOCK
  {
    msg->linkAfterQI(&(to->m_message_sentinel));

    if (to->m_state == StWaitingMsg &&
    (to->m_message_code_expecting == 0 || to->m_message_code_expecting == msg->getCode()))
    {
      to->resume();
    }
  }
}

#if OS48_ENABLE_STATS == 1
void os48::Scheduler::print(HardwareSerial& serial)
{
  serial.print(F("Scheduling algorithm: "));
  switch (m_scheduling_policy)
  {
    case SchPolicyCoop:
      serial.println(F("SchPolicyCoop"));
      break;
    case SchPolicyPreemptive:
      serial.println(F("SchPolicyPreemptive"));
      break;
    case SchPolicyRoundRobin:
      serial.println(F("SchPolicyRoundRobin"));
      break;
    case SchPolicyRandomPriority:
      serial.println(F("SchPolicyRandomPriority"));
      break;
    case SchPolicyIntelligent:
      serial.println(F("SchPolicyIntelligent"));
      break;
    default:
      serial.println(F("???"));
  }

  serial.print(F("Time elapsed: "));
  serial.println(timer0_millis);
}
#endif

#undef OS48_ISCHDL

