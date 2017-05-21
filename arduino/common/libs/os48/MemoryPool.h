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
 *  @brief Creates mutex instances.
 *  @file Mutex.h
 *  @author Yves DEMIRDJIAN
 */

#ifndef _OS48_MEMORY_POOL_H_
#define _OS48_MEMORY_POOL_H_

#include "Helpers.h"

namespace os48
{
/**
 * @class MemoryPool
 * @tparam T The type of the data pointed by the queue item.
 * @tparam N The numbers of block of T-size to reserve. N shall be <= 255 and > 0.
 * @brief Creates Memory pool for fixed size data.
 *
 * The memory pool instances have as main advantage to allocate or deallocate the data in O(1).
 * As compensation, the reserved memory space is not available for allocate other sizes of data.
 *
 * @warning This class does not provide any check on index passed as arg to functions.
 */
template<typename T, uint8_t N>
class MemoryPool
{
  private:


    volatile uint8_t m_next_free_block;
    volatile uint8_t m_used_block_count;

    uint8_t m_blocks[N];
    uint8_t m_data[N][sizeof(T)];

  public:
    /**
     * Memory pool invalid value constant.
     */
    static const uint8_t EOB = 255;

    /**
     * Default constructor.
     */
    MemoryPool();

    virtual ~MemoryPool();

    /**
     * @return the number of blocks of this memory pool instance.
     */
    inline uint8_t getBlockCount() __attribute__((always_inline));

    /**
    * @return the number of used blocks.
    */
    inline uint8_t getUsedBlockCount() __attribute__((always_inline));

    /**
     * @brief Reserves a block.
     * @return the index of the reserved block or MemoryPool<T, N>::EOB if no block is avalaible.
     */
    uint8_t reserveBlock();

    /**
     * @brief Returns the T-pointer corresponding to the specified index.
     * @param index The index.
     * @return a T-pointer.
     *
     * @note You should not use this pointer to store data if the block corresponding to specified index is not reserved with MemoryPool<T, N>::reserveBlock().
     *
     * @warning There is no check of the index value except for MemoryPool<T, N>::EOB. Be sure index is between the right bounds.
     */
    T* getPointerFromIndex(uint8_t index);

    /**
     * @brief Returns the index corresponding to the specified T-pointer.
     * @param pointer A T-pointer.
     * @return the index or EOB for an invalid pointer.
     */
    uint8_t getIndexFromPointer(T* pointer);

    /**
     * @brief Returns the T-pointer corresponding to the specified index.
     * @param index The index.
     * @return a T-pointer or NULL for an invalid index.
     */
    void freeBlock(uint8_t index);
};

}


template<typename T, uint8_t N>  os48::MemoryPool<T, N>::MemoryPool()
  : m_next_free_block(0)
{
  OS48_KERNEL_SAFETY_BLOCK
  {
    for (uint8_t currentI = 0; currentI <= (N - 2); ++currentI)
      m_blocks[currentI] = currentI + 1;

    m_blocks[N - 1] = EOB;
  }
}

template<typename T, uint8_t N>  os48::MemoryPool<T, N>::~MemoryPool()
{
  
}

template<typename T, uint8_t N> inline uint8_t os48::MemoryPool<T, N>::getBlockCount()
{
  return N;
}

template<typename T, uint8_t N> inline uint8_t os48::MemoryPool<T, N>::getUsedBlockCount()
{
  return m_used_block_count;
}

template<typename T, uint8_t N> uint8_t os48::MemoryPool<T, N>::reserveBlock()
{
  OS48_KERNEL_SAFETY_BLOCK
  {    
    if (m_next_free_block != EOB)
    {
      uint8_t block = m_next_free_block;
      m_next_free_block = m_blocks[block];
      m_blocks[block] = EOB;
      --m_used_block_count;
      return block;
    }
  }

  return EOB;
}

template<typename T, uint8_t N> T* os48::MemoryPool<T, N>::getPointerFromIndex(uint8_t index)
{
  if (index >= N)
    return NULL;
  return (T*) m_data[index];
}

template<typename T, uint8_t N> uint8_t os48::MemoryPool<T, N>::getIndexFromPointer(T* pointer)
{
  if ((uintptr_t)pointer < (uintptr_t)m_data[0] || (uintptr_t)pointer >= (uintptr_t) m_data[N])
    return EOB;
  return (((uintptr_t) pointer) - ((uintptr_t) m_data[0])) / sizeof(T);
}

template<typename T, uint8_t N> void os48::MemoryPool<T, N>::freeBlock(uint8_t index)
{
  OS48_KERNEL_SAFETY_BLOCK
  {
    if (index < N && m_blocks[index] == EOB)
    {
      m_blocks[index] = m_next_free_block;
      m_next_free_block = index;
      ++m_used_block_count;
    }
  }
}

#endif


