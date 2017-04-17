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

#include "Mutex.h"
#include "Task.h"
#include "Scheduler.h"

#define OS48_ISCHDL os48::Scheduler::get()

os48::Mutex::Mutex()
  : Sync(), m_owner(NULL), m_recursive_call_counter(0)
{
  m_sync_type = SyncTypeMutex;
}

os48::Mutex::Mutex(SyncReleaseMode syncReleaseMode)
  : Sync(syncReleaseMode), m_owner(NULL), m_recursive_call_counter(0)
{
  m_sync_type = SyncTypeMutex;
}

void os48::Mutex::wait()
{
  //checks priority for priority inheritance
  if (OS48_ISCHDL->m_current_running_task->m_priority > m_owner->m_priority)
  {
    m_owner->internalSetPriority(OS48_ISCHDL->m_current_running_task->m_priority);
  }

  Sync::wait();
}

bool os48::Mutex::tryLock()
{
  OS48_KERNEL_SAFETY_BLOCK
  {
    if (m_owner != NULL && m_owner != OS48_ISCHDL->m_current_running_task)
    {
      return false;
    }

    lock();
  }

  return true;
}

void os48::Mutex::lock()
{
  OS48_KERNEL_SAFETY_BLOCK
  {
    if (m_owner == OS48_ISCHDL->m_current_running_task)
    {
      ++m_recursive_call_counter;
    }
    else
    {
      while (m_owner != NULL)
        wait();

      m_owner = OS48_ISCHDL->m_current_running_task;
      m_owner->m_sync_object = this;
      m_recursive_call_counter = 1;
      m_owner_priority = m_owner->m_priority;
    }
  }
}

void os48::Mutex::unlock()
{
  OS48_KERNEL_SAFETY_BLOCK
  {
    if (m_owner == OS48_ISCHDL->m_current_running_task)
    {
      --m_recursive_call_counter;

      if (m_recursive_call_counter == 0)
      {
        m_owner->internalSetPriority(m_owner_priority); //redefine original priority
        m_owner->m_sync_object = NULL;
        m_owner = NULL;
        releaseOne();
      }
    }
  }
}

void  os48::Mutex::reset()
{
  OS48_KERNEL_SAFETY_BLOCK
  {
    m_owner->internalSetPriority(m_owner_priority); //redefine original priority
    m_owner->m_sync_object = NULL;
    m_owner = NULL;
    m_recursive_call_counter = 0;
    releaseAll();
  }
}

#undef OS48_ISCHDL

