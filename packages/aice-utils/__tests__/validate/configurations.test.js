/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import aiceUtils from '../../src';

describe('validate configurations', () => {
  it('valid threshold=0.75', async () => {
    const result = aiceUtils.validateData({ threshold: 0.75 }, 'aice-configuration');
    expect(result).to.eql({ isValid: true });
  });
  it('not valid threshold=-0.75', async () => {
    const result = aiceUtils.validateData({ threshold: -0.75 }, 'aice-configuration');
    expect(result.isValid).to.equal(false);
  });
  it('not valid threshold=-100', async () => {
    const result = aiceUtils.validateData({ threshold: -0.75 }, 'aice-configuration');
    expect(result.isValid).to.equal(false);
  });
  it('not valid threshold="1"', async () => {
    const result = aiceUtils.validateData({ threshold: '1' }, 'aice-configuration');
    expect(result.isValid).to.equal(false);
  });
  it('Faulty resolvers', async () => {
    const result = aiceUtils.validateData({ resolvers: 'error' }, 'aice-configuration');
    expect(result.isValid).to.equal(false);
  });
  it('Not valid property', async () => {
    const result = aiceUtils.validateData({ dummy: 'value' }, 'aice-configuration');
    expect(result.isValid).to.eql(false);
  });
  it("Resolvers can't be empty", async () => {
    const result = aiceUtils.validateData({ resolvers: [] }, 'aice-configuration');
    expect(result.isValid).to.equal(false);
  });
  it('Resolvers with one simple', async () => {
    const result = aiceUtils.validateData({ resolvers: [{ name: 'simple' }] }, 'aice-configuration');
    expect(result.isValid).to.equal(true);
  });
  it('Resolvers with one empty object', async () => {
    const result = aiceUtils.validateData({ resolvers: [{}] }, 'aice-configuration');
    expect(result.isValid).to.equal(false);
  });
});
