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
 *  @file Advanced_parameters.h
 *  @author Yves DEMIRDJIAN
 *  @brief Some advanced extra parameters
 */

#ifndef _OS48_ADVANCED_PARAMTERS_H_
#define _OS48_ADVANCED_PARAMTERS_H_

/**
 * @brief Defines the stack size of the idle task added to the size needed to store context.
 */
#define OS48_IDLE_TASK_STACK_SIZE 20

/**
 * @brief Sets the stack size used by kernel during the context switch or for some special operations (first byte located at RAMEND). The kernel stack is volatile and just used in place.
 */
#define OS48_KERNEL_STACK_SIZE 32

/**
 * @brief Defines how kernel functions have to manage the atomicy of their critical code blocks.
 * 
 * - set OS48_ATOMIC_BLOCK to disable all interrupts (default)
 * - set OS48_NO_KT_BLOCK to disable only the kernel tick interrupt (you really should avoid calling kernel functions in ISRs)
 * - set OS48_NO_CS_BLOCK to allow all interrupts (including the kernel tick interrupt). It just disallows the context switch.
 */
#define OS48_KERNEL_SAFETY_BLOCK OS48_ATOMIC_BLOCK

//in ms priority * basetime hight = 3 ==> time slot will be 90 kernel ticks (in ms = 1 * kerneltickcount / getKernelTickFrequency()
/**
 * @brief Multiplicator for the round robin algorithm. The following number will be multiplied
 * with the priority number of the chosen task to get the necessary number of ticks before performing the context switch.
 */
#define OS48_SCH_RROBIN_BASE_TIME 20

//in kernel ticks (must be > 0)
/**
 *  @brief Number of kernel ticks before context switching if the current task is the idle task.
 */
#define OS48_IDLE_TASK_TIME_SLICE 1

//in kernel ticks (must be > 0)
/**
 *  @brief Number of kernel ticks before context switching for the random priority scheduling policy (SchPolicyRandomPriority) or others future algorithms
 */
#define OS48_DEFAULT_TASK_TIME_SLICE 80

/**
 *  @brief Number of kernel ticks before context switching for the preemptive scheduling policy (SchPolicyPreemptive)
 */
#define OS48_SCH_PREEMPTIVE_TASK_TIME_SLICE 300

/**
 * @brief Defines how wake up blocked tasks (with a timeout) during the kernel tick.
 *
 * - set 0 to perform the check only when the next context switch will occur (when the time slot of the current task will be consumed).
 * - set 1 to perform the check at each kernel tick (this parameter decreases the CPU resources). The tasks needing to be woken up become alive
 * in order to change their state to StQueuing but no context switch will occur (except if the current task has consumed the time slot allocated).
 * - set 2 to get the same behaviour than 1. A context switch will occur if the task woken up has a higher priority than the current one and
 * if the scheduling policy is SchPolicyPreemptive or SchPolicyIntelligent (DEFAULT BEHAVIOUR).
 * - set 3 to to perform the check at each kernel tick (this parameter decreases the CPU resources). The tasks needing to be woken up become alive
 * in order to change their state to StQueuing. A context switch occurs even if the current time slot has not been completely consumed.
 */
#define OS48_CHECK_SLEEPING_TASKS_AT_EACH_TICK 2

/**
 * @brief Set 0 or 1 to disable / enable the stack overflow detection at the scheduling time.
 */
#define OS48_ENABLE_STACK_OVERFLOW 1

/**
 * @brief Set 0 or 1 to disable / enable the usage of Scheduler::setPreContextSwitchFnc() and Scheduler::setPostContextSwitchFnc().
 */
#define OS48_ENABLE_CS_EVENTS 1

/**
 * @brief Set 0 or 1 to disable / enable the usage of Scheduler::setKernelTickEnterFnc() and Scheduler::setKernelTickExitrFnc().
 */
#define OS48_ENABLE_KT_EVENTS 1

/**
 * @brief Set 0 or 1 to disable / enable the usage of stat function, such as Scheduler::print() or Task::print(). Disable this feature to save memory.
 */
#define OS48_ENABLE_STATS 1

/**
 * @brief Set the policy for dynamic allocation.
 * 
 * - set 0 to use the standard malloc function.
 * - set 1 to use only the memory pool.
 * - set 2 to use first the memory pool and secondly if there is no free block available, the standard malloc function.
 */
#define OS48_DYNAMIC_ALLOCATION_POLICY 2

/**
 * @brief Set the number of blocks for the memory pool of tasks.
 * 
 * @note #OS48_DYNAMIC_ALLOCATION_POLICY shall be 1 or 2.
 */
#define OS48_MEMORY_POOL_TASK_BLOCKS 0

/**
 * @brief Set the number of blocks for the memory pool of messages.
 * 
 * @note #OS48_DYNAMIC_ALLOCATION_POLICY shall be 1 or 2.
 */
#define OS48_MEMORY_POOL_MESSAGE_BLOCKS 6

/**
 * @brief Set the number of blocks for the memory pool of work objects.
 * 
 * @note #OS48_DYNAMIC_ALLOCATION_POLICY shall be 1 or 2.
 */
#define OS48_MEMORY_POOL_WORK_OBJECT_BLOCKS 0

#endif
