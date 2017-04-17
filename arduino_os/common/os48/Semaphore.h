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
 *  @brief Creates semaphore instances.
 *  @file Semaphore.h
 *  @author Yves DEMIRDJIAN
 */

#ifndef _OS48_SEMAPHORE_H_
#define _OS48_SEMAPHORE_H_

#include "Sync.h"

namespace os48
{

/**
 * @class Semaphore
 * @brief Creates customizable semaphores to regulate task flows in critical sections.
 */
class Semaphore : protected Sync
{
  private:
    volatile uint8_t m_counter;
    uint8_t m_max_task;
    
  public:

    /**
     * @brief Creates a mutex. Semaphore with one task max in the critical section.
     */
    Semaphore();

    /**
     * @brief Creates a semaphore allowing a definite number of task to acquire the semaphore.
     * @param maxTask Max number of tasks.
     */
    Semaphore(uint8_t maxTask);

    /**
     * @brief Creates a semaphore allowing a definite number of task to acquire the semaphore.
     * @param max_task Max number of tasks.
     * @param syncReleaseMode Define how release tasks. @see ::SyncReleaseMode
     */
    Semaphore(uint8_t max_task, SyncReleaseMode syncReleaseMode);

    /**
     * @brief The current task tries to acquire the semaphore.
     * @return false if the maximum of task having acquired the semaphore is already reached.
     * true if the semaphore is acquired.
     *
     * Example:
     * @code
     *
     * if (sem.tryAcquire())
     * {
     *    [CRITICAL SECTION]
     * }
     * else
     * {
     *    [DO SOMETHING ELSE]
     * }
     *
     * @endcode
     */
    bool tryAcquire();

    /**
     * @brief The current task tries to acquire the semaphore.
     *
     * If the maximum of task having acquired the semaphore is already reached,
     * then the task will be added in the waiting queue.
     */
    void acquire();

    /**
     * @brief Releases the semaphore in order to let another task acquire it.
     * 
     * @note Yields the current task to another if a task with a higher priority is ready.
     */
    void release();

    /**
     * @brief Releases all waiting tasks and reset the semaphore.
     * 
     * @note Yields the current task to another if a task with a higher priority is ready.
     */
    void releaseAll();
};

}

#endif


