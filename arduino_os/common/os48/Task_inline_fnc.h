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

inline os48::TaskPriority os48::Task::getPriority()
{
  return OS48_VOLATILE_R(TaskPriority, (m_priority));
}

inline os48::TaskState os48::Task::getState()
{
  return OS48_VOLATILE_R(TaskState, (m_state));
}

inline void os48::Task::clrLastError()
{
  m_last_error = TskErrNone;
}

inline void os48::Task::setLastError(os48::TaskError err)
{
  m_last_error = err;
}

inline bool os48::Task::isAlive()
{
  return OS48_VOLATILE_R(TaskState, m_state) & OS48_STATE_ALIVE_MASK;
}


inline bool os48::Task::isBlocked()
{
  return OS48_VOLATILE_R(TaskState, m_state) & OS48_STATE_BLOCKED_MASK;
}


inline bool os48::Task::isDead()
{
  return OS48_VOLATILE_R(TaskState, m_state) & OS48_STATE_DEAD_MASK;
}

inline bool os48::Task::suspend()
{
  return sleep(0);
}

inline size_t os48::Task::getStackSize()
{
  return m_stack_size;
}

inline size_t os48::Task::getUserStackSize()
{
  return getStackSize() - OS48_MINIMAL_TASK_STACK_SIZE;
}

inline size_t os48::Task::getUserUsedStackSize()
{
  return getUserStackSize() - getUserFreeStackSize();
}

inline uintptr_t os48::Task::getStackStartAddr()
{
  return (uintptr_t)m_stack + m_stack_size - 1;
}

inline uintptr_t os48::Task::getStackEndAddr()
{
  return (uintptr_t) m_stack;
}

inline os48::TaskError os48::Task::getLastError()
{
  return OS48_VOLATILE_R(TaskError, m_last_error);
}

