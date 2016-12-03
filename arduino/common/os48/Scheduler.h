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
 *  @file Scheduler.h
 *  @author Yves DEMIRDJIAN
 *  @brief The scheduler functions and class.
 */

#ifndef _OS48_SCHEDULER_H_
#define _OS48_SCHEDULER_H_

#include "Advanced_parameters.h"
#include "Helpers.h"
#include "QueueItem.h"

#define OS48_DEFINE_CONSTANT_TIME_SLICE_() m_remaining_time_slice = OS48_DEFAULT_TASK_TIME_SLICE
#define OS48_DEFINE_PREEMPTIVE_TIME_SLICE_() m_remaining_time_slice = OS48_SCH_PREEMPTIVE_TASK_TIME_SLICE
#define OS48_DEFINE_RROBIN_TIME_SLICE_(task) m_remaining_time_slice = task->getPriority() * OS48_SCH_RROBIN_BASE_TIME

extern uint32_t timer0_millis;

namespace os48
{

class Task;
class TaskTimer;
class TaskWorkQueue;
class Sync;
class Mutex;
class Message;

/**
 * @internal
 */
inline void tick() __attribute__((always_inline));

/**
 * @internal
 */
inline void inlineInternalYield() __attribute__((always_inline));

/**
 * @fn task()
 * @brief Call this function to get the current Task running.
 * @code
 *
 * void funcTask1()
 * {
 *    uint8_t myID = task()->getId(); // <-- returns the Id of the task executing this code
 * }
 *
 * @endcode
 */
inline static Task* task() __attribute__((always_inline));

/**
 * @fn taskT()
 * @brief Call this function to get the current @em TaskTimer running.
 *
 * @warning Use this function only if the current task is a @em TaskTimer. Otherwise, you can get unexpected behaviours.
 *
 * @code
 *
 * void funcTimer1()
 * {
 *    taskT()->setPeriod(100);
 * }
 *
 * @endcode
 */
inline static TaskTimer* taskT() __attribute__((always_inline));

/**
 * @fn taskWQ()
 * @brief Call this function to get the current @em TaskWorkQueue running.
 *
 * @warning Use this function only if the current task is a @em TaskWorkQueue. Otherwise, you can get unexpected behaviours.
 */
inline static TaskWorkQueue* taskWQ() __attribute__((always_inline));


/**
 * @class Scheduler
 * @brief This class contains all relative methods to schedule tasks
 */
class Scheduler
{
  private:
    static Scheduler m_instance;

    volatile static uintptr_t s_saved_SP; //a temporary buffer for SP
    float m_kernel_tick_frequency; //kernel tick frequency (frequency for which the ISR is called)
    volatile uint16_t m_remaining_time_slice; //in kernel ticks

    //errors functions
    SchedulerError m_last_error; //last error returned by functions returning errors
    inline void clrLastError() __attribute__((always_inline));
    inline void setLastError(SchedulerError err) __attribute__((always_inline));

    //static kernel functions
    inline static void blackHole() __attribute__((always_inline));
    inline static void MCUSleep() __attribute__((always_inline)); //called by the idle task. MCU will sleep for a while
    static void internalYieldForYieldFnc(); //supposed call inlineInternalYield and only yield has to call it
    static void terminateTask(); //called when a task returns from its attached function

    Task* m_current_running_task; //current task running

    QueueItem<Task> m_sleeping_task_sentinel; //a list of sleeping task sorted by the time to resume

    static void idleProcess(); //the function attached to the idle task
    void initIdleTask(); //creates and configures the idle task
    Task* m_idle_task; //a pointer to the idle task

    void initTask(Task* task, TaskPriority priority, bool startImmediately); //init a task newly created

    Task* m_prior_task_sentinels[PrHighest + 1]; //sentinels for the queue of queued tasks. Each sentinel refers to a specific priority.

    Task* m_coop_next_task /* = NULL*/; //defines the next task to choose. If not null this task will be chosen.

    void_fnc_t m_user_overflow_fnc /*= &blackHole*/; //if a stack overflow occurs, this function is called. Can be changed by user.

#if OS48_ENABLE_CS_EVENTS == 1
    void_fnc_t m_user_pre_context_switch_fnc /* = NULL */; //user function executed just before a context switch.
    void_fnc_t m_user_post_context_switch_fnc /* = NULL */; //user function executed just after a context switch.
#endif

#if OS48_ENABLE_KT_EVENTS == 1
    void_fnc_t m_user_kernel_tick_enter_fnc /* = NULL */; //user function executed just before a kernel tick.
    void_fnc_t m_user_kernel_tick_exit_fnc /* = NULL */; //user function executed just after a kernel tick.
#endif

    void_fnc_t m_idle_user_fnc /* = NULL*/; //user function when the idle task is running.

    Scheduler();
    ~Scheduler();

    //SP functions to manage SP and its buffer s_saved_SP
    inline static void saveCurrentSP() __attribute__((always_inline));
    inline static void saveSP(uintptr_t SPvalue) __attribute__((always_inline));
    inline static uintptr_t getSavedSP() __attribute__((always_inline));
    inline static void restoreSavedSP() __attribute__((always_inline));
    inline static void setSP(uintptr_t SPvalue) __attribute__((always_inline));
    inline static void setSPToKernelArea() __attribute__((always_inline));

    //friend declarations
    friend void os48::tick();
    friend void os48::inlineInternalYield();
    friend void os48::taskworkqueue_do();
    friend class os48::Task;
    friend class os48::TaskTimer;
    friend class os48::TaskWorkQueue;
    friend class os48::Sync;
    friend class os48::Mutex;

    typedef Task* (os48::Scheduler::*void_sch_fnc_t)(void);
    SchedulingPolicy m_scheduling_policy;
    void_sch_fnc_t m_schedule_fnc_addrs[5]; //jump table

    //Queues operations
    void addTaskInSleepingQueue(Task* task); //interruptible
    void removeTaskFromSleepingQueue(Task* task); //interruptible
    void queuingNonAliveTask(Task* task); //interruptible
    void dequeuingAliveTask(Task* task, TaskState nextState); //interruptible
    void dequeuingAliveTaskAndYield(Task* task, TaskState nextState); //interruptible
    void redefinePrioritySentinels(TaskPriority priority, Task* task); //interruptible

    //other kernel functions
    void initTimeSlot();
    bool shouldYield(); //returns true if a higher priority task is ready (StQueuing) and if this rule is part of the selected scheduling policy (SchPolicyPreemptive and SchPolicyIntelligent)
    inline void priorityYield(); //yields if shouldYield() returns true
    inline void internalYieldTo(Task* task);

    //functions checking is a stack overflow occured
    void preStackOverflowDetection(); //on the current running task
    void postStackOverflowDetection(); //on the new task just chosen

    //functions for kernel tick
    void doSleepingTasksProcess();  //checks if some tasks have to be waked up and adds them to the alive queue
    void doScheduleProcess(); //schedule process: checks stack overflow, sleeping tasks, choose a new task etc
    inline Task* schedule() __attribute__((always_inline)); //return new task to switch calling the righ algorithm

    //all algorithms to choose a new task
    Task* scheduleCoop();
    Task* schedulePreemptive();
    Task* scheduleRoundRobin();
    Task* schedulePriorityRandom();
    Task* scheduleIntelligent();

  public:

    /**
    *  @brief Creates a task.
    *  @param fnc A void function without params associated to the task.
    *  @param stackSize The size of the stack, make sure to specify an enough quantity of memory to avoid stack overflows or indefinite behaviours in your program.
    *  @param priority The priority of the task os48::TaskPriority.
    *  @param autoStart 'false' indicates that the task can be queued to be later started.
    *  @return A pointer to the newly task or NULL if an error occured.
    *
    *  @note You can't delete a task with the @em delete or @em free keyword, use the Scheduler::deleteTask() method instead.
    *
    *  @par Error&nbsp;codes
    *  Scheduler::getLastError() can return the following codes:
    *  - ::SchErrArgs : If the priority value is out of bounds or if fnc is NULL.
    *  - ::SchErrAlloc : There is not enough free memory to create the task.
    *  - ::SchErrTaskCorrupted : The constructor of the task has failed to initialize task parameters or the stack.
    */
    Task* createTask(void_fnc_t fnc, size_t stackSize, TaskPriority priority = PrNormal, bool autoStart = true);

    /**
     *  @brief Creates a timer task.
     *  @param fnc A bool function without params associated to the task (return false to exit the loop and terminate the task).
     *  @param stackSize The size of the stack, make sure to specify an enough quantity of memory to avoid stack overflows or indefinite behaviours in your program.
     *  @param period The period to execute the function in milliseconds.
     *  @param priority The priority of the task os48::TaskPriority.
     *  @param delayFirst True to add the delay before the execution of the function.
     *  @param autoStart 'false' ndicates that the task can be queued to be later started.
     *  @return A pointer to the newly task timer or NULL if an error occured.
     *
     *  @note You can't delete a task with the @em delete or @em free keyword, use the Scheduler::deleteTask() method instead.
     *
     *  @par Error&nbsp;codes
     *  Scheduler::getLastError() can return the following codes:
     *  - ::SchErrArgs : If the priority value is out of bounds or fnc is NULL.
     *  - ::SchErrAlloc : There is not enough free memory to create the task.
     *  - ::SchErrTaskCorrupted : The constructor of the task has failed to initialize task parameters or the stack.
     */
    TaskTimer* createTaskTimer(bool_fnc_t fnc, size_t stackSize, uint32_t period = 1000, TaskPriority priority = PrNormal, bool delayFirst = true, bool autoStart = true);

    /**
     *  @brief Creates a work queue task.
     *  @param stackSize The size of the stack, make sure to specify an enough quantity of memory to avoid stack overflows or indefinite behaviours in your program.
     *  @param priority The priority of the task os48::TaskPriority.
     *  @param autoStart 'false' indicates that the task can be queued to be later started.
     *  @return A pointer to the newly task timer or NULL if an error occured.
     *
     *  @note You can't delete a task with the @em delete or @em free keyword, use the Scheduler::deleteTask() method instead.
     *
     *  @par Error&nbsp;codes
     *  Scheduler::getLastError() can return the following codes:
     *  - ::SchErrArgs : If the priority value is out of bounds.
     *  - ::SchErrAlloc : There is not enough free memory to create the task.
     *  - ::SchErrTaskCorrupted : The constructor of the task has failed to initialize task parameters or the stack.
     */
    TaskWorkQueue* createTaskWorkQueue(size_t stackSize, TaskPriority priority = PrNormal, bool autoStart = true);

    /**
    *  @brief Delete a task.
    *  @param task A valid pointer to a task.
    *  @return false if an error occured.
    *
    *  Delete a task from and free all resources.
    *
    *  @note If you delete the current running task, the kernel will automatically yields to another task.
    *
    *  @par Error&nbsp;codes
    *  Scheduler::getLastError() can return the following codes:
    *  - ::SchErrArgs : If you have specified a NULL pointer or if it points to the idle task.
    */
    bool deleteTask(Task* task);

    /**
    *  @return The Scheduler instance.
    */
    static inline Scheduler* get() __attribute__((always_inline));

    /**
    *  @return The frequency of your MCU.
    */
    inline uint32_t getMCUFrequency() __attribute__((always_inline));

    /**
    *  @return The frequency of the kernel tick. At a specific number of ticks elapsed, the kernel proceeds to the task switching.
    */
    inline uint32_t getKernelTickFrequency() __attribute__((always_inline));

    /**
    *  @brief Defines a function to call when a stack overflow occurs.
    *  @param overflowFnc A void function without params.
    *
    *  @note You also have to set @em 1 to #OS48_ENABLE_STACK_OVERFLOW in Advanced_parameters.h file.
    *  @note By passing a null pointer, the kernel will execute an infinite loop.
    *  @note The kernel memory area will be used for the stack.
    */
    void setStackOverflowFnc(void_fnc_t overflowFnc = NULL);

#if OS48_ENABLE_CS_EVENTS == 1
    /**
    *  @brief Defines a function to call before the kernel starts the context switch.
    *  @param fnc A void function without params.
    *
    *  @note You also have to set @em 1 to #OS48_ENABLE_CS_EVENTS in Advanced_parameters.h file.
    *  @note By passing a null pointer, you will disable this feature.
    *  @note The kernel memory area will be used for the stack.
    */
    void setPreContextSwitchFnc(void_fnc_t fnc = NULL);

    /**
    *  @brief Defines a function to call after the kernel starts the context switch.
    *  @param fnc A void function without params.
    *
    *  @note You also have to set @em 1 to #OS48_ENABLE_CS_EVENTS in Advanced_parameters.h file.
    *  @note By passing a null pointer, you will disable this feature.
    *  @note The kernel memory area will be used for the stack.
    */
    void setPostContextSwitchFnc(void_fnc_t fnc = NULL);
#endif //#if OS48_ENABLE_CS_EVENTS == 1

#if OS48_ENABLE_KT_EVENTS == 1
    /**
    *  @brief Defines a function to call when the kernel performs the beginning of the kernel tick operations.
    *  @param fnc A void function without params.
    *
    *  @note You also have to set @em 1 to #OS48_ENABLE_KT_EVENTS in Advanced_parameters.h file.
    *  @note By passing a null pointer, you will disable this feature.
    *  @note The kernel memory area will be used for the stack.
    */
    void setKernelTickEnterFnc(void_fnc_t fnc = NULL);

    /**
    *  @brief Defines a function to call when the kernel performs the end of the kernel tick operations.
    *  @param fnc A void function without params.
    *
    *  @note You also have to set @em 1 to #OS48_ENABLE_KT_EVENTS in Advanced_parameters.h file.
    *  @note By passing a null pointer, you will disable this feature.
    *  @note The kernel memory area will be used for the stack.
    */
    void setKernelTickExitFnc(void_fnc_t fnc = NULL);
#endif //if OS48_ENABLE_KT_EVENTS == 1    

    /**
    *  @brief Defines the function for the idle task. The default operation is to power down the MCU.
    *  @param idleUserFnc A void function without params.
    *
    *  @note By passing a null pointer, the MCU will be powered down until a new kernel interrupt occurs.
    *  @warning When the process of the passed function is completed, the MCU will be powered down and at the next kernel tick,
    *   the passed function will be called once again.    *
    */
    void setIdleUserFnc(void_fnc_t idleUserFnc = NULL);

    /**
    *  @brief Defines a scheduling algorithm to execute.
    *  @param schedulingPolicy The algorithm to apply.
    *
    *  @see SchedulingPolicy to have more informations about algorithms.
    *
    *  @return false if an error occured.
    *
    *  @par Error&nbsp;codes
    *  Scheduler::getLastError() can return the following codes:
    *  - ::SchErrArgs : If you have specified an incorrect argument.
    *
    */
    bool setSchedulingPolicy(SchedulingPolicy schedulingPolicy);

    /**
     * @return The chosen scheduling algorithm.
     */
    inline SchedulingPolicy getSchedulingPolicy() __attribute__((always_inline));

    /**
     * @brief Starts the kernel and a task.
     */
    void start();

    /**
     *  @brief Stops the kernel and then executes the given user function.
     *  @param fnc The user function.
     *  @return false if an error occured.
     *
     *  @note Before calling this function make sure your tasks are clean.
     *  For example, after called the function Scheduler::stop(), it's highly recommended to call
     *  Task::reset() on each tasks before calling Scheduler::start().
     *
     *  @par Error&nbsp;codes
     *  Scheduler::getLastError() can return the following codes:
     *  - ::SchErrArgs : If you have specified a NULL pointer.
     *
     */
    bool stop(void_fnc_t fnc = &Scheduler::blackHole);

    /**
     *  @brief Yields the current task to another task.
     */
    void yield();

    /**
     *  @brief Yields the current task to another task (works only in a cooperative scheduling algorithm).
     *  @param task The task to execute next.
     *  @param delayed Yields the current task only at the next Scheduler::yield() call.
     *  This can also be done by calling a kernel function like Task::suspend() or Semaphore::acquire().
     *  A second call to Scheduler::yieldTo() with delayed = true cancels the first  call.
     *  @return false if an error occured.
     *
     *  @par Error&nbsp;codes
     *  Scheduler::getLastError() can return the following codes:
     *  - ::SchErrWrongSchedulingPolicy : If the Scheduling policy is not ::SchPolicyCoop.
     *  - ::SchErrTaskIncorrectState : If the task is not alive.
     *
     *  @see Task::isAlive()
     *  @note Use this function preferrably for the cooperative scheduling algorithm (::SchPolicyCoop).
     */
    bool yieldTo(Task* task, bool delayed = false);

    /**
     * @return true if a sleeping task needs to be woken up.
     *
     * @note This function is only usefull with the cooperative scheduling algorithm (::SchPolicyCoop).
     * Indeed, with the others algorithms (aka scheduling policies), the tasks are automatically woken up by the kernel.
     */
    bool isATaskShouldBeAwake();

    /**
    *  @brief Sends a mesage to another task.
    *  @param to The target task.
    *  @param msg The message.
    */
    void sendMessage(Task* to, Message* msg);

#if OS48_ENABLE_STATS == 1
    /**
      * @brief Prints informations about the scheduler.
      * @note This function is still interruptible.
      */
    void print(HardwareSerial& serial);
#endif

    /**
     * @return The quantity of free memory which can be dynamically allocated (in bytes).
     * @note Including the fragmented dynamic memory.
     */
    size_t getFreeMemorySize(); //including free fragmented space, kernel works only with heap memory (stack is for tasks inside allocatd memory)

    /**
     * @return The quantity of the available (fragmented) free memory in the current dynamic memory bounds (in bytes).
     */
    size_t getFragmentedFreeMemorySize();

    /**
     * @return The space used by dynamic allocations in bytes.
     */
    size_t getUsedMemorySize();

    /**
     * @return The total of memory addressable for dynamic allocations in bytes.
     */
    size_t getTotalMemorySize();

    /**
     * @return A pointer to the current running task.
     */
    inline Task* getRunningTask() __attribute__((always_inline));

    /**
     * @return The last encountred error by the Scheduler class.
     * @note Errors can be returned only by functions which return errors and having an explicit explanation of error codes returned by this doc.
     */
    inline SchedulerError getLastError() __attribute__((always_inline));

    /**
     * @return If the kernel is started.
     * @see Scheduler::start()
     */
    inline bool isStarted() __attribute__((always_inline));

    /**
     * return The current location of the stack pointer.
     */
    inline static uintptr_t getSP() __attribute__((always_inline));

};
}

#include "Scheduler_inline_fnc.h"


#endif
