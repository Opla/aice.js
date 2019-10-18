/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import chai from 'chai';
import { DoubleLinkedList } from '../../src/streamTransformers';

const { expect } = chai;

describe('DoubleLinkedList', () => {
  it('Get(-1) from empty DoubleLinkedList', () => {
    const list = new DoubleLinkedList();

    const node = list.get(-1);
    expect(node).to.equal(undefined);
  });

  it('Get(0) from empty DoubleLinkedList', () => {
    const list = new DoubleLinkedList();

    const node = list.get(0);
    expect(node).to.equal(undefined);
  });

  it('One item added to DoubleLinkedList', () => {
    const list = new DoubleLinkedList();
    list.append({ text: 'Hello' });

    let node = list.get();
    expect(node.value.text).to.equal('Hello');
    node = list.next;
    expect(node).to.equal(undefined);
  });

  it('One string item added to DoubleLinkedList', () => {
    const list = new DoubleLinkedList();
    list.append('Hello');

    let node = list.get();
    expect(node.value).to.equal('Hello');
    node = list.next;
    expect(node).to.equal(undefined);
  });
});

describe('DoubleLinkedList Iterator', () => {
  it('Iterate using next on empty list', () => {
    const list = new DoubleLinkedList();
    const it = list.values();
    let next = it.next();
    next = it.next();
    expect(next.value).to.equal(undefined);
  });

  it('One item added and iterate using next', () => {
    const list = new DoubleLinkedList();
    list.append({ text: 'Hello' });
    const it = list.values();
    let next = it.next();
    expect(next.value.text).to.equal('Hello');
    next = it.next();
    expect(next.value).to.equal(undefined);
  });

  it('One item added and iterate using next 2', () => {
    const list = new DoubleLinkedList();
    list.append({ text: 'Hello' });
    const it = list.lists();
    let next = it.next();
    expect(next.value.value.text).to.equal('Hello');
    next = it.next();
    expect(next.value).to.equal(undefined);
  });

  it('Array string items added iterate using for ... of', () => {
    const list = new DoubleLinkedList();
    ['var1', 'var2', 'var3'].forEach(e => list.append(e));
    let i = 1;
    for (const it of list) {
      if (i > 1) expect(it.hasPrevious()).to.equal(true);
      if (i < 3) expect(it.hasNext()).to.equal(true);

      expect(it.value).to.equal(`var${i}`);
      i += 1;
    }
  });

  it('Array string items added iterate using for ... of destructuring', () => {
    const list = new DoubleLinkedList();
    ['var1', 'var2', 'var3'].forEach(e => list.append(e));
    let i = 1;
    for (const { value } of list) {
      expect(value).to.equal(`var${i}`);
      i += 1;
    }
  });

  it('Array convertion', () => {
    const list = new DoubleLinkedList();
    list.append('red');
    list.append('orange');
    list.append('green');
    list.append('yellow');

    expect([...list.values()]).to.eql(['red', 'orange', 'green', 'yellow']);
  });

  it('String convertion', () => {
    const list = new DoubleLinkedList();
    list.append('red');
    list.append('orange');
    list.append('green');
    list.append('yellow');

    expect(...list.values()).to.equal('red');
    // TODO ... stream tests gestion
  });
});

describe('DoubleLinkedList Merge', () => {
  it('DoubleLinkedListNode - mergeWithNext should throw error', () => {
    const list = new DoubleLinkedList();
    list.append('red');

    const it = list.lists();
    const first = it.next().value;
    expect(() => first.mergeWithNext('data')).to.throw('DoubleLinkedListNode - mergeWithNext : node got no next');
  });

  it('DoubleLinkedListNode - mergeWithNext', () => {
    const list = new DoubleLinkedList();
    list.append('red');
    list.append('orange');
    list.append('green');

    const it = list.lists();
    const first = it.next().value;
    first.mergeWithNext('red with some orange');
    expect(first.value).to.equal('red with some orange');

    const last = it.next().value;
    expect(last.value).to.equal('green');
  });

  it('DoubleLinkedListNode - mergeWithPrevious should throw error', () => {
    const list = new DoubleLinkedList();
    list.append('red');

    const it = list.lists();
    const first = it.next().value;
    expect(() => first.mergeWithPrevious('data')).to.throw(
      'DoubleLinkedListNode - mergeWithPrevious : node got no previous',
    );
  });

  it('DoubleLinkedListNode - mergeWithPrevious', () => {
    const list = new DoubleLinkedList();
    list.append('red');
    list.append('orange');
    list.append('green');

    const it = list.lists();
    it.next();
    const first = it.next().value;
    first.mergeWithPrevious('orange with some red');
    expect(first.value).to.equal('orange with some red');
    const last = it.next().value;
    expect(last.value).to.equal('green');
  });
});
