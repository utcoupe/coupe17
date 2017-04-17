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
 *
 *  @file Task.h
 *  @author Yves DEMIRDJIAN
 *  @brief Task class and method declarations.
 */

#ifndef _OS48_TASK_H_
#define _OS48_TASK_H_

#include <Arduino.h>
#include <string.h>
#include "Advanced_parameters.h"
#include "QueueItem.h"
#include "MemoryPool.h"
#include "Helpers.h"

#define OS48_TASK_FLAG_BLOCKED_TIMEOUT 0x01

namespace os48
{

class Scheduler;
class Message;
class Sync;
class Mutex;

/**
 * @class Task
 * @brief Contains all methods affecting the behaviour of the task instance.
 *
 * @warning A task can only be instancied with Scheduler::createTask(). For deletion please use Scheduler::deleteTask().
 */
class Task : public QueueItem<Task>
{
  protected:
#if OS48_MEMORY_POOL_TASK_BLOCKS > 0
    static MemoryPool<Task, OS48_MEMORY_POOL_TASK_BLOCKS> s_mpool;
#endif

    volatile static uint8_t s_id_counter /* = 0 */;

    uint8_t m_id; //id of the task

#if OS48_ENABLE_STATS == 1
    uint32_t m_millis_count; //ms consumed by this task
#endif

    uint32_t m_last_execution; //in ms (used for intelligent scheduling algorithm)

    TaskPriority m_priority; //priority of the task
    TaskState m_state; //state of the task
    void* m_stack; //last byte of the stack task
    size_t m_stack_size;
    uintptr_t m_saved_sp; //saved sp to retrieve the context for a non running task

    uint32_t m_start_time_sleep; //time in ms when the task has started sleeping
    uint32_t m_sleep_duration; //time before being woken up

    Sync* m_sync_object; //attached sync instance, NULL when the task is not in StSyncPending state.

    uintptr_t m_fnc_addr; //function to execute by this task.

    TaskError m_last_error; //last error returned by a function

    //clears the last saved error code
    inline void clrLastError() __attribute__((always_inline));

    //sets an error code
    inline void setLastError(TaskError err) __attribute__((always_inline));

    //intializes the stack of the task
    void setupStack(uintptr_t fncAddr);

    virtual void releaseFromAllResources(TaskState nextState);

    //internal functions
    void internalSetPriority(TaskPriority priority);
    void internalReset(uintptr_t fncAddr, bool autoStart);
    Message* internalGetMessage(uint8_t code, bool unlink = true); //unlink = unlink from the queue
    void internalBlock(uint32_t millis, TaskState state); // millis 0 = no timeout, state must be a blocked state
    void internalUnblock();

    //sentinel for the messages
    QueueItem<Message> m_message_sentinel;

    //kernel flags (see macro for flags descriptions)
    volatile uint8_t m_flags;

    //if the task is blocked with a timeout and waiting a message, filter for code :
    volatile uint8_t m_message_code_expecting;

    Task(uintptr_t fncAddr, size_t stackSize);
    virtual ~Task();

    friend void os48::tick();
    friend void os48::inlineInternalYield();
    friend class os48::Scheduler;
    friend class os48::Sync;
    friend class os48::Mutex;

  public:

    static void* operator new (size_t size);
    static void operator delete (void *p);

    /**
     *  @return The ID of the task.
     */
    unsigned getId();  

    /**
     *  @brief Resets the task in order to execute a new function.
     *  @param fnc The function to execute.
     *  @param autoStart Indicates that the task is ready to start otherwise you have to call Task::resume().
     *  @return false if an error occured.
     *
     *  Has the same behaviour than Task::reset().
     *
     *  @par Error&nbsp;codes
     *  Task::getLastError() can return the following codes:
     *  - ::TskErrIncorrectState : The task must not has state StCorrupted or StDeleted.
     */
    bool resetFor(void_fnc_t fnc, bool autoStart = true);

    /**
     *  @brief Resets the task.
     *  @param autoStart Indicates that the task is ready to start otherwise you have to call Task::resume().
     *  @return false if an error occured.
     *
     *  @warning Calling this function can corrupt the continuity of synchronization functions in your program.
     *
     *  @par Error&nbsp;codes
     *  Task::getLastError() can return the following codes:
     *  - ::TskErrIncorrectState : The task must not has state StCorrupted or StDeleted.
     */
    bool reset(bool autoStart = true);

    /**
     *  @return if the task is alive (state is ::StRunning or ::StQueuing).
     */
    inline bool isAlive() __attribute__((always_inline));

    /**
     * @return if the task is blocked (e.g is ::StSleeping or is ::StSuspended).
     */
    inline bool isBlocked() __attribute__((always_inline));

    /**
     * @return if the task is dead (e.g is ::StTerminated or ::StDeleted).
     */
    inline bool isDead() __attribute__((always_inline));

    /**
     *  @brief Sets a new priority to the task.
     *  @param priority The priority
     *  @return false if an error occured.
     *
     *  @par Error&nbsp;codes
     *  Task::getLastError() can return the following codes:
     *  - ::TskErrArgs : If the priority is out of bounds.
     */
    bool setPriority(TaskPriority priority);

    /**
     *  @return The current priority associated to the task.
     */
    inline TaskPriority getPriority() __attribute__((always_inline));

    /**
     *  @return The current state of the task.
     */
    inline TaskState getState() __attribute__((always_inline));

    /**
     *  @brief Stops the task process. New state is ::StAborted.
     */
    void abort();

    /**
     *  @brief Equivalent to Task::sleep(0), waits an indefinite time. <br>
     *  If the task is running, then the kernel yields it to another task.
     *
     *  Can be resumed with Task::resume()
     *
     *  @return false if an error occured.
     *
     *  @par Error&nbsp;codes
     *  Task::getLastError() can return the following codes:
     *  - ::TskErrIncorrectState : The task must be alive.
     *
     *  @see Task::isAlive()
     */
    inline bool suspend() __attribute__((always_inline)); //eq to sleep(0)

    /**
     *  @brief Resumes a sleeping / suspended / non started task / task waiting msg.
     *  @return false if an error occured.
     *
     *  @par Error&nbsp;codes
     *  Task::getLastError() can return the following codes:
     *  - ::TskErrIncorrectState : The task state must be ::StSleeping or ::StSuspended or ::StNotStarted or ::StWaitingMsg.
     */
    bool resume();

    /**
     *  @brief Sleeps AT LEAST during a definite time amount.
     *
     *  When the delay expires, the task state is ::StQueuing (ready to run).
     *
     *  Can be resumed with Task::resume() at any moment. <br>
     *  If the task is running, then the kernel yields it to another task.
     *
     *  @param millis Time to sleep in milliseconds.
     *  @return false if an error occured.
     *
     *  @note If you specify 0 for @em millis, the task waits an infinite time.
     *
     *  @warning There are many reasons that a task can sleep longer than expected:
     *  - task with an higher priority is chosen first
     *  - there are too many tasks that woke up in the same time.
     *  - the chosen scheduling algorithm doesn't immediately  allow the execution of an awake task (the most responsive is ::SchPolicyIntelligent)
     *
     *
     *  @par Error&nbsp;codes
     *  Task::getLastError() can return the following codes:
     *  - ::TskErrIncorrectState : The task must be alive.
     *
     *  @see Task::isAlive()
     */
    bool sleep(uint32_t millis = 0);

    /**
     *  @brief Clears message queue.
     */
    void clearMessages();

    /**
     *  @param code Filter indicating the code of the message, 0 for any.
     *  @return the next available message in the queue corresponding to the filters or NULL if no message correpond.
     *
     *  @note This function consumes a message. That means the message will not be available after a second call.
     *
     *  @par Error&nbsp;codes
     *  Task::getLastError() can return the following codes:
     *  - ::TskErrIncorrectState : The task must be the current task running.
     */
    Message* getNextMessage(uint8_t code = 0); //0 = any

    /**
     *  @return the next available message in the queue corresponding to the filters or NULL if no message correpond.
     *
     *  @note Contrarily to Task::getNextMessage(), the message remains in the queue after the call of this method.
     *
     *  @par Error&nbsp;codes
     *  Task::getLastError() can return the following codes:
     *  - ::TskErrIncorrectState : The task must be the current task running.
     */
    Message* peekMessage(uint8_t code = 0); //0 = any

    /**
     *  @param code Filter indicating the code of the message, 0 for any.
     *  @param timeout In ms, the time to wait before give up.
     *  @return the next available message in the queue corresponding to the filters.
     *  NULL returned if an error occured or if no message correpond.
     *
     *  @note This function consumes a message. That means the message will not be available after a second call.
     *
     *  @par Error&nbsp;codes
     *  Task::getLastError() can return the following codes:
     *  - ::TskErrIncorrectState : The task must be the current task running.
     *
     *  @see Task::isAlive()
     */
    Message* waitNextMessage(uint8_t code = 0, uint16_t timeout = 0); //0 = any, timeout millis 0 == infinite

#if OS48_ENABLE_STATS == 1
    /**
      * @brief Print informations about this task.
      * @note This function is still interruptible.
      */
    void print(HardwareSerial& serial, bool printHeaders = false);

     /**
      * @brief Print memory informations about this task.
      * @note This function is still interruptible.
      * @note Don't call this method if Task::clearStackFootPrints() has not been called first.      * 
      */
    void printMem(HardwareSerial& serial, bool printHeaders = false);
#endif

    /**
     *  @return the addressable stack size of the task (user space + space user for the context switching)
     */
    inline size_t getStackSize() __attribute__((always_inline));

    /**
     *  @return the addressable stack size of the task which can be used by the user
     *  (stack size minus the space size used to store the context).
     */
    inline size_t getUserStackSize() __attribute__((always_inline));

    /**
     *  @return the stack size used by the user for this task.
     */
    inline size_t getUserUsedStackSize() __attribute__((always_inline));

    /**
     *  @return the free stack size for this task (for a total of Task::getUserStackSize()).
     */
    int16_t getUserFreeStackSize() __attribute__ ((noinline));

    /**
     * @brief Clears the free space area of the stack for this task from the current location of SP in order to get the last footprint with Task::getLastStackFootPrint().
     * 
     * @note It's recommended to call this function just after the call of Scheduler::createTask() to get the max memory usage of a task.
     * @note This function is still interruptible.
     * @warning You can't call this function once the scheduler is started.
     * @return false if the scheduler is started.
     *
     * @see Scheduler::isStarted()
     */
    bool clearStackFootprints();

    /**
     * @return the stack size used by the task considering the last footprint. In others words, this function return the maximum stack size used by the task since its launch.
     * 
     * @note Don't call this method if Task::clearStackFootPrints() has not been called first.
     * @note This function is still interruptible.
     */
    size_t getLastStackFootprint();

    /**
     *  @return the start stack address of this task (first addressable byte).
     */
    inline uintptr_t getStackStartAddr() __attribute__((always_inline));

    /**
     *  @return the end stack address of this task (last addressable byte).
     */
    inline uintptr_t getStackEndAddr() __attribute__((always_inline));

    /**
     *  @return the last error code of the last called task function which can return an error.
     */
    inline TaskError getLastError() __attribute__((always_inline));

    /**
     * @return the time consumed by this task.
     */
    inline uint32_t getTimeCount() __attribute__((always_inline));

};
}

#include "Task_inline_fnc.h"

#endif

