/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import aiceUtils from '../src';

class AICEClass {
  constructor(opts) {
    this.opts = opts;
  }
}

describe('aice-utils', () => {
  it('aiceUtils constructor', async () => {
    expect(aiceUtils).to.be.a('object');
  });
  it('aiceUtils setConfig', async () => {
    aiceUtils.setConfiguration({});
    expect(aiceUtils.getConfiguration()).to.eql({});
  });

  it('aiceUtils setServices', async () => {
    aiceUtils.setServices({ empty: {} });
    expect(aiceUtils.services.empty).to.eql({});
  });

  it('aiceUtils initSettings', async () => {
    let settings = aiceUtils.initSettings();
    expect(settings).to.eql({});
    settings = aiceUtils.initSettings({}, true);
    expect(settings).to.eql({ debug: true, services: { logger: { enabled: true }, tracker: { enabled: true } } });
    settings = aiceUtils.initSettings({ services: { logger: { enabled: false }, tracker: { enabled: false } } }, true);
    expect(settings).to.eql({ debug: true, services: { logger: { enabled: false }, tracker: { enabled: false } } });
  });

  it('aiceUtils.testManager.matchContext', async () => {
    const { testManager } = aiceUtils;
    let match = testManager.matchContext(null, {});
    expect(match).to.equal(true);
    match = testManager.matchContext(null, { name: 'value' });
    expect(match).to.equal(false);
    match = testManager.matchContext({ name: 'value', other: 'value' }, { name: 'value' });
    expect(match).to.equal(true);
    match = testManager.matchContext({ name: 'anothervalue', other: 'value' }, { name: 'value' });
    expect(match).to.equal(false);
  });
  it('aiceUtils setAIceClass', async () => {
    aiceUtils.setAIceClass(AICEClass);
    expect(aiceUtils.services.AIceClass).to.eql(AICEClass);
  });
  it('aiceUtils createAIceInstance', async () => {
    aiceUtils.setAIceClass(AICEClass);
    const aice = aiceUtils.createAIceInstance({});
    expect(aice).to.eql({ opts: {} });
  });
  it('aiceUtils faulty createAIceInstance', async () => {
    aiceUtils.setAIceClass();
    expect(() => {
      aiceUtils.createAIceInstance();
    }).to.throw('No AIce class defined');
  });
  it('aiceUtils setFileManager', async () => {
    const fileManager = {
      getFile: () => {},
      loadAsJson: () => {},
    };
    aiceUtils.setFileManager(fileManager);
    expect(aiceUtils.getFileManager()).to.eql(fileManager);
    aiceUtils.services.fileManager = null;
  });
  it('aiceUtils faulty setFileManager', async () => {
    expect(() => {
      aiceUtils.setFileManager();
    }).to.throw('Invalid FileManager');
  });
  it('aiceUtils no FileManager', async () => {
    aiceUtils.services.fileManager = null;
    try {
      await aiceUtils.transformData('filename');
    } catch (error) {
      expect(error.message).to.be.equal('No FileManager defined');
    }
  });
  it('aiceUtils no transformer', async () => {
    aiceUtils.services.fileManager = null;
    const res = await aiceUtils.transformData({ name: 'value' });
    expect(res.name).to.be.equal('value');
  });
  it('aiceUtils loadData zip file', async () => {
    const fileManager = {
      getFile: () => ({ filename: 'archive.zip', type: 'zip' }),
      extract: async (f, o, h) => {
        await h('data.json', o, 'd', fileManager);
        await h('novalid.json', o, null, fileManager);
        await h('dummy.pdf', 'dir', null, fileManager);
        await h('dummy2.pdf', null, null, fileManager);
      },
      readZipEntry: e => (e ? '{ "name": "value" }' : 'novalid'),
      writeZipEntry: async () => {},
      loadAsJson: () => ({ name: 'value' }),
    };
    aiceUtils.setFileManager(fileManager);
    const res = await aiceUtils.loadData('archive.zip', d => d, {});
    expect(res[0].name).to.be.equal('value');
    aiceUtils.services.fileManager = null;
  });
});
