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
 *  @brief Creates mutex instances.
 *  @file Mutex.h
 *  @author Yves DEMIRDJIAN
 */

#ifndef _OS48_MUTEX_H_
#define _OS48_MUTEX_H_

#include "Sync.h"

namespace os48
{

/**
 * @class Mutex
 * @brief Creates mutexes.
 * 
 * Mutex is used for mutual exclusions and provides some garanties in comparison of a binary semaphore (semaphore with a counter value 1):
 * - Only the task that locked the mutex is supposed to unlock it.
 * - Provides priority inversion safety.
 * - Safe abort. If the task process is interrupted definitively, the mutex will be unlocked. 
 */
class Mutex : protected Sync
{
  private:
    Task* m_owner;
    uint16_t m_recursive_call_counter;
    TaskPriority m_owner_priority;

    void wait();

    friend class Task;
    
  public:

    /**
     * @brief Creates a mutex.
     */
    Mutex();

    /**
     * @brief Creates a mutex.
     * @param syncReleaseMode Define how release tasks. @see ::SyncReleaseMode
     */
    Mutex(SyncReleaseMode syncReleaseMode);

    /**
     * @brief The current task tries to lock the mutex. 
     * @return false if the mutex is already locked.
     * true if the mutex is locked successfully.
     * 
     * Example:
     * @code
     * 
     * if (mutex.tryLock())
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
    bool tryLock();

    /**
     * @brief The current task tries to lock the mutex. 
     * 
     * If the mutex is already locked then the task will be added in the waiting queue.
     * @warning In order to avoid deadlocks, if the task added in the waiting queue has a higher 
     * priority than the owner, then the owner changes temporarly its priority to the priority of the waiting task.
     */
    void lock();

    /**
     * @brief Unlocks the mutex.
     * @note Only the owner can unlock the mutex.
     * @note Yields the current task to another if a task with a higher priority is ready.
     */
    void unlock();

    /**
     * @brief Resets the mutex to its initial state
     */
    void reset();
};

}

#endif


