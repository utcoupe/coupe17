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

#include <avr/io.h>
#include "Scheduler.h"

typedef struct __freelist {
  size_t sz;
  struct __freelist *nx;
} FREELIST;

extern FREELIST *__flp;
extern char *__brkval;

size_t os48::Scheduler::getFreeMemorySize()
{  
  return getTotalMemorySize() -
         getUsedMemorySize();
}

size_t os48::Scheduler::getFragmentedFreeMemorySize()
{
  // __brkval=0 if nothing has been allocated yet
  if (__brkval == 0)
    return 0;

  FREELIST *fp;
  size_t fragmented_free = 0;

  for (fp = __flp; fp; fp = fp->nx)
    fragmented_free += fp->sz + sizeof(size_t);

  return fragmented_free;  
}

size_t os48::Scheduler::getUsedMemorySize()
{
  // __brkval=0 if nothing has been allocated yet
  if (__brkval == 0)
    return 0;
 
  return (__brkval - __malloc_heap_start) - getFragmentedFreeMemorySize();
}

size_t os48::Scheduler::getTotalMemorySize()
{
  return (size_t)__malloc_heap_end - (size_t)__malloc_margin -
         (size_t)__malloc_heap_start;
}

