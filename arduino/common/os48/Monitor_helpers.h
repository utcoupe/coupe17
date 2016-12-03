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
 * @file Monitor_helpers.h
 * @brief Helpers to create a monitor.
 */

#include "Mutex.h"

/**
 * @brief Entry point of a monitor.
 * @param MUTEXT_P A pointer to a valid mutex.
 */
#ifndef OS48_MONITOR_ENTER
#define OS48_MONITOR_ENTER(MUTEXT_P) \
(MUTEXT_P)->lock();
#endif

/**
 * @brief Middle point of the monitor, while the condition is not statisfied, tasks wait.
 * @param CONDITION A condition. When you change the condition to true elsewhere in your code, don't forget to call Sync::releaseOne() on SYNC_P.
 * @param MUTEXT_P A pointer to a valid mutex.
 * @param SYNC_P  A pointer to a valid Sync instance.
 */
#ifndef OS48_MONITOR_WAIT_UNTIL
#define OS48_MONITOR_WAIT_UNTIL(CONDITION, MUTEXT_P, SYNC_P) \
while (!(CONDITION))                                         \
{                                                            \
  OS48_KERNEL_SAFETY_BLOCK                                   \
  {                                                          \
    (MUTEXT_P)->unlock();                                    \
    (SYNC_P)->wait();                                        \
  }                                                          \
  (MUTEXT_P)->lock();                                        \
}
#endif

/**
 * @brief Exit point of a monitor. 
 * @param MUTEXT_P A pointer to a valid mutex.
 */
#ifndef OS48_MONITOR_EXIT
#define OS48_MONITOR_EXIT(MUTEXT_P) \
(MUTEXT_P)->unlock();
#endif

