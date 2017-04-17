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
 *  @file TaskWorkQueue.h
 *  @author Yves DEMIRDJIAN
 *  @brief Creates tasks which can execute some works queued.
 *
 */

#ifndef _OS48_TASK_WORK_QUEUE_H_
#define _OS48_TASK_WORK_QUEUE_H_

#include "Task.h"

namespace os48
{

class Work;
class Sync;

void taskworkqueue_do();

/**
 * @class TaskWorkQueue
 * @brief This class is interesting when you have small non-prioritized works to execute.
 *
 * Works must be fast and must return (avoid long loops).
 * If no work are available in the queue, the task will be automatically suspended (::StWaitingWork) until TaskWorkQueue::addWork() is called.
 */
class TaskWorkQueue : public Task
{
  protected:

    uint16_t m_work_queue_size;

    QueueItem<Work> m_work_sentinel;

    void releaseFromAllResources(TaskState nextState);

    TaskWorkQueue(size_t stackSize);
    virtual ~TaskWorkQueue();

    friend void os48::taskworkqueue_do();
    friend class os48::Scheduler;

  public:

    /**
     * @brief Adds a work instance to the back of the queue.
     * @param work A work instance which has state ::WkStNotAttached.
     * @param urgent If true, the work is added to the front of the queue rather than the back.
     * @param autoDelete If true, delete the work instance automatically when the execution is done. You won't be able to get the result data.
     * @return false if an error occured.
     *
     * @par Error&nbsp;codes
     *  Task::getLastError() can return the following codes:
     *  - ::TskErrIncorrectWorkState : The work instance state must be ::WkStNotAttached.
     */
    bool addWork(Work& work, bool urgent = false, bool autoDelete = false);

    /**
     * @return the work queue size.
     */
    inline uint16_t getWorkQueueSize();

};
}

#include "TaskWorkQueue_inline_fnc.h"

#endif

