/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import CallableFactory from '../../src/CallableFactory';
import JsonWebserviceCallable from '../../src/callables/JsonWebservicesCallable';
import AbstractCallable from '../../src/callables/AbstractCallable';

describe('CallableFactory', () => {
  it('newCallable jsonWebservice without fetch', async () => {
    const factory = new CallableFactory({});
    try {
      factory.newCallable({ values: {}, extra: { category: 'system', className: 'jsonWebservice' } });
    } catch (err) {
      expect(err.message).to.equal("CallableFactory can't instanciate jsonWebservice without services.fetch");
    }
  });

  it('newCallable jsonWebservice', async () => {
    const json = () => ({});
    const evaluateFromContext = v => v;
    const factory = new CallableFactory({
      fetch: () => ({ json }),
      AIceClass: { evaluateFromContext },
    });
    const callable = factory.newCallable({
      name: 'test',
      values: { callParameters: { url: 'local' }, parameters: {} },
      extra: { category: 'system', className: 'jsonWebservice' },
    });
    expect(callable).to.be.an('object');
    const res = await callable.call({});
    expect(res).to.eql({});
  });

  it('JsonWebservice static values', async () => {
    expect(JsonWebserviceCallable.className).to.equal('jsonWebservice');
    expect(JsonWebserviceCallable.category).to.equal('system');
    expect(JsonWebserviceCallable.getCallParametersSchema()).to.eql({
      url: { type: 'string' },
      method: { type: 'string' },
      body: { type: 'string' },
    });
  });

  it('AbstractCallable static values', async () => {
    expect(AbstractCallable.className).to.equal('abstract-callable');
    expect(AbstractCallable.category).to.equal('none');
    expect(AbstractCallable.getCallParametersSchema()).to.eql({});
  });

  it('AbstractCallable setParameters', async () => {
    const abstract = new AbstractCallable();
    let ret = abstract.setParameters({}, { name: 'value' });
    expect(ret).to.equal(false);
    ret = abstract.setParameters(
      { name: 'value', children: {} },
      { name: { type: 'string' }, children: { type: 'object', properties: { name: { type: 'string' } } } },
    );
    expect(ret).to.equal(true);
  });

  it('AbstractCallable validateParameters', async () => {
    const abstract = new AbstractCallable();
    let ret = abstract.validateParameters({}, { name: 'value' });
    expect(ret).to.equal(false);
    ret = abstract.validateParameters(
      { name: 'value', children: {} },
      { name: { type: 'string' }, children: { type: 'object', properties: { name: { type: 'string' } } } },
    );
    expect(ret).to.equal(true);
  });

  it('AbstractCallable validateParameters error', async () => {
    const abstract = new AbstractCallable();
    let ret = abstract.validateParameters({}, { name: 'value' });
    expect(ret).to.equal(false);
    ret = abstract.validateParameters(
      { name: 'value', children: {} },
      { name: { type: 'dummy' }, children: { type: 'object', properties: { name: { type: 'string' } } } },
    );
    expect(ret).to.equal(false);
  });

  it('AbstractCallable call error', async () => {
    const evaluateFromContext = v => v;
    const abstract = new AbstractCallable({
      AIceClass: { evaluateFromContext },
    });
    try {
      const ret = abstract.call({}, { name: 'value' });
      expect(ret).to.equal(false);
    } catch (err) {
      expect(err.message).to.equal('Cannot call call - Invalid call parameters');
    }
    try {
      const ret = abstract.validateParameters(
        { name: 'value', children: {} },
        { name: { type: 'dummy' }, children: { type: 'object', properties: { name: { type: 'string' } } } },
      );
      expect(ret).to.equal(false);
    } catch (err) {
      expect(err.message).to.equal('Cannot call call - Invalid call parameters');
    }
  });

  it('newCallable empty', async () => {
    const factory = new CallableFactory({ services: { fetch: () => {} } });
    const callable = factory.newCallable({ extra: { category: 'system', className: 'other ' } });
    expect(callable).to.be.an('object');
    const res = callable.call();
    expect(res).to.eql({});
  });
});
