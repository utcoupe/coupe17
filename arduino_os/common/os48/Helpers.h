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
 *  @file Helpers.h
 *  @author Yves DEMIRDJIAN
 *  @brief Some helpers.
 */

#ifndef _OS48_HELPERS_H_
#define _OS48_HELPERS_H_

#include <Arduino.h>
#include <stdlib.h>
#include <stdint.h>
#include <util/atomic.h>

/* DEFINES MCU TYPE */
#if defined (__arm__) && defined (__SAM3X8E__) // Arduino Due compatible

#define OS48_ARM 1
//nothing for now

#else //AVR

#define OS48_AVR 1

#if defined(__AVR_ATmega2560__)

#define OS48_ADDR_SIZE 3

#else

#define OS48_ADDR_SIZE 2

#endif

#define OS48_TIMER_PRESCALER 64
#define OS48_TIMER_COUNTER OCR0A

#endif
/************************/

/**
 * @brief Enables interrupts.
 */
#define OS48_ENABLE_INTERRUPTS() sei()

/**
 * @brief Disables interrupts.
 */
#define OS48_DISABLE_INTERRUPTS() cli()

/**
 * @brief Enables the kernel tick.
 */
#define OS48_START_KERNEL_TICK() (TIMSK0 |= _BV(OCIE0A))

/**
 * @brief Disables the kernel tick (prevent the kernel to yield to another task).
 */
#define OS48_STOP_KERNEL_TICK() (TIMSK0 &= ~_BV(OCIE0A))

/**
 * @return If the kernel tick is enabled.
 */
#define OS48_IS_KERNEL_TICK_ENABLED() ((TIMSK0 & _BV(OCIE0A)) == _BV(OCIE0A))

/**
 * @brief Enables the kernel tick.
 * @return the previous state.
 */
static inline bool os48_start_kernel_tick()
{
  bool e = OS48_IS_KERNEL_TICK_ENABLED();
  OS48_START_KERNEL_TICK();
  return e;
}

/**
 * @brief Disables the kernel tick.
 * @return the previous state.
 */
static inline bool os48_stop_kernel_tick()
{
  bool e = OS48_IS_KERNEL_TICK_ENABLED();
  OS48_STOP_KERNEL_TICK();
  return e;
}

/**
 * @return if the kernel tick is enabled.
 */
static inline bool os48_is_kernel_tick_enabled()
{
  return OS48_IS_KERNEL_TICK_ENABLED();
}

static inline void __ktRestore(const bool* __s)
{
  if (*__s)
    OS48_START_KERNEL_TICK();
  else
    OS48_STOP_KERNEL_TICK();

  __asm__ volatile ("" ::: "memory");
}

extern volatile bool os48_cs_enabled; //if context switch is enabled for the kernel tick process

/**
 * @brief Enables the context switch during the kernel tick process.
 * @return the previous state.
 */
static inline bool os48_enable_context_switch()
{
  bool e = os48_cs_enabled;
  os48_cs_enabled = true;
  return e;
}

/**
 * @brief Disables the context switch during the kernel tick process.
 * @return the previous state.
 */
static inline bool os48_disable_context_switch()
{
  bool e = os48_cs_enabled;
  os48_cs_enabled = false;
  return e;
}

/**
 * @return if the context switch is enabled during the kernel tick process.
 */
static inline bool os48_is_context_switch_enabled()
{
  return os48_cs_enabled;
}

static inline void __csRestore(const bool* __s)
{
  os48_cs_enabled = *__s;
  __asm__ volatile ("" ::: "memory");
}


/**
 *  @brief Disables the kernel tick in the block (prevents the kernel to yield the current task to another task).
 *
 *  @code
 *  OS48_NO_KT_BLOCK
 *  {
 *    [some code non interruptible by the kernel]
 *  }
 *  @endcode
 *
 *  @warning All sub processes of the kernel tick won't occur:
 *  the detection of memory overflows, the check of blocked tasks to wake up, and so on.
 */
#define OS48_NO_KT_BLOCK                                                                                    \
  for(                                                                                                      \
      bool os48e__ __attribute__((__cleanup__(__ktRestore))) = os48_stop_kernel_tick(), os48i__ = true;     \
      os48i__;                                                                                              \
      os48i__ = false)


/**
 *  @brief Disables the context switch in the block during the kernel tick process (prevents the kernel to yield the current task to another task).
 *
 *  @code
 *  OS48_NO_CS_BLOCK
 *  {
 *    [some code non interruptible by the kernel]
 *  }
 *  @endcode
 *
 *  @note Contrary to OS48_NO_KT_BLOCK, this macro allows (if enabled too) the kernel tick processes:
 *  the detection of memory overflows, the check of blocked tasks to wake up, and so on.
 */
#define OS48_NO_CS_BLOCK                                                                                      \
  for (                                                                                                       \
      bool os48e__ __attribute__((__cleanup__(__csRestore))) = os48_disable_context_switch(), os48i__ = true; \
      os48i__;                                                                                                \
      os48i__ = false)

/**
 * @brief Disables temporally ALL interrupts.
 * @note Sets also a memory barrier.
 *
 * @code
 *  OS48_ATOMIC_BLOCK
 *  {
 *    [some code non interruptible]
 *  }
 *  @endcode
 */
#define OS48_ATOMIC_BLOCK             \
  ATOMIC_BLOCK(ATOMIC_RESTORESTATE)

/**
 * @brief Enables temporally ALL interrupts in a non interruptible context.
 * @note Sets also a memory barrier.
 *
 * @code
 *  OS48_NON_ATOMIC_BLOCK
 *  {
 *    [some code interruptible]
 *  }
 *  @endcode
 */
#define OS48_NON_ATOMIC_BLOCK            \
  NONATOMIC_BLOCK(ATOMIC_RESTORESTATE)

/**
 *  @brief This macro ensures you read the value of the variable from the memory. <br>
 *  Because the compiler can re-order and optimize some operations, it can store the first time the value in
 *  a register and then always read the value from this register. In a concurrent tasks context, by using the same
 *  variable, the first task having stored the value in a register doesn't "see" the modification from the second
 *  task that stores the new value in memory.
 *  #OS48_VOLATILE_R allows you to read the value of the variable from memory to avoid this case.
 *  @param TYPE The type of the variable
 *  @param VARIABLE The variable to read
 *  @return The value
 *
 *
 *  Example :
 *  Suppose, for some reasons of optimizations, you don't want to set @em val as a volatile variable.
 *  But in the following case you have to read the variable from the memory.
 *
 *  @code
 *  byte val = 0;
 *
 *  void function task1()
 *  {
 *      while (OS48_VOLATILE_R(byte, val) == 0) {}
 *      [...]
 *  }
 *
 *  void function task2()
 *  {
 *      os48_delay(1000);
 *      OS48_VOLATILE_R(byte, val) = 1;
 *  }
 *  @endcode
 *
 *  @note You don't have to use this macro inside a critical section because it prevents already the problems.
 */
#define OS48_VOLATILE_R(TYPE, VARIABLE) (*((volatile TYPE*) &VARIABLE))

/**
 * @brief Number of registers to save in a context switching.
 */
#define OS48_CONTEXT_SWITCHING_REGISTER_COUNT 33

// 33 registers + 2/3B for addr to set PC to its previous state
/**
* @brief Size of the context to save in a context switching.
*/
#define OS48_CONTEXT_SWITCHING_MEM_TOTAL_SIZE (OS48_CONTEXT_SWITCHING_REGISTER_COUNT + OS48_ADDR_SIZE)

/**
* @brief Space used for the task mask.
*/
#define OS48_TASK_MASK_SIZE 1

// space used for the task mask + the addr of the completed task function
#define OS48_EXTRA_SIZE_START_TASK_STACK (OS48_TASK_MASK_SIZE + OS48_ADDR_SIZE)

// +1B for task mask to catch stack overflows + 2/3B addr to jump when task is terminated
#define OS48_MINIMAL_TASK_STACK_SIZE (OS48_CONTEXT_SWITCHING_MEM_TOTAL_SIZE + OS48_EXTRA_SIZE_START_TASK_STACK + OS48_EXTRA_SIZE_END_TASK_STACK)

// space used for the task mask (last byte of the stack allocated)
#define OS48_EXTRA_SIZE_END_TASK_STACK OS48_TASK_MASK_SIZE

// addr of the saved PC of a non-running task
#define OS48_GET_SP_ADDR_TO_SAVED_PC(savedSP) (savedSP + OS48_CONTEXT_SWITCHING_REGISTER_COUNT)


typedef void (*void_fnc_t) (void);
typedef bool (*bool_fnc_t) (void);
#if defined (OS48_AVR)
typedef union os48_databag_type {
  uint8_t bRaw[sizeof(int32_t)];
  int8_t bInt8;
  uint8_t bUInt8;
  int16_t bInt16;
  uint16_t bUInt16;
  int32_t bInt32;
  uint32_t bUInt32;
  float bFloat;
  const char* bStr;
  struct raw_ptr
  {
    void* bAddr;
    size_t bSize;
  } bRawPtr;
} databag_t;
#elif defined (OS48_ARM)
#error "The type databag_t is still not defined"
#endif

typedef databag_t (*work_fnc_t) (void);

namespace os48
{
/**
 * @brief The priority given to a task.
 * @note PrIdle is reserved.
 */
enum TaskPriority : uint8_t {
  PrIdle = 0,
  PrLow,
  PrBelowNormal,
  PrNormal,
  PrAboveNormal,
  PrHigh,
  PrLowest = PrLow,
  PrHighest = PrHigh
};

#define OS48_STATE_ALIVE_MASK 0x10
#define OS48_STATE_BLOCKED_MASK 0x20
#define OS48_STATE_DEAD_MASK 0x80

/**
 * @brief The state of a task.
 */
enum TaskState : uint8_t {
  /* Ready task states 0b0001xxxx */
  StRunning = 0x10,  /*!< The task is currently running */
  StQueuing = 0x11, /*!< The task is ready to be chosen in order to continue its execution */

  /* Blocked task (aka sleeping tasks) states 0b0010xxxx */
  StSleeping = 0x20, /*!< The task is sleeping for a while (user call) */
  StSyncPending = 0x21, /*!< The task has been suspended by a synchronization function) */
  StWaitingMsg = 0x22, /*!< The task is waiting until a message is received */
  StSuspended = 0x23, /*!< The task has been suspended by user */
  StWaitingWork = 0x24, /*!< The task (TaskWorkQueue) is waiting for a new work to run */
  StNotStarted = 0x25, /*!< The task has not yet been started */

  /* Non alive task states 0b1000xxxx */
  StTerminated = 0x80, /*!< The task has terminated its process */
  StCorrupted = 0x81, /*!< The task couldn't be initialized */
  StAborted = 0x82, /*!< The task has been aborted by user */
  StDeleted = 0x83 /*!< The task has been deleted by user */
};

enum TaskError : uint8_t {
  TskErrNone = 0,
  TskErrArgs = 1,
  TskErrAlloc = 2,
  TskErrMemSizeTooSmall = 21,
  TskErrIncorrectState = 3,
  TskErrIncorrectWorkState = 31,
  TskErrSchedulerNotStarted = 50,
  TskErrWrongSchedulingPolicy = 51,
  TskErrWorkHasNoSyncObj = 60
};

/**
 * @brief A possible list of scheduling algorithms defining the behaviour of the kernel to choose the next task to resume.
 * @note Some kernel functions like Task::sleep() or Sync::wait() yield themselves the current task to another alive task. It permits to avoid a task lockout in most cases.
 */
enum SchedulingPolicy : uint8_t {
  SchPolicyCoop = 0,  /*!< Only the user can choose the next task to execute */
  SchPolicyPreemptive = 1, /*!< The kernel always chooses the next alive task having the highest priority. The time slot is long and constant before a new context switch */
  SchPolicyRoundRobin = 2, /*!< The kernel chooses the next alive task. The time slot before a new context switch is proportional to the chosen task priority, an high priority gives a longer time */
  SchPolicyRandomPriority = 3,/*!< The kernel chooses randomly the next alive task. A task having a high priority has more chance to be chosen. The time slot is constant before a new context switch */
  SchPolicyIntelligent = 4,/*!< The kernel always chooses the next alive task having the highest score related to the task priority, the last execution time and if some messages are pending to read */
};

enum SchedulerError : uint8_t {
  SchErrNone = 0,
  SchErrArgs = 1,
  SchErrAlloc = 2,
  SchErrWrongSchedulingPolicy = 3,
  SchErrTaskCorrupted = 11,
  SchErrTaskIncorrectState = 12,
};

enum SyncError : uint8_t {
  SyncErrNone = 0,
  SyncErrArgs = 1,
  SyncErrTaskIncorrectState = 2,
  SyncErrSchedulerNotStarted  = 3
};

/**
* @brief Behaviour of release sync functions.
*/
enum SyncReleaseMode : uint8_t {
  SyncRMFirstInFirstOut = 0, /*!< The task chosen to be released is the first task added or in others words the oldest waiting task  */
  SyncRMHighestPriority = 1, /*!< The task chosen to be released is the oldest waiting task and having also the highest priority */
};

enum SyncType : uint8_t {
  SyncTypeEvent = 0, /*!< Correspond to Sync */
  SyncTypeSem = 1, /*!< Correspond to Semaphore */
  SyncTypeBarrier = 2, /*!< Correspond to Barrier */
  SyncTypeMutex  = 3, /*!< Correspond to Mutex */
};

enum WorkState : uint8_t {
  WkStNotAttached = 0,
  WkStQueuing = 1,
  WkStRunning = 2,
  WkStTerminated = 3,
  WkStCancelled = 4,
};
}

#endif
