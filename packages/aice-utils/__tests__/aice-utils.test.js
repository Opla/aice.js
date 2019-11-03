/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import aiceUtils from '../src';

describe('aice-utils', () => {
  it('aiceUtils constructor', async () => {
    expect(aiceUtils).to.be.a('object');
  });
  it('aiceUtils setConfig', async () => {
    aiceUtils.setConfiguration({});
    expect(aiceUtils.getConfiguration()).to.eql({});
  });
  it('aiceUtils validate error without data', async () => {
    const result = aiceUtils.validateData();
    expect(result).to.eql({ error: 'empty data' });
  });
  it('aiceUtils validate error without schema', async () => {
    const result = aiceUtils.validateData({});
    expect(result).to.eql({ error: 'Unknown schema' });
  });
  it('aiceUtils validate error without schema', async () => {
    const result = aiceUtils.validateData({});
    expect(result).to.eql({ error: 'Unknown schema' });
  });
  it('aiceUtils validate error with dummy schemas', async () => {
    let result = aiceUtils.validateData({}, '');
    expect(result).to.eql({ error: 'Unknown schema' });
    result = aiceUtils.validateData({}, 'dummy');
    expect(result).to.eql({ error: 'Unknown schema: dummy with version=1' });
  });
  it('aiceUtils validate empty configuration', async () => {
    const result = aiceUtils.validateData({}, 'aice-configuration');
    expect(result).to.eql({ isValid: true });
  });
});
