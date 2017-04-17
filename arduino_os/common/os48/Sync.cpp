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

#include "Sync.h"
#include "Task.h"
#include "Scheduler.h"

#define OS48_ISCHDL os48::Scheduler::get()

os48::Sync::Sync()
  : m_sync_type(SyncTypeEvent), m_sync_release_mode(SyncRMFirstInFirstOut)
{

}

os48::Sync::Sync(SyncReleaseMode syncReleaseMode)
  : m_sync_type(SyncTypeEvent), m_sync_release_mode(syncReleaseMode)
{

}

void os48::Sync::addTaskInPendingQueue(os48::Task* task)
{
  QueueItem<Task>* current_qi = &m_pending_task_sentinel;

  if (m_sync_release_mode == SyncRMHighestPriority) //if true, order the queue by priority desc
  {
    current_qi = m_pending_task_sentinel.getNextQI();

    while (current_qi != &m_pending_task_sentinel)
    {
      if (current_qi->getItem()->m_priority > task->m_priority)
        break;

      current_qi = current_qi->getNextQI();
    }
  }

  task->m_sync_object = this;
  task->linkBeforeQI(current_qi);
}

void os48::Sync::removeTaskFromPendingQueue(os48::Task* task)
{
  task->m_sync_object = NULL;
  task->unlinkQI();
}

bool os48::Sync::wait()
{
  OS48_KERNEL_SAFETY_BLOCK
  {  
    OS48_ISCHDL->dequeuingAliveTask(OS48_ISCHDL->m_current_running_task, StSyncPending);
    Task* nextTask = OS48_ISCHDL->schedule();
    
    addTaskInPendingQueue(OS48_ISCHDL->m_current_running_task);
    OS48_ISCHDL->internalYieldTo(nextTask);
  }

  return true;
}

bool os48::Sync::releaseOne()
{
  OS48_KERNEL_SAFETY_BLOCK
  {
    QueueItem<Task>* nextTask = m_pending_task_sentinel.getNextQI();
    if (nextTask != &m_pending_task_sentinel)
    {
      removeTaskFromPendingQueue(nextTask->getItem());
      OS48_ISCHDL->queuingNonAliveTask(nextTask->getItem());
      OS48_ISCHDL->priorityYield(); //yields only if there is a higher priority task ready (depending of the scheduling policy)
      return true;
    }
  }

  return false;
}

void os48::Sync::releaseAll()
{
  OS48_KERNEL_SAFETY_BLOCK
  {
    QueueItem<Task>* currentTask = m_pending_task_sentinel.getNextQI();
    QueueItem<Task>* nextTask = NULL;
    
    while (currentTask != &m_pending_task_sentinel)
    {
      removeTaskFromPendingQueue(currentTask->getItem());
      nextTask = currentTask->getNextQI();
      OS48_ISCHDL->queuingNonAliveTask(currentTask->getItem());
      currentTask = nextTask;
    }
    
    OS48_ISCHDL->priorityYield(); //yields only if there is a higher priority task ready (depending of the scheduling policy)
  }
}

#undef OS48_ISCHDL
