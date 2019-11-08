/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import aiceUtils from '../../src';

describe('validate errors', () => {
  it('return validate error without data', async () => {
    const result = await aiceUtils.validateData();
    expect(result.error).to.equal('empty data');
    expect(result.isValid).to.equal(false);
  });
  it('return validate error without schema', async () => {
    const result = await aiceUtils.validateData({});
    expect(result).to.eql({ error: 'Unknown schema', isValid: false });
  });
  it('return validate error without schema', async () => {
    const result = await aiceUtils.validateData({}, '');
    expect(result).to.eql({ error: 'Unknown schema', isValid: false });
  });
  it('return validate error with dummy schemas', async () => {
    const result = await aiceUtils.validateData({}, 'dummy');
    expect(result).to.eql({ error: 'Unknown schema: dummy', isValid: false });
  });
  it('return validate error with dummy schemas and version', async () => {
    const result = await aiceUtils.validateData({ dummy: { version: '1' } }, 'dummy');
    expect(result).to.eql({ error: 'Unknown schema: dummy with version=1', isValid: false });
  });
  it('return validate error empty string data', async () => {
    const result = await aiceUtils.validateData('');
    expect(result.isValid).to.equal(false);
    expect(result.error).to.equal('empty data');
  });
  it('return validate error empty array data', async () => {
    const result = await aiceUtils.validateData([]);
    expect(result.isValid).to.equal(false);
    expect(result.error).to.equal('wrong data format');
  });
  it('return validate error function as data', async () => {
    const result = await aiceUtils.validateData(() => {});
    expect(result.isValid).to.equal(false);
    expect(result.error).to.equal('wrong data format');
  });
  it('return validate error dummy string data', async () => {
    aiceUtils.parameters.fileManager = null;
    const result = await aiceUtils.validateData('dummy');
    expect(result.isValid).to.equal(false);
    expect(result.error).to.equal('wrong data format');
  });
});
