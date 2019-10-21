/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Authors: Morgan Perre
 */

class DoubleLinkedListNode {
  constructor(value, next = null, prev = null) {
    this.value = value;
    this.next = next;
    this.prev = prev;
  }

  hasNext() {
    return !!this.next;
  }

  hasPrevious() {
    return !!this.prev;
  }

  mergeWithNext(value) {
    if (!this.hasNext()) throw new Error('DoubleLinkedListNode - mergeWithNext : node got no next');
    this.value = value;
    this.next = this.next.next;
  }

  mergeWithPrevious(value) {
    if (!this.hasPrevious()) throw new Error('DoubleLinkedListNode - mergeWithPrevious : node got no previous');
    this.prev = this.prev.prev;
    this.value = value;
  }
}

const head = Symbol('head');
const tail = Symbol('tail');

export default class DoubleLinkedList {
  constructor() {
    this[head] = null;
    this[tail] = null;
  }

  append(value) {
    const newNode = new DoubleLinkedListNode(value);

    if (this[head] === null) {
      this[head] = this[tail] = newNode;
    } else {
      newNode.prev = this[tail];
      this[tail].next = newNode;
      this[tail] = newNode;
    }
  }

  get(index = 0) {
    if (index < 0) {
      return undefined;
    }
    let current = this[head];
    let i = 0;
    while (current !== null && i < index) {
      current = current.next;
      i += 1;
    }
    return current !== null ? current : undefined;
  }

  *values() {
    let current = this[head];

    while (current !== null) {
      yield current.value;
      current = current.next;
    }
  }

  *lists() {
    let current = this[head];

    while (current !== null) {
      yield current;
      current = current.next;
    }
  }

  [Symbol.iterator]() {
    return this.lists();
  }
}
