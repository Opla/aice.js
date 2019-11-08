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
    const result = await aiceUtils.validateData({ configuration: { threshold: 0.75 } }, 'aice-configuration');
    expect(result).to.eql({ isValid: true });
  });
  it('valid threshold=0.75 without schemaName', async () => {
    const result = await aiceUtils.validateData({ configuration: { threshold: 0.75 } });
    expect(result).to.eql({ isValid: true });
  });
  it('not valid threshold=-0.75', async () => {
    const result = await aiceUtils.validateData({ configuration: { threshold: -0.75 } }, 'aice-configuration');
    expect(result.isValid).to.equal(false);
  });
  it('not valid threshold=-100', async () => {
    const result = await aiceUtils.validateData({ configuration: { threshold: -0.75 } }, 'aice-configuration');
    expect(result.isValid).to.equal(false);
  });
  it('not valid threshold="1"', async () => {
    const result = await aiceUtils.validateData({ configuration: { threshold: '1' } }, 'aice-configuration');
    expect(result.isValid).to.equal(false);
  });
  it('Faulty resolvers', async () => {
    const result = await aiceUtils.validateData({ configuration: { resolvers: 'error' } }, 'aice-configuration');
    expect(result.isValid).to.equal(false);
  });
  it('Not valid property', async () => {
    const result = await aiceUtils.validateData({ configuration: { dummy: 'value' } }, 'aice-configuration');
    expect(result.isValid).to.eql(false);
  });
  it("Resolvers can't be empty", async () => {
    const result = await aiceUtils.validateData({ configuration: { resolvers: [] } }, 'aice-configuration');
    expect(result.isValid).to.equal(false);
  });
  it('Resolvers with one empty object', async () => {
    const result = await aiceUtils.validateData({ configuration: { resolvers: [{}] } }, 'aice-configuration');
    expect(result.isValid).to.equal(false);
  });
  it('Resolvers with one default', async () => {
    let result = await aiceUtils.validateData(
      { configuration: { resolvers: [{ name: 'default' }] } },
      'aice-configuration',
    );
    expect(result.isValid).to.equal(true);
    result = await aiceUtils.validateData(
      { configuration: { resolvers: [{ name: 'default', type: 'resolver' }] } },
      'aice-configuration',
    );
    expect(result.isValid).to.equal(true);
    result = await aiceUtils.validateData(
      { configuration: { resolvers: [{ name: 'notvalid', type: 'notvalid' }] } },
      'aice-configuration',
    );
    expect(result.isValid).to.equal(false);
    result = await aiceUtils.validateData(
      { configuration: { resolvers: [{ name: 'notvalid', novalid: 'notvalid' }] } },
      'aice-configuration',
    );
    expect(result.isValid).to.equal(false);
    result = await aiceUtils.validateData(
      { configuration: { resolvers: [{ name: 'notvalid', type: 'resolver', novalid: 'notvalid' }] } },
      'aice-configuration',
    );
    expect(result.isValid).to.equal(false);
  });
  it('Resolvers with one simple', async () => {
    const result = await aiceUtils.validateData(
      { configuration: { resolvers: [{ name: 'simple', type: 'simple-resolver' }] } },
      'aice-configuration',
    );
    expect(result.isValid).to.equal(true);
  });
  it('Resolvers with one remote', async () => {
    let result = await aiceUtils.validateData(
      { configuration: { resolvers: [{ name: 'simple', type: 'remote-resolver', url: 'http://example.com' }] } },
      'aice-configuration',
    );
    expect(result.isValid).to.equal(true);
    result = await aiceUtils.validateData(
      { configuration: { resolvers: [{ name: 'simple', type: 'remote-resolver', url: 'notvalid' }] } },
      'aice-configuration',
    );
    expect(result.isValid).to.equal(false);
    result = await aiceUtils.validateData(
      {
        configuration: {
          resolvers: [{ name: 'simple', type: 'remote-resolver', url: 'http://example.com', notvalid: 'notvalid' }],
        },
      },
      'aice-configuration',
    );
    expect(result.isValid).to.equal(false);
  });

  it('valid json string', async () => {
    const result = await aiceUtils.validateData('{ "configuration": { "threshold": 0.75 } }', 'aice-configuration');
    expect(result).to.eql({ isValid: true });
  });

  it('valid json file', async () => {
    const fileManager = {
      getFile: async () => ({ type: 'file' }),
      loadAsJson: async () => ({ configuration: { threshold: 0.75 } }),
    };
    aiceUtils.setFileManager(fileManager);
    const result = await aiceUtils.validateData('filename', 'aice-configuration');
    expect(result).to.eql({ isValid: true });
    aiceUtils.parameters.fileManager = null;
  });
  it('valid json file without extension', async () => {
    const fileManager = {
      getFile: async () => ({ type: 'file' }),
      loadAsJson: async () => ({ configuration: { threshold: 0.75 } }),
    };
    aiceUtils.setFileManager(fileManager);
    const result = await aiceUtils.validateData('filename');
    expect(result).to.eql({ isValid: true });
    aiceUtils.parameters.fileManager = null;
  });
  it('non valid json file', async () => {
    const fileManager = {
      getFile: async () => ({ notFound: true }),
      loadAsJson: async () => ({ configuration: { threshold: 0.75 } }),
    };
    aiceUtils.setFileManager(fileManager);
    const result = await aiceUtils.validateData('filename', 'aice-configuration');
    expect(result).to.eql({ isValid: false, error: 'file not found : filename' });
    aiceUtils.parameters.fileManager = null;
  });
});
