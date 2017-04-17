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

#include "Barrier.h"
#include "Scheduler.h"

os48::Barrier::Barrier(uint8_t threshold)
  : Sync(), m_counter(0), m_threshold(threshold), m_auto_reset(false)
{
  m_sync_type = SyncTypeBarrier;   
}

os48::Barrier::Barrier(uint8_t threshold, bool autoReset)
  : Sync(), m_counter(0), m_threshold(threshold), m_auto_reset(autoReset)
{
  m_sync_type = SyncTypeBarrier; 
}

os48::Barrier::Barrier(uint8_t threshold, bool autoReset, SyncReleaseMode syncReleaseMode)
  : Sync(syncReleaseMode), m_counter(0), m_threshold(threshold), m_auto_reset(autoReset)
{
  m_sync_type = SyncTypeBarrier; 
}

void os48::Barrier::wait()
{
  OS48_KERNEL_SAFETY_BLOCK
  {
    ++m_counter;
    
    if (m_counter == m_threshold)
    {
      if (m_auto_reset)
        m_counter = 0;
      
      releaseAll();
    }
    else if (m_counter < m_threshold) //this cond is necessary to not release all tasks each time if m_counter > m_threshold
    {
      Sync::wait();
    }
  }
}

void os48::Barrier::reset()
{
  OS48_KERNEL_SAFETY_BLOCK
  {
    m_counter = 0;
    releaseAll();
  }
}

