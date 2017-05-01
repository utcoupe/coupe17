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
 *  @file Barrier.h
 *  @author Yves DEMIRDJIAN
 *  @brief Creates barriers to synchronize tasks.
 */

#ifndef _OS48_BARRIER_H_
#define _OS48_BARRIER_H_

#include "Sync.h"

namespace os48
{

/**
 * @class Barrier
 * @brief A barrier is usefull to synchronize tasks at a specific point of your code
 */
class Barrier : protected Sync
{
  private:
    uint8_t m_counter; //counter of waiting task 
    uint8_t m_threshold; //max tasks before release all of them    
    bool m_auto_reset; //auto reset the barrier after a release
  public:

    /**
     * @brief Creates a barrier defining a maximum of waiting task.
     * @param threshold The maximum of tasks in the waiting queue
     */
    Barrier(uint8_t threshold);

    /**
     * @brief Creates a barrier defining a maximum of waiting task.
     * @param threshold The maximum of tasks in the waiting queue.
     * @param autoReset Sets the counter of waiting task to 0 if true.
     */
    Barrier(uint8_t threshold, bool autoReset);

    /**
     * @brief Creates a barrier defining a maximum of waiting task.
     * @param threshold The maximum of tasks in the waiting queue.
     * @param autoReset Sets the counter of waiting task to 0 if true.
     * @param syncReleaseMode Define how release tasks. @see ::SyncReleaseMode
     */
    Barrier(uint8_t threshold, bool autoReset, SyncReleaseMode syncReleaseMode);

    /**
     * @brief The current task will wait until the number of tasks 
     * which have called this function goes beyond the threshold.
     * 
     * All waiting tasks are released when the threshold is reached. 
     * 
     * @note Yields the current task to another if a task with a higher priority is ready.
     */
    void wait();

    /**
     * @brief All waiting tasks are released. The counter is set to 0.
     */
    void reset(); //release all
};
}

#endif

