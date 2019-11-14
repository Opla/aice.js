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
    expect(result.error).to.equal('file not found : dummy');
  });
  it('return non valid json from a file in a directory', async () => {
    const fileManager = {
      getFile: async f => (f === 'filename' ? { type: 'file' } : { type: 'dir' }),
      loadAsJson: async () => null,
      readDir: async () => [{ type: 'file', filename: 'filename' }],
    };
    aiceUtils.setFileManager(fileManager);
    const result = await aiceUtils.validateData('directory');
    expect(result).to.be.an('array');
    expect(result[0].isValid).to.equal(false);
    expect(result[0].error).to.equal('wrong data format');
    aiceUtils.parameters.fileManager = null;
  });
  it('empty directory', async () => {
    const fileManager = {
      getFile: async () => ({ type: 'dir' }),
      loadAsJson: async () => null,
      readDir: async () => [],
    };
    aiceUtils.setFileManager(fileManager);
    const result = await aiceUtils.validateData('directory');
    expect(result.isValid).to.equal(false);
    expect(result.error).to.equal('file not found : directory');
    aiceUtils.parameters.fileManager = null;
  });
  it('non valid json file', async () => {
    const fileManager = {
      getFile: async () => null,
      loadAsJson: async () => null,
    };
    aiceUtils.setFileManager(fileManager);
    const result = await aiceUtils.validateData('filename', 'aice-configuration');
    expect(result).to.eql({ isValid: false, error: 'file not found : filename' });
    aiceUtils.parameters.fileManager = null;
  });
});
