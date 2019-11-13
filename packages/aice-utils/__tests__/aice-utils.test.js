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
  it('aiceUtils setFileManager', async () => {
    const fileManager = {
      getFile: () => {},
      loadAsJson: () => {},
    };
    aiceUtils.setFileManager(fileManager);
    expect(aiceUtils.getFileManager()).to.eql(fileManager);
    aiceUtils.parameters.fileManager = null;
  });
  it('aiceUtils faulty setFileManager', async () => {
    expect(() => {
      aiceUtils.setFileManager();
    }).to.throw('Invalid fileManager');
  });
});
