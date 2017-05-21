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

#include "TaskTimer.h"
#include "Scheduler.h"

void os48::tasktimer_do()
{
  uint32_t delta = 0;
  uint32_t next_expiration;

  OS48_ATOMIC_BLOCK
  {
    next_expiration = timer0_millis + taskT()->m_tasktimer_period;
  }

  if (!(taskT()->m_delay_first))
    taskT()->m_tasktimer_user_fnc();

  for (;;)
  {
    OS48_ATOMIC_BLOCK
    {
      delta = next_expiration - timer0_millis;

      next_expiration += taskT()->m_tasktimer_period;

      if (delta > 0 && delta <= taskT()->m_tasktimer_period)
        taskT()->sleep(delta);
    }

    if (! (taskT()->m_tasktimer_user_fnc()))
      return;
  }
}

os48::TaskTimer::TaskTimer(bool_fnc_t fnc, size_t stackSize, uint32_t period, bool delayFirst /* = true */)
  : Task((uintptr_t) & tasktimer_do, stackSize), m_tasktimer_user_fnc(fnc), m_tasktimer_period(period), m_delay_first(delayFirst)
{
}

void os48::TaskTimer::setPeriod(uint32_t period)
{
  OS48_ATOMIC_BLOCK
  {
    m_tasktimer_period = period;
  }
}


