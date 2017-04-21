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
 *  @brief The message class.
 *  @file Message.h
 *  @author Yves DEMIRDJIAN
 */

#ifndef _OS48_MESSAGE_H_
#define _OS48_MESSAGE_H_

#include "Advanced_parameters.h"
#include "QueueItem.h"
#include "MemoryPool.h"
#include "Helpers.h"

namespace os48
{
class Task;
class Scheduler;

/**
 * @class Message
 * @brief Class used to make easier exchanges of data between tasks.
 */
class Message : private QueueItem<Message>
{
  protected:
#if OS48_MEMORY_POOL_MESSAGE_BLOCKS > 0
    static MemoryPool<Message, OS48_MEMORY_POOL_MESSAGE_BLOCKS> s_mpool;
#endif

    uint8_t m_code; //user code to make categories
    uint8_t m_flags;
    databag_t m_body;

    friend Scheduler;
    friend Task;

  public:
    /**
     * @brief Creates a message.
     * @param code A user code.
     *
     * @warning Choose a code != 0. When a task is waiting a message, set 0 to the code filter means get any message codes.
     */
    Message(uint8_t code);

    /**
     * @brief Creates a message.
     * @param code A user code.
     * @param body The body (any type or pointer).
     *
     * @warning Choose a code != 0. When a task is waiting a message, set 0 to the code filter means get any message codes.
     */
    Message(uint8_t code, databag_t body);

    /**
     * @brief Creates a message.
     * @param code A user code.
     * @param body The body as a byte.
     *
     * @warning Choose a code != 0. When a task is waiting a message, set 0 to the code filter means get any message codes.
     */
    Message(uint8_t code, byte body);

    /**
     * @brief Creates a message.
     * @param code A user code.
     * @param body The body as an integer.
     *
     * @warning Choose a code != 0. When a task is waiting a message, set 0 to the code filter means get any message codes.
     */
    Message(uint8_t code, int body);

    /**
     * @brief Creates a message.
     * @param code A user code.
     * @param body The body as a float number.
     *
     * @warning Choose a code != 0. When a task is waiting a message, set 0 to the code filter means get any message codes.
     */
    Message(uint8_t code, float body);

    /**
     * @brief Creates a message.
     * @param code A user code.
     * @param body The body as a string.
     *
     * @warning Choose a code != 0. When a task is waiting a message, set 0 means get any message codes.
     */
    Message(uint8_t code, const char* body);

    /**
     * @brief Creates a message.
     * @param code A user code.
     * @param bodyAddr The body as a pointer of something.
     * @param bodySize The size of the data pointed.
     *
     * @warning Choose a code != 0. When a task is waiting a message, set 0 means get any message codes.
     */
    Message(uint8_t code, void* bodyAddr, uint16_t bodySize);

    static void* operator new (size_t size);
    static void operator delete (void *p);

    /**
     * @return the message code.
     */
    inline uint8_t getCode() __attribute__((always_inline));

    /**
     * @return the body.
     */
    inline databag_t getBody() __attribute__((always_inline));

    /**
     * @brief Sets a custom flag.
     * @param flags The flags.
     */
    inline void setFlags(uint8_t flags);

    /**
     * @return the flags.
     */
    inline uint8_t getFlags();
};
}

#include "Message_inline_fnc.h"

#endif

