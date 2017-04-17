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

#include "TaskWorkQueue.h"
#include "Scheduler.h"
#include "Sync.h"
#include "Work.h"

#define OS48_ISCHDL os48::Scheduler::get()

void os48::taskworkqueue_do()
{
  QueueItem<Work>* current = NULL;
  Work* currentWork = NULL;
  for (;;)
  {
    OS48_KERNEL_SAFETY_BLOCK
    {
      while (taskWQ()->m_work_queue_size == 0)
        OS48_ISCHDL->dequeuingAliveTaskAndYield(taskWQ(), StWaitingWork);
    }

    current = taskWQ()->m_work_sentinel.getNextQI();
    currentWork = current->getItem();

    OS48_KERNEL_SAFETY_BLOCK
    {
      if (currentWork->getState() == WkStCancelled)
      {
        current->unlinkQI();

        --(taskWQ()->m_work_queue_size);

        if (currentWork->m_flags & 0x02) //auto delete
          delete currentWork;

        continue;
      }
      else
      {
        currentWork->m_state = WkStRunning;
      }
    }

    currentWork->m_result = ((work_fnc_t)currentWork->getFunc())();

    OS48_KERNEL_SAFETY_BLOCK
    {
      current->unlinkQI();

      --(taskWQ()->m_work_queue_size);

      if (currentWork->getState() != WkStCancelled)
      {
        currentWork->m_state = WkStTerminated;

        if (currentWork->m_sync_instance != NULL)
          currentWork->m_sync_instance->releaseAll();
      }

      if (currentWork->m_flags & 0x02) //auto delete
        delete currentWork;

    }
  }
}

void os48::TaskWorkQueue::releaseFromAllResources(TaskState nextState)
{
  OS48_KERNEL_SAFETY_BLOCK
  {
    m_work_queue_size = 0;
    QueueItem<Work>* current = NULL;
    while (m_work_sentinel.getNextQI() != &m_work_sentinel)
    {
      current = m_work_sentinel.getNextQI();

      if (current->getItem()->getState() == WkStQueuing)
        current->unlinkQI();

      current->getItem()->cancel();
    }
  }

  Task::releaseFromAllResources(nextState);
}

os48::TaskWorkQueue::TaskWorkQueue(size_t stackSize)
  : Task((uintptr_t) & taskworkqueue_do, stackSize), m_work_queue_size(0)
{
}

os48::TaskWorkQueue::~TaskWorkQueue()
{
}

bool os48::TaskWorkQueue::addWork(Work& work, bool urgent /* = false*/, bool autoDelete /* = false*/)
{
  OS48_KERNEL_SAFETY_BLOCK
  {
    clrLastError();

    if (work.getState() != WkStNotAttached)
    {
      setLastError(TskErrIncorrectWorkState);
      return false;
    }

    if (urgent)
      work.linkAfterQI(&m_work_sentinel);
    else
      work.linkBeforeQI(&m_work_sentinel);

    work.m_state = WkStQueuing;

    if (autoDelete)
      work.m_flags |= 0x02;

    if (m_state == StWaitingWork)
    {
      OS48_ISCHDL->queuingNonAliveTask(this);
      OS48_ISCHDL->priorityYield(); //yields only if there is a higher priority task ready (depending of the scheduling policy)
    }

    ++m_work_queue_size;
  }

  return true;
}

#undef OS48_ISCHDL


