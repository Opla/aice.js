/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import chai from 'chai';
import { OutputRenderingManager, OutputRenderer } from '../../src/outputRendering';

const { expect } = chai;

describe('OutputRenderingManager', () => {
  it('Should train nothing ', async () => {
    const outputRenderingManager = new OutputRenderingManager();
    await outputRenderingManager.train();

    expect(outputRenderingManager.outputRenderers[0].outputs.length).to.equal(0);
  });

  it('Should train all sub-outputRenderer ', async () => {
    const outputRenderingManager = new OutputRenderingManager({});
    await outputRenderingManager.train([1]);

    expect(outputRenderingManager.outputRenderers[0].outputs.length).to.equal(1);
  });

  it('Should custom intentResolvers using settings', async () => {
    const outputRenderingManager = new OutputRenderingManager({
      outputRenderers: [new OutputRenderer({ name: 'test-renderer' })],
    });
    expect(outputRenderingManager.outputRenderers.length).to.equal(1);
  });

  it('Should execute outputRenderers - NEED TO BE TWICK WITH ALL NEW FUTURE RENDERERS', async () => {
    const outputRenderingManager = new OutputRenderingManager({});
    const result = await outputRenderingManager.execute('fr', undefined, {});

    expect(result).to.equal(undefined);
  });
});
