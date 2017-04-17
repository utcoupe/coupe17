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

/**
 *  @file TaskTimer.h
 *  @author Yves DEMIRDJIAN
 *  @brief Creates timer tasks.
 */

#ifndef _OS48_TASK_TIMER_H_
#define _OS48_TASK_TIMER_H_

#include "Task.h"

extern uint32_t timer0_millis;

namespace os48
{
void tasktimer_do();

/**
 * @class TaskTimer
 * @brief A timer task can be used to execute some operations at a specific interval.
 *
 * @note The task nerver terminates. You can use Task::abort().
 */
class TaskTimer : public Task
{
  protected:
    bool_fnc_t m_tasktimer_user_fnc; //user function to execute periodically
    uint32_t m_tasktimer_period; //the period in millis
    bool m_delay_first;

    TaskTimer(bool_fnc_t fnc, size_t stackSize, uint32_t period, bool delayFirst = true);

    friend void os48::tasktimer_do();
    friend class os48::Scheduler;

  public:

    /**
     *  @brief Sets the period of the timer.
     *  @param period The period to execute the function in milliseconds.
     *
     *  @note The period is updated after the current / after the next execution of the function.
     *
     */
    void setPeriod(uint32_t period);

    /**
     * @return the period of the timer.
     */
    uint32_t getPeriod();

};
}

#include "TaskTimer_inline_fnc.h"

#endif

