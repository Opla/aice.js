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
  it('Should train all sub-outputRenderer ', () => {
    const outputRenderingManager = new OutputRenderingManager({});
    outputRenderingManager.train([1]);

    expect(outputRenderingManager.outputRenderers[0].outputs.length).to.equal(1);
  });

  it('Should custom intentResolvers using settings', () => {
    const outputRenderingManager = new OutputRenderingManager({
      settings: { outputRenderers: [new OutputRenderer({ name: 'test-renderer' })] },
    });
    expect(outputRenderingManager.outputRenderers.length).to.equal(1);
  });

  it('Should execute outputRenderers - NEED TO BE TWICK WITH ALL NEW FUTURE RENDERERS', async () => {
    const outputRenderingManager = new OutputRenderingManager({});
    const result = await outputRenderingManager.execute('fr', [], {});

    expect(result).to.equal(undefined);
  });
});
