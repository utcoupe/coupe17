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

#include <avr/sleep.h>

inline os48::Task* os48::task()
{
  return Scheduler::get()->getRunningTask();
}

inline os48::TaskTimer* os48::taskT()
{
  return (TaskTimer*) Scheduler::get()->getRunningTask();
}

inline os48::TaskWorkQueue* os48::taskWQ()
{
  return (TaskWorkQueue*) Scheduler::get()->getRunningTask();
}

inline void os48::Scheduler::blackHole()
{
  for (;;) {}
}

inline void os48::Scheduler::saveCurrentSP()
{
  s_saved_SP = SP;
  /*
  s_saved_SP = SPH << 8;
  s_saved_SP |= SPL;
  */
}

inline void os48::Scheduler::saveSP(uintptr_t SPvalue)
{
  s_saved_SP = SPvalue;
}

inline uintptr_t os48::Scheduler::getSavedSP()
{
  return s_saved_SP;
}

inline void os48::Scheduler::restoreSavedSP()
{
  SP = s_saved_SP;
  /*
  SPH = s_saved_SP >> 8;
  SPL = s_saved_SP;
  */
}

inline void os48::Scheduler::setSP(uintptr_t SPvalue)
{
  SP = SPvalue;
  /*
  SPH = SPvalue >> 8;
  SPL = SPvalue;
  */
}

inline void os48::Scheduler::setSPToKernelArea()
{
  setSP(RAMEND);
}

inline uintptr_t os48::Scheduler::getSP()
{
  return SP; //SPH << 8 | SPL;
}

inline void os48::Scheduler::MCUSleep()
{
  sei();
  sleep_mode();
}

inline os48::Scheduler* os48::Scheduler::get()
{
  return &m_instance;
}

inline uint32_t os48::Scheduler::getMCUFrequency()
{
  return F_CPU;
}

inline uint32_t os48::Scheduler::getKernelTickFrequency()
{
  return m_kernel_tick_frequency;
}

inline os48::Task* os48::Scheduler::getRunningTask()
{
  return m_current_running_task;
}

inline void os48::Scheduler::clrLastError()
{
  m_last_error = SchErrNone;
}

inline void os48::Scheduler::setLastError(SchedulerError err)
{
  m_last_error = err;
}

inline void os48::Scheduler::priorityYield()
{
  if (shouldYield())
    this->yield();
}

inline void os48::Scheduler::internalYieldTo(Task* task)
{
  m_coop_next_task = task;
  this->yield();
}

inline os48::Task* os48::Scheduler::schedule()
{
  return (this->*m_schedule_fnc_addrs[m_scheduling_policy])();
}

inline os48::SchedulerError os48::Scheduler::getLastError()
{
  return OS48_VOLATILE_R(os48::SchedulerError, m_last_error);
}

inline bool os48::Scheduler::isStarted()
{
  return m_kernel_tick_frequency > 0;
}




