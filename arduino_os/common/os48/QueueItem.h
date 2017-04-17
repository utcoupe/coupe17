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
 *  @file QueueItem.h
 *  @author Yves DEMIRDJIAN
 *  @brief A queue item.
 */

#ifndef _OS48_QUEUE_ITEM_H_
#define _OS48_QUEUE_ITEM_H_

namespace os48
{
  /**
   * @class QueueItem
   * @tparam T The type of the data pointed by the queue item.
   * @brief QueueItem can be used to create queues.
   * 
   * @note You can also extend this class to your own class. The data pointed by the queue item will be your class instance.
   * 
   * @code
   * 
   * class MyClass : QueueItem<MyClass>
   * 
   * @endcode
   */
  template<typename T>
  class QueueItem
  {
    private:
      T* m_item ; //data pointed
      QueueItem<T>* m_previous; //previous queue item
      QueueItem<T>* m_next; //next queue item
  
    public:
      /**
       * Default constructor. No data is pointed.
       */
      QueueItem();

      /**
       * A pointer to the data item.
       */
      QueueItem(T* item);

      /**
       * @return the queue item instance.
       */
      inline QueueItem<T>* getQI();

      /**
       * @return the data pointed.
       */
      inline T* getItem() __attribute__((always_inline));;   

      /**
       * @return the previous queue item.
       */
      inline QueueItem<T>* getPreviousQI() __attribute__((always_inline));

      /**
       * @return the data pointed by the previous queue item.
       */
      inline T* getPreviousItem() __attribute__((always_inline));

      /**
       * @return the next queue item.
       */
      inline QueueItem<T>* getNextQI() __attribute__((always_inline));

      /**
       * @return the data pointed by the next queue item.
       */
      inline T* getNextItem() __attribute__((always_inline));

      /**
       * @brief Sets the new data pointer. 
       * @param item the new pointer.
       */
      inline void setItem(T* item) __attribute__((always_inline));

      /**
       * @brief Sets the previous queue item.
       * @param qitem the pointer.
       */
      inline void setPreviousQI(QueueItem<T>* qitem) __attribute__((always_inline));

      /**
       * @brief Sets the next queue item.
       * @param qitem the pointer.
       */
      inline void setNextQI(QueueItem<T>* qitem) __attribute__((always_inline));
  
      /**
       * @brief Unlinks the queue item, the previous queue item will be directly linked to the next queue item.
       */
      inline void unlinkQI() __attribute__((always_inline));

      /**
       * @brief The queue item will lose the previous and next queue item references.
       * @note the previous and next pointers will point to this queue item itself.
       */
      inline void cleanQI() __attribute__((always_inline));

      /**
       * @brief Calls first QueueItem<T>::unlinkQI() then  QueueItem<T>::cleanQI().
       */
      inline void unlinkAndCleanQI() __attribute__((always_inline));

      /**
       * @brief Links a queue item before another queue item.
       * @param qitem Before this queue item.
       * 
       * @warning A queue item can be linked at one queue only. Unlink the item before link it in another queue.
       */
      void linkBeforeQI(QueueItem<T>* qitem);

      /**
       * @brief Links a queue item after another queue item.
       * @param qitem After this queue item.
       * 
       * @warning A queue item can be linked at one queue only. Unlink the item before link it in another queue.
       */
      void linkAfterQI(QueueItem<T>* qitem);

      /**
       * @brief Moves a queue item before another queue item.
       * @param qitem Before this queue item.
       * 
       * @warning Move the queue item in the same queue. The item must be already linked.
       */
      void moveBeforeQI(QueueItem<T>* qitem);

      /**
       * @brief Moves a queue item after another queue item.
       * @param qitem After this queue item.
       * 
       * @warning Move the queue item in the same queue. The item must be already linked.
       */
      void moveAfterQI(QueueItem<T>* qitem);

      /**
       * @brief Swaps a queue item with another queue item.
       * @param qitem The queue item to swap with the current.
       * 
       * @warning The both queue items must be linked in the same queue.
       */
      void swapQIWith(QueueItem<T>* qitem);
  };
}

template<typename T>  os48::QueueItem<T>::QueueItem()
  : m_item(0), m_previous(this), m_next(this)
{ }

template<typename T> os48::QueueItem<T>::QueueItem(T* item)
  : m_item(item), m_previous(this), m_next(this)
{ }


template<typename T> inline os48::QueueItem<T>* os48::QueueItem<T>::getQI()
{
  return (QueueItem<T>*) this;
}

template<typename T> inline T* os48::QueueItem<T>::getItem()
{
  return m_item;
}

template<typename T> inline os48::QueueItem<T>* os48::QueueItem<T>::getPreviousQI()
{
  return m_previous;
}

template<typename T> inline T* os48::QueueItem<T>::getPreviousItem()
{
  return m_previous->getItem();
}

template<typename T> inline os48::QueueItem<T>* os48::QueueItem<T>::getNextQI()
{
  return m_next;
}

template<typename T> inline T* os48::QueueItem<T>::getNextItem()
{
  return m_next->getItem();
}

template<typename T> inline void os48::QueueItem<T>::setItem(T* item)
{
  m_item = item;
}

template<typename T> inline void os48::QueueItem<T>::setPreviousQI(QueueItem<T>* qitem)
{
  m_previous = qitem;
}

template<typename T> inline void os48::QueueItem<T>::setNextQI(QueueItem<T>* qitem)
{
  m_next = qitem;
}

template<typename T>inline  void os48::QueueItem<T>::unlinkQI()
{
  m_previous->setNextQI(m_next);  
  m_next->setPreviousQI(m_previous);  
}

template<typename T> inline void os48::QueueItem<T>::cleanQI()
{
  m_previous = this;
  m_next = this;
}
template<typename T> inline void os48::QueueItem<T>::unlinkAndCleanQI()
{
  unlinkQI();
  cleanQI();
}

template<typename T> void os48::QueueItem<T>::linkBeforeQI(QueueItem<T>* qitem)
{
  m_previous = qitem->getPreviousQI();
  m_next = qitem;
  
  qitem->getPreviousQI()->setNextQI(this);
  qitem->setPreviousQI(this);
}

template<typename T> void os48::QueueItem<T>::linkAfterQI(QueueItem<T>* qitem)
{
  m_previous = qitem;
  m_next = qitem->getNextQI();
  qitem->getNextQI()->setPreviousQI(this);
  qitem->setNextQI(this);
}

template<typename T> void os48::QueueItem<T>::moveBeforeQI(QueueItem<T>* qitem)
{
  m_previous->setNextQI(m_next);
  m_next->setPreviousQI(m_previous);

  //same as linkBeforeQI
  m_previous = qitem->getPreviousQI();
  m_next = qitem;
  qitem->getPreviousQI()->setNextQI(this);
  qitem->setPreviousQI(this);
}

template<typename T> void os48::QueueItem<T>::moveAfterQI(QueueItem<T>* qitem)
{
  m_previous->setNextQI(m_next);
  m_next->setPreviousQI(m_previous);

  //same as linkAfterQI
  m_previous = qitem;
  m_next = qitem->getNextQI();
  qitem->getNextQI()->setPreviousQI(this);
  qitem->setNextQI(this);
}

template<typename T> void os48::QueueItem<T>::swapQIWith(QueueItem<T>* qitem)
{
  QueueItem<T>* previous = m_previous;
  moveAfterQI(qitem);
  qitem->moveAfterQI(previous);
}

#endif

