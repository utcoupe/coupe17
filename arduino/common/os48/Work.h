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
 *  @brief The work class.
 *  @file Work.h
 *  @author Yves DEMIRDJIAN
 */

#ifndef _OS48_WORK_H_
#define _OS48_WORK_H_

#include "Advanced_parameters.h"
#include "Helpers.h"
#include "QueueItem.h"
#include "MemoryPool.h"

namespace os48
{
class Task;
class TaskWorkQueue;
class Sync;

/**
 * @class Work
 * @brief Class used to make easier work instances.
 */
class Work : private QueueItem<Work>
{
  protected:
#if OS48_MEMORY_POOL_WORK_OBJECT_BLOCKS > 0
    static MemoryPool<Work, OS48_MEMORY_POOL_WORK_OBJECT_BLOCKS> s_mpool;
#endif

    work_fnc_t m_work_fnc;
    databag_t m_result;
    volatile WorkState m_state;
    volatile byte m_flags; //1st least significant bit = cancellation token, 2nd bit = autoDelete
    Sync* m_sync_instance;

    friend Task;
    friend TaskWorkQueue;
    friend void os48::taskworkqueue_do();

  public:

    /**
     * @brief Creates a work instance.
     * @param fnc The function to execute.
     * @param sync A synchronization object.
     */
    Work(work_fnc_t fnc, Sync* sync = NULL);

    static void* operator new (size_t size);
    static void operator delete (void *p);

    /**
     * @return the attached function.
     */
    inline work_fnc_t getFunc() __attribute__((always_inline));

    /**
     * @return true if a cancellation request has been sent when the current state is ::WkStRunning.
     */
    inline bool isCancellationRequested() __attribute__((always_inline));

    /**
     * @return the data returned from the function.
     */
    inline databag_t getResult() __attribute__((always_inline));

    /**
     * @return the state of the work instance.
     */
    inline WorkState getState() __attribute__((always_inline));

    /**
     * @brief Cancels the work. Releases all waiting task which are joined to this work.
     *
     * - When the state is ::WkStQueuing, the work instance is dequeued.
     * - When the state is ::WkStRunning, you have to check in your function implementation if the
     * cancellation token became true with Work::isCancellationRequested and return from the function. The state is already changed.
     * - When the state is something else, nothing happens.
     */
    void cancel();


    /**
     * @brief The task calling this method will be blocked as long as the work has not been completed or canceled.
     * @return false if the work instance has not been linked with a Sync instance. Take a look to the constructor Work::Work().
     */
    bool join();
};
}

#include "Work_inline_fnc.h"

#endif

