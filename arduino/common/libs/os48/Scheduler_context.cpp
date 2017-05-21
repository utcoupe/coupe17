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

#include "Scheduler.h"

#ifndef os48SAVE_CONTEXT
#define os48SAVE_CONTEXT()     \
  asm volatile ("" ::: "memory");  \
  asm volatile (                   \
"push  r31                   \n\t" \
"in    r31, __SREG__         \n\t" \
"cli                         \n\t" \
"push  r31                   \n\t" \
"push  r30                   \n\t" \
"push  r29                   \n\t" \
"push  r28                   \n\t" \
"push  r27                   \n\t" \
"push  r26                   \n\t" \
"push  r25                   \n\t" \
"push  r24                   \n\t" \
"push  r23                   \n\t" \
"push  r22                   \n\t" \
"push  r21                   \n\t" \
"push  r20                   \n\t" \
"push  r19                   \n\t" \
"push  r18                   \n\t" \
"push  r17                   \n\t" \
"push  r16                   \n\t" \
"push  r15                   \n\t" \
"push  r14                   \n\t" \
"push  r13                   \n\t" \
"push  r12                   \n\t" \
"push  r11                   \n\t" \
"push  r10                   \n\t" \
"push  r9                    \n\t" \
"push  r8                    \n\t" \
"push  r7                    \n\t" \
"push  r6                    \n\t" \
"push  r5                    \n\t" \
"push  r4                    \n\t" \
"push  r3                    \n\t" \
"push  r2                    \n\t" \
"push  r1                    \n\t" \
"clr   r1                    \n\t" \
"push  r0                    \n\t" \
);
#endif

#ifndef os48SAVE_CONTEXT_ISR
#define os48SAVE_CONTEXT_ISR()     \
  asm volatile ("" ::: "memory");  \
  asm volatile (                   \
"push  r31                   \n\t" \
"in    r31, __SREG__         \n\t" \
"ori   r31,0x80              \n\t" \
"push  r31                   \n\t" \
"push  r30                   \n\t" \
"push  r29                   \n\t" \
"push  r28                   \n\t" \
"push  r27                   \n\t" \
"push  r26                   \n\t" \
"push  r25                   \n\t" \
"push  r24                   \n\t" \
"push  r23                   \n\t" \
"push  r22                   \n\t" \
"push  r21                   \n\t" \
"push  r20                   \n\t" \
"push  r19                   \n\t" \
"push  r18                   \n\t" \
"push  r17                   \n\t" \
"push  r16                   \n\t" \
"push  r15                   \n\t" \
"push  r14                   \n\t" \
"push  r13                   \n\t" \
"push  r12                   \n\t" \
"push  r11                   \n\t" \
"push  r10                   \n\t" \
"push  r9                    \n\t" \
"push  r8                    \n\t" \
"push  r7                    \n\t" \
"push  r6                    \n\t" \
"push  r5                    \n\t" \
"push  r4                    \n\t" \
"push  r3                    \n\t" \
"push  r2                    \n\t" \
"push  r1                    \n\t" \
"clr   r1                    \n\t" \
"push  r0                    \n\t" \
);
#endif

#ifndef os48RESTORE_CONTEXT
#define os48RESTORE_CONTEXT()      \
  asm volatile ("" ::: "memory");  \
  asm volatile (                   \
"pop  r0                     \n\t" \
"pop  r1                     \n\t" \
"pop  r2                     \n\t" \
"pop  r3                     \n\t" \
"pop  r4                     \n\t" \
"pop  r5                     \n\t" \
"pop  r6                     \n\t" \
"pop  r7                     \n\t" \
"pop  r8                     \n\t" \
"pop  r9                     \n\t" \
"pop  r10                    \n\t" \
"pop  r11                    \n\t" \
"pop  r12                    \n\t" \
"pop  r13                    \n\t" \
"pop  r14                    \n\t" \
"pop  r15                    \n\t" \
"pop  r16                    \n\t" \
"pop  r17                    \n\t" \
"pop  r18                    \n\t" \
"pop  r19                    \n\t" \
"pop  r20                    \n\t" \
"pop  r21                    \n\t" \
"pop  r22                    \n\t" \
"pop  r23                    \n\t" \
"pop  r24                    \n\t" \
"pop  r25                    \n\t" \
"pop  r26                    \n\t" \
"pop  r27                    \n\t" \
"pop  r28                    \n\t" \
"pop  r29                    \n\t" \
"pop  r30                    \n\t" \
"pop  r31                    \n\t" \
"out  __SREG__, r31          \n\t" \
"pop  r31                    \n\t" \
);
#endif 

