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

#include "Task.h"
#include "Mutex.h"
#include "Message.h"
#include "Scheduler.h"

#define OS48_ISCHDL os48::Scheduler::get()

os48::Task::Task(uintptr_t fnc_addr, size_t stack_size)
  : QueueItem<Task>(this),
    m_id(0),
    m_millis_count(0),
    m_last_execution(0),
    m_sync_object(NULL),
    m_flags(0),
    m_message_code_expecting(0)
{
  stack_size += OS48_MINIMAL_TASK_STACK_SIZE;

  m_id = s_id_counter++;

  m_priority = PrNormal;

  m_stack = malloc(stack_size);

  if (m_stack == NULL)
  {
    setLastError(TskErrAlloc);
    m_state = StCorrupted;
    return;
  }

  m_stack_size = stack_size;

  setupStack(fnc_addr);

  m_state = StNotStarted;
}

os48::Task::~Task()
{
  free(m_stack);
}

void os48::Task::setupStack(uintptr_t fncAddr)
{
  m_fnc_addr = fncAddr;

  // sets SREG to 0x80 (after r0, ret addr, end of task addr and task mask)
  *((uint8_t*) (getStackStartAddr() - OS48_TASK_MASK_SIZE - 2 * OS48_ADDR_SIZE - 1)) = 0x80;

  // sets r1 to 0 (after SREG and r0, ret addr, end of task addr and task mask)
  *((uint8_t*) (getStackStartAddr() - OS48_TASK_MASK_SIZE - 2 * OS48_ADDR_SIZE - 31)) = 0x00;

  // sets the first return addr (the addr of the user function) in the stack as the return of the ISR
  *((uint8_t*) (getStackStartAddr() - OS48_TASK_MASK_SIZE - OS48_ADDR_SIZE)) = m_fnc_addr;
  *((uint8_t*) (getStackStartAddr() - OS48_TASK_MASK_SIZE - OS48_ADDR_SIZE - 1)) = m_fnc_addr >> 8;
#if OS48_ADDR_SIZE == 3
  *((uint8_t*) (getStackStartAddr() - OS48_TASK_MASK_SIZE - OS48_ADDR_SIZE - 2)) = 0x0; //(gcc use the trampoline section, the fnc beyond 128k are stored in reachable 16bits jmp addrs)
#endif

  // sets the addr of the terminate task function
  *((uint8_t*) (getStackStartAddr() - OS48_TASK_MASK_SIZE)) = (uintptr_t) &Scheduler::terminateTask;
  *((uint8_t*) (getStackStartAddr() - OS48_TASK_MASK_SIZE - 1)) = ((uintptr_t) &Scheduler::terminateTask) >> 8;
#if OS48_ADDR_SIZE == 3
  *((uint8_t*) (getStackStartAddr() - OS48_TASK_MASK_SIZE - 2)) = 0x0; //(gcc use the trampoline section, the fnc beyond 128k are stored in reachable 16bits jmp addrs);
#endif

  // sets the stack task mask (id of the task) (to identify the beginning of the stack of the task)
  *((uint8_t*) (getStackStartAddr())) = m_id;
  // sets the stack task mask (id of the task) (to identify the end of the stack of the task)
  *((uint8_t*) ((uintptr_t) m_stack)) = m_id;

  m_saved_sp = getStackStartAddr() - (OS48_CONTEXT_SWITCHING_MEM_TOTAL_SIZE + OS48_EXTRA_SIZE_START_TASK_STACK);
}

void os48::Task::releaseFromAllResources(TaskState nextState)
{
  if (isAlive())
  {
    OS48_ISCHDL->dequeuingAliveTask(this, nextState);
  }
  else if (m_flags & OS48_TASK_FLAG_BLOCKED_TIMEOUT)
  {
    OS48_ISCHDL->removeTaskFromSleepingQueue(this);
    m_state = nextState;
  }

  if (m_sync_object != NULL)
  {
    if (m_state == StSyncPending)
    {
      m_sync_object->removeTaskFromPendingQueue(this);
    }
    else
    {
      if (m_sync_object->getSyncType() == SyncTypeMutex)
      {
        ((Mutex*) m_sync_object)->reset();
      }
    }

    m_sync_object = NULL;

    m_state = nextState;
  }
}

void os48::Task::internalSetPriority(TaskPriority priority)
{
  if (priority == m_priority)
    return;

  if (isAlive())
  {
    // redefine the current corresponding sentinel
    if (this == OS48_ISCHDL->m_prior_task_sentinels[m_priority])
      OS48_ISCHDL->m_prior_task_sentinels[m_priority] = getNextItem();

    moveBeforeQI(OS48_ISCHDL->m_prior_task_sentinels[priority]);
    OS48_ISCHDL->m_prior_task_sentinels[priority] = this;
    OS48_ISCHDL->redefinePrioritySentinels(priority, this);
  }

  m_priority = priority;
}

void os48::Task::internalReset(uintptr_t fncAddr, bool autoStart)
{
  OS48_KERNEL_SAFETY_BLOCK
  {
    releaseFromAllResources(StNotStarted);

    m_flags = 0;

    setupStack(fncAddr);

    m_state = StNotStarted;

    if (autoStart)
      OS48_ISCHDL->queuingNonAliveTask(this);

    if (OS48_ISCHDL->m_current_running_task == this)
      OS48_ISCHDL->yield();
  }
}

os48::Message* os48::Task::internalGetMessage(uint8_t code, bool unlink /* = true*/)
{
  OS48_KERNEL_SAFETY_BLOCK
  {
    QueueItem<Message>* current_msg = m_message_sentinel.getNextQI();
    while (current_msg != &m_message_sentinel)
    {
      if ((code == 0 || current_msg->getItem()->getCode() == code))
      {
        if (unlink)
        {
          current_msg->unlinkQI();
          current_msg->cleanQI();
        }
        return current_msg->getItem();
      }
      current_msg = current_msg->getNextQI();
    }
  }

  return NULL;
}

void os48::Task::internalBlock(uint32_t millis, TaskState nextState)
{
  if (millis == 0)
  {
    OS48_ISCHDL->dequeuingAliveTaskAndYield(this, nextState);
  }
  else
  {
    m_flags |= OS48_TASK_FLAG_BLOCKED_TIMEOUT;

    if (m_state == StRunning)
    {
      if (OS48_ISCHDL->m_scheduling_policy == SchPolicyCoop)
      {
        OS48_NON_ATOMIC_BLOCK
        {
          delay(millis);
        }
      }
      else if (millis < 1000.0 / OS48_ISCHDL->getKernelTickFrequency())
      {
        delayMicroseconds(millis * 1000);
      }
      else
      {
        m_start_time_sleep = timer0_millis;
        m_sleep_duration = millis;
        OS48_ISCHDL->dequeuingAliveTask(this, nextState);
        Task* nextTask = OS48_ISCHDL->schedule();
        OS48_ISCHDL->addTaskInSleepingQueue(this);
        OS48_ISCHDL->internalYieldTo(nextTask);
      }
    }
    else
    {
      m_start_time_sleep = timer0_millis;
      m_sleep_duration = millis;
      OS48_ISCHDL->dequeuingAliveTask(this, nextState);
      OS48_ISCHDL->addTaskInSleepingQueue(this);
    }

    //m_flags &= ~OS48_TASK_FLAG_BLOCKED_TIMEOUT; //do not uncomment: automatically reset to 0 by Scheduler::removeTaskFromSleepingQueue()
  }
}

void os48::Task::internalUnblock()
{
  if (m_flags & OS48_TASK_FLAG_BLOCKED_TIMEOUT)
    OS48_ISCHDL->removeTaskFromSleepingQueue(this);

  OS48_ISCHDL->queuingNonAliveTask(this);
  OS48_ISCHDL->priorityYield(); //yields only if there is a higher priority task ready (depending of the scheduling policy)
}

#undef OS48_ISCHDL




