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

#include "Work.h"
#include "Sync.h"

#if OS48_MEMORY_POOL_WORK_OBJECT_BLOCKS > 0
os48::MemoryPool<os48::Work, OS48_MEMORY_POOL_WORK_OBJECT_BLOCKS> os48::Work::s_mpool;
#endif

os48::Work::Work(work_fnc_t fnc, Sync* sync)
  : QueueItem<Work>(this), m_work_fnc(fnc), m_state(WkStNotAttached), m_flags(0), m_sync_instance(sync)
{
}

void* os48::Work::operator new (size_t size)
{
  OS48_KERNEL_SAFETY_BLOCK
  {
#if OS48_DYNAMIC_ALLOCATION_POLICY == 0 || OS48_MEMORY_POOL_WORK_OBJECT_BLOCKS <= 0
    return malloc(size);
#elif OS48_DYNAMIC_ALLOCATION_POLICY == 1
    return s_mpool.getPointerFromIndex(s_mpool.reserveBlock());
#elif OS48_DYNAMIC_ALLOCATION_POLICY == 2
    void* ptr = s_mpool.getPointerFromIndex(s_mpool.reserveBlock());
    if (ptr == NULL)
      ptr =  malloc(size);   
    return ptr;
#endif
  }

  return NULL;
} //constructor implicitly called here

void os48::Work::operator delete (void *p)
{
  OS48_KERNEL_SAFETY_BLOCK
  {
#if OS48_DYNAMIC_ALLOCATION_POLICY == 0 || OS48_MEMORY_POOL_WORK_OBJECT_BLOCKS <= 0
    free(p);
#elif OS48_DYNAMIC_ALLOCATION_POLICY == 1
    s_mpool.freeBlock(s_mpool.getIndexFromPointer((Work*)p));
#elif OS48_DYNAMIC_ALLOCATION_POLICY == 2
    uint8_t index = s_mpool.getIndexFromPointer((Work*)p);    
    if (index != s_mpool.EOB)
      s_mpool.freeBlock(index);
    else
      free(p);
#endif
  }
}

void os48::Work::cancel()
{
  OS48_KERNEL_SAFETY_BLOCK
  {
    WorkState tmp = getState();

    m_state = WkStCancelled;

    if (tmp == WkStRunning)      
      m_flags |= 0x01;
    
    if (m_sync_instance != NULL)
      m_sync_instance->releaseAll();
  }
}

bool os48::Work::join()
{
  OS48_KERNEL_SAFETY_BLOCK
  {
    if (m_sync_instance == NULL)
      return false;

    m_sync_instance->wait();
  }

  return true;
}

