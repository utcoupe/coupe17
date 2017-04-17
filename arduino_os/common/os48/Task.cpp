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

#include "Task.h"
#include "Mutex.h"
#include "Message.h"
#include "Scheduler.h"

#define OS48_ISCHDL os48::Scheduler::get()

#if OS48_MEMORY_POOL_TASK_BLOCKS > 0
os48::MemoryPool<os48::Task, OS48_MEMORY_POOL_TASK_BLOCKS> os48::Task::s_mpool;
#endif

volatile uint8_t os48::Task::s_id_counter = 0;

void* os48::Task::operator new (size_t size)
{
  OS48_KERNEL_SAFETY_BLOCK
  {
#if OS48_DYNAMIC_ALLOCATION_POLICY == 0 || OS48_MEMORY_POOL_TASK_BLOCKS <= 0
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

void os48::Task::operator delete (void *p)
{
  OS48_KERNEL_SAFETY_BLOCK
  {
#if OS48_DYNAMIC_ALLOCATION_POLICY == 0 || OS48_MEMORY_POOL_TASK_BLOCKS <= 0
    free(p);
#elif OS48_DYNAMIC_ALLOCATION_POLICY == 1
    s_mpool.freeBlock(s_mpool.getIndexFromPointer((Task*)p));
#elif OS48_DYNAMIC_ALLOCATION_POLICY == 2
    uint8_t index = s_mpool.getIndexFromPointer((Task*)p);
    if (index != s_mpool.EOB)
      s_mpool.freeBlock(index);
    else
      free(p);
#endif
  }
}

unsigned os48::Task::getId()
{
  return m_id;
}

bool os48::Task::resetFor(void_fnc_t fnc, bool autoStart /* = true */)
{
  OS48_KERNEL_SAFETY_BLOCK
  {
    if (m_state == StCorrupted || m_state == StDeleted)
    {
      setLastError(TskErrIncorrectState);
      return false;
    }

    internalReset((uintptr_t) fnc, autoStart);
  }

  return true;
}

bool os48::Task::reset(bool autoStart /* = true */)
{
  OS48_KERNEL_SAFETY_BLOCK
  {
    if (m_state == StCorrupted || m_state == StDeleted)
    {
      setLastError(TskErrIncorrectState);
      return false;
    }

    internalReset(m_fnc_addr, autoStart);
  }

  return true;
}

bool os48::Task::setPriority(TaskPriority priority)
{
  clrLastError();

  if (priority < PrLowest || priority > PrHighest)
  {
    setLastError(TskErrArgs);
    return false;
  }

  if (m_sync_object != NULL && m_sync_object->getSyncType() == SyncTypeMutex &&
      ((Mutex*) m_sync_object)->m_owner_priority < m_priority) //checks if the priority has been temporarily promoted by the attached mutex
  {
    OS48_KERNEL_SAFETY_BLOCK
    {
      ((Mutex*) m_sync_object)->m_owner_priority = priority;
    }
  }
  else
  {
    OS48_KERNEL_SAFETY_BLOCK
    {
      internalSetPriority(priority);
    }
  }

  return true;
}

void os48::Task::abort()
{
  OS48_KERNEL_SAFETY_BLOCK
  {
    releaseFromAllResources(StAborted);

    if (OS48_ISCHDL->m_current_running_task == this)
      OS48_ISCHDL->yield();
  }
}

bool os48::Task::resume()
{
  OS48_KERNEL_SAFETY_BLOCK
  {
    clrLastError();

    if (! (m_state == StSuspended || m_state == StSleeping || m_state == StNotStarted || m_state == StWaitingMsg))
    {
      setLastError(TskErrIncorrectState);
      return false;
    }

    internalUnblock();
  }

  return true;
}

bool os48::Task::sleep(uint32_t millis)
{
  OS48_KERNEL_SAFETY_BLOCK
  {
    clrLastError();

    if (!isAlive())
    {
      setLastError(TskErrIncorrectState);
      return false;
    }
  }

  internalBlock(millis, (!millis ? StSuspended : StSleeping));

  return true;
}

os48::Message* os48::Task::getNextMessage(uint8_t code /* = 0 */)
{
  OS48_KERNEL_SAFETY_BLOCK
  {
    clrLastError();

    if (m_state != StRunning)
    {
      setLastError(TskErrIncorrectState);
      return NULL;
    }

    return internalGetMessage(code, true);
  }

  return NULL;
}

os48::Message* os48::Task::peekMessage(uint8_t code /* = 0 */)
{
  OS48_KERNEL_SAFETY_BLOCK
  {
    clrLastError();

    if (m_state != StRunning)
    {
      setLastError(TskErrIncorrectState);
      return NULL;
    }

    return internalGetMessage(code, false);
  }

  return NULL;
}

os48::Message* os48::Task::waitNextMessage(uint8_t code /* = 0 */, uint16_t timeout /* = 0 */)
{
  OS48_KERNEL_SAFETY_BLOCK
  {
    clrLastError();

    if (m_state != StRunning)
    {
      setLastError(TskErrIncorrectState);
      return NULL;
    }

    Message* toReturn = internalGetMessage(code, true);
    if (!toReturn)
    {
      m_message_code_expecting = code;
      internalBlock(timeout, StWaitingMsg);
    }
    else
    {
      return toReturn;
    }

    toReturn = internalGetMessage(code, true);

    m_message_code_expecting = 0;

    return toReturn;
  }

  return NULL;
}

#if OS48_ENABLE_STATS == 1
void os48::Task::print(HardwareSerial& serial, bool printHeaders /* = false */)
{
  //ID - State - Priority - Time % - Time consumed
  if (printHeaders)
    serial.println(F("ID\tState\t\tPriority\t\%\tTime"));

  serial.print(m_id);
  serial.print(F("\t"));

  switch (m_state)
  {
    case StRunning:
      serial.print(F("StRunning"));
      break;
    case StQueuing:
      serial.print(F("StQueuing"));
      break;
    case StSleeping:
      serial.print(F("StSleeping"));
      break;
    case StSyncPending:
      serial.print(F("StSyncPending"));
      break;
    case StWaitingMsg:
      serial.print(F("StWaitingMsg"));
      break;
    case StSuspended:
      serial.print(F("StSuspended"));
      break;
    case StWaitingWork:
      serial.print(F("StWaitingWork"));
      break;
    case StNotStarted:
      serial.print(F("StNotStarted"));
      break;
    case StTerminated:
      serial.print(F("StTerminated"));
      break;
    case StCorrupted:
      serial.print(F("StCorrupted"));
      break;
    case StAborted:
      serial.print(F("StAborted"));
      break;
    default:
      serial.print(F("????????"));
  }

  serial.print(F("\t"));

  switch (m_priority)
  {
    case PrIdle:
      serial.print(F("PrIdle\t"));
      break;
    case PrLow:
      serial.print(F("PrLow\t"));
      break;
    case PrBelowNormal:
      serial.print(F("PrBelowNormal"));
      break;
    case PrNormal:
      serial.print(F("PrNormal"));
      break;
    case PrAboveNormal:
      serial.print(F("PrAboveNormal"));
      break;
    case PrHigh:
      serial.print(F("PrHigh\t"));
      break;
    default:
      serial.print(F("????????"));
  }

  serial.print(F("\t"));

  serial.print((float)getTimeCount() / (float) timer0_millis * 100, 1);

  serial.print(F("\t"));

  serial.print(getTimeCount());

  serial.println();
}

void os48::Task::printMem(HardwareSerial& serial, bool printHeaders /* = false */)
{
  size_t uss = getUserStackSize();
  size_t uuss = getUserUsedStackSize();
  //Total mem - Total user mem - Used - Free - % - Used footprint
  if (printHeaders)
   serial.println(F("Total\tUserTotal\tUsed\tFree\t\%\tFootprint\t\%footprint"));


  serial.print(getStackSize());

  serial.print(F("\t"));

  serial.print(uss);

  serial.print(F("\t\t"));

  serial.print(uuss);

  serial.print(F("\t"));

  serial.print(uss - uuss);

  serial.print(F("\t"));

  serial.print((float) uuss / (float)uss * 100, 1);

  serial.print(F("\t"));

  size_t fp = getLastStackFootprint();
  
  serial.print(fp);

  serial.print(F("\t\t"));

  serial.print((float) fp / (float)uss * 100, 1);
  
  serial.println();  
}
#endif

int16_t os48::Task::getUserFreeStackSize()
{
  if (m_state == StRunning)
    return (OS48_ISCHDL->getSP() - (uintptr_t) m_stack - OS48_CONTEXT_SWITCHING_MEM_TOTAL_SIZE - OS48_EXTRA_SIZE_END_TASK_STACK + 1 + OS48_ADDR_SIZE); //we have to add OS48_ADDR_SIZE (ret asm op of this function)

  return (m_saved_sp - (uintptr_t) m_stack - OS48_EXTRA_SIZE_END_TASK_STACK + 1);
}

bool os48::Task::clearStackFootprints()
{
  if (!(OS48_ISCHDL->isStarted()))
  {
    for (uint8_t* p = (uint8_t*) m_stack; p <= (uint8_t*) m_saved_sp; ++p)
      *p = m_id;

    return true;
  }

  return false;
}

size_t os48::Task::getLastStackFootprint()
{
  for (uint8_t* p = (uint8_t*) m_stack;
       p <= (uint8_t*) OS48_ISCHDL->getSP();
       ++p)
  {
    if (*p != m_id)
      return (getUserStackSize() - ((uintptr_t) p - (uintptr_t) m_stack - OS48_EXTRA_SIZE_END_TASK_STACK));
  }

  return 0;
}

#if OS48_ENABLE_STATS == 1
inline uint32_t os48::Task::getTimeCount()
{
  OS48_ATOMIC_BLOCK
  {
    return m_millis_count + (m_state == StRunning ? (timer0_millis - m_last_execution) : 0);
  }

  return 0;
}
#endif

#undef OS48_ISCHDL




