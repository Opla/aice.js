/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import aiceUtils from '../../src';

describe('import opennlxv1', () => {
  it('simple opennlxv1', async () => {
    const result = await aiceUtils.importData(
      '{ "name": "demo", "intents": [{ "id": "1", "input": "*", "output": "hello", "order": 0 }] }',
      { agentDefault: { locale: 'us', language: 'en', timezone: 'gmt', email: 'hello@domain.com' } },
    );
    expect(result.length).to.equal(1);
    expect(result[0]).to.eql({
      content: {
        name: 'demo',
        avatar: 'default',
        locale: 'us',
        language: 'en',
        timezone: 'gmt',
        email: 'hello@domain.com',
        intents: [{ name: '1', input: '*', output: 'hello', order: 0 }],
      },
      schema: { name: 'opennlx', version: '2' },
      isValid: true,
    });
  });
  it('simple opennlxv1 with opts.schemaName+version', async () => {
    const result = await aiceUtils.importData(
      {
        name: 'demo',
        avatar: 'default',
        intents: [{ name: '1', input: ['*'], output: ['hello'] }],
      },
      { schemaName: 'opennlx', version: '1' },
    );
    expect(result.length).to.equal(1);
    expect(result[0]).to.eql({
      content: {
        name: 'demo',
        avatar: 'default',
        intents: [{ name: '1', input: ['*'], output: ['hello'] }],
      },
      schema: { name: 'opennlx', version: '2' },
      isValid: true,
    });
  });
  it('load multiple json from dir', async () => {
    const model1 = { name: 'bot', intents: [{ id: '1', input: ['*'], output: ['hello'] }] };
    const model2 = { configuration: { threshold: 0.75 } };
    const fileManager = {
      getFile: async f => (f === 'directory' ? { type: 'dir', filename: f } : { type: 'file', filename: f }),
      loadAsJson: async f => (f.filename === 'filename' ? model1 : model2),
      readDir: async () => [
        { type: 'file', filename: 'filename' },
        { type: 'file', filename: 'filename2' },
      ],
    };
    aiceUtils.setFileManager(fileManager);
    const result = await aiceUtils.importData('directory');
    expect(result).to.be.an('array');
    expect(result.length).to.equal(2);
    expect(result[1].isValid).to.equal(true);
    expect(result[1].schema.name).to.equal('opennlx');
    expect(result[1].schema.version).to.equal('2');
    aiceUtils.parameters.fileManager = null;
  });
  it('load/merge multiple json from dir', async () => {
    const model1 = {
      name: 'bot',
      avatar: 'bot',
      intents: [{ name: '1', input: { text: '*' }, output: 'hello' }],
    };
    const model2 = { configuration: { threshold: 0.75 } };
    const fileManager = {
      getFile: async f => (f === 'directory' ? { type: 'dir', filename: f } : { type: 'file', filename: f }),
      loadAsJson: async f => (f.filename === 'filename' ? model1 : model2),
      readDir: async () => [
        { type: 'file', filename: 'filename' },
        { type: 'file', filename: 'filename2' },
      ],
    };
    aiceUtils.setFileManager(fileManager);
    const result = await aiceUtils.importData('directory');
    expect(result).to.be.an('array');
    expect(result.length).to.equal(2);
    expect(result[0].isValid).to.equal(true);
    expect(result[0].schema.name).to.equal('opennlx');
    expect(result[0].schema.version).to.equal('2');
    aiceUtils.parameters.fileManager = null;
  });
  it('merge 3 json from dir', async () => {
    const model1 = {
      name: 'bot',
      avatar: 'bot',
      intents: [{ name: '1', input: { text: 'hello' }, output: 'hello' }],
    };
    const model2 = {
      name: 'bot',
      avatar: 'bot',
      intents: [
        { name: '1', input: [{ text: '*' }, 'hi'], output: 'hello' },
        { name: '2', input: { text: 'welcome' }, output: 'welcome' },
      ],
    };
    const model3 = {
      name: 'bot',
      avatar: 'bot',
      intents: [
        { name: '1', input: [{ text: '*' }, 'hi'], output: 'hello' },
        { name: '2', input: { text: 'welcome' }, output: 'welcome' },
      ],
    };
    const models = { model1, model2, model3 };
    const fileManager = {
      getFile: async f => (f === 'directory' ? { type: 'dir', filename: f } : { type: 'file', filename: f }),
      loadAsJson: async f => models[f.filename],
      readDir: async () => [
        { type: 'file', filename: 'model1' },
        { type: 'file', filename: 'model2' },
        { type: 'file', filename: 'model3' },
      ],
    };
    aiceUtils.setFileManager(fileManager);
    const result = await aiceUtils.importData('directory');
    expect(result).to.be.an('array');
    expect(result.length).to.equal(1);
    expect(result[0].isValid).to.equal(true);
    expect(result[0].schema.name).to.equal('opennlx');
    expect(result[0].schema.version).to.equal('2');
    expect(result[0].content.intents.length).to.equal(2);
    expect(result[0].content.intents[0].name).to.equal('1');
    expect(result[0].content.intents[1].name).to.equal('2');
    aiceUtils.parameters.fileManager = null;
  });
});
