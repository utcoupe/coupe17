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
 *  @brief Primitive functions for synchronization. Can be used as en event synchronization object.
 *  @file Sync.h
 *  @author Yves DEMIRDJIAN
 */

#ifndef _OS48_SYNC_H_
#define _OS48_SYNC_H_

#include "Helpers.h"
#include "QueueItem.h"

namespace os48
{
  
class Task;
class Scheduler;

/**
 * @class Sync
 * @brief Contains primitive functions to add task in a waiting queue and release them. You can use this class as an event synchronization object.
 */
class Sync
{
  private:
    SyncError m_last_error; //last error returned by a function
    inline void clrLastError() __attribute__((always_inline)); //clears the error code
    inline void setLastError(SyncError err) __attribute__((always_inline)); //defines the error code

    void addTaskInPendingQueue(Task* task); //interruptible, adds a task in the waiting queue
    void removeTaskFromPendingQueue(Task* task); //interruptible, removes a task from the waiting queue

    friend class Scheduler;
    friend class Task;

  protected:
    SyncType m_sync_type;
    QueueItem<Task> m_pending_task_sentinel; //the sentinel of the waiting queue
    SyncReleaseMode m_sync_release_mode; //method used to release

  public:
    Sync();

    /**
     * @param syncReleaseMode Defines how release a task when necessary.
     */
    Sync(SyncReleaseMode syncReleaseMode);

    /**
     * @return The type of sync object. 
     */
    inline SyncType getSyncType();

    /**
     *  @brief Waits until a Sync::releaseOne() or Sync::releaseAll() is explicitly called.
     *  @return always true (for this version)
     */
    bool wait();

    /**
     *  @brief Releases a task pending in the waiting queue then yield if a task with a higher priority is ready.
     *  @return false if there is no waiting task, true otherwise.
     *
     *  @note Depending of the release mode you choosed with ::SyncReleaseMode,
     *  the released task can be the oldest waiting task or the oldest waiting task with the highest priority.
     */
    bool releaseOne();

    /**
     *  @brief Releases all tasks in the waiting queue 
     *  
     *  @note Yields the current task if a task with a higher priority is ready.
     */
    void releaseAll();

    /**
     * @brief Defines the release mode. @see SyncReleaseMode
     */
    inline void setSyncReleaseMode(SyncReleaseMode syncReleaseMode)__attribute__((always_inline));

    /**
     * @return the release mode. @see SyncReleaseMode
     */
    inline SyncReleaseMode getSyncReleaseMode() __attribute__((always_inline));

    /**
     * @return the last error code set by a function which can return errors.
     */
    inline SyncError getLastError() __attribute__((always_inline));
};
}

#include "Sync_inline_fnc.h"

#endif

