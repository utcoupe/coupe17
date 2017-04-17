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

#include "Semaphore.h"
#include "Scheduler.h"

os48::Semaphore::Semaphore()
  : Sync(), m_counter(0), m_max_task(1)
{
  m_sync_type = SyncTypeEvent;
}

os48::Semaphore::Semaphore(uint8_t maxTask)
  : Sync(), m_counter(0), m_max_task(maxTask)
{
  m_sync_type = SyncTypeEvent;
}

os48::Semaphore::Semaphore(uint8_t max_task, SyncReleaseMode syncReleaseMode)
  : Sync(syncReleaseMode), m_max_task(max_task)
{
  m_sync_type = SyncTypeEvent;
}

bool os48::Semaphore::tryAcquire()
{
  OS48_KERNEL_SAFETY_BLOCK
  {
    if (m_counter >= m_max_task)
    {
      return false;
    } 

     acquire();
  } 

  return true;
}

void os48::Semaphore::acquire()
{
  OS48_KERNEL_SAFETY_BLOCK
  {
    while (m_counter >= m_max_task)
      wait();

    ++m_counter;
  }
}

void os48::Semaphore::release()
{
  OS48_KERNEL_SAFETY_BLOCK
  {
    if (m_counter > 0)
      --m_counter;

    releaseOne();
  }
}

void os48::Semaphore::releaseAll()
{
  OS48_KERNEL_SAFETY_BLOCK
  {
    m_counter = 0;
    Sync::releaseAll();
  }
}

