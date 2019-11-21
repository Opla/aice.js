/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import aiceUtils from '../../src';

describe('import configurations', () => {
  it('simple configuration', async () => {
    const result = await aiceUtils.importData('{ "configuration": { "threshold": 0.75 } }');
    expect(result.length).to.equal(1);
    expect(result[0]).to.eql({
      content: { configuration: { threshold: 0.75 } },
      schema: { name: 'aice-configuration' },
      isValid: true,
    });
  });
  it('merge json from dir', async () => {
    const model1 = { configuration: { threshold: 0.75 } };
    const model2 = {
      configuration: { threshold: 0.75, resolvers: [{ name: 'default' }, { name: 'simple', type: 'simple-resolver' }] },
    };
    const model3 = {
      configuration: { threshold: 0.75, resolvers: [{ name: 'default' }, { name: 'simple', type: 'simple-resolver' }] },
    };
    const model4 = { configuration: { threshold: 0.75 } };
    const model5 = { configuration: { threshold: 0.75 }, resolvers: [{ name: 'default' }] };
    const models = { model1, model2, model3, model4, model5 };
    const fileManager = {
      getFile: async f => (f === 'directory' ? { type: 'dir', filename: f } : { type: 'file', filename: f }),
      loadAsJson: async f => models[f.filename],
      readDir: async () => [
        { type: 'file', filename: 'model1' },
        { type: 'file', filename: 'model3' },
        { type: 'file', filename: 'model2' },
        { type: 'file', filename: 'model4' },
        { type: 'file', filename: 'model5' },
      ],
    };
    aiceUtils.setFileManager(fileManager);
    const result = await aiceUtils.importData('directory');
    expect(result).to.be.an('array');
    expect(result.length).to.equal(2);
    expect(result[0].isValid).to.equal(false);
    expect(result[1].isValid).to.equal(true);
    expect(result[1].schema.name).to.equal('aice-configuration');
    expect(result[1].content.configuration.resolvers.length).to.equal(2);
    aiceUtils.parameters.fileManager = null;
  });
});
