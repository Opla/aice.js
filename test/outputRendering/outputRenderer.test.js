/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import chai from 'chai';
import { OutputRenderer } from '../../src/outputRendering';

const { expect } = chai;

describe('OutputRenderer', () => {
  it('Should throw error if no name provided', () => {
    expect(() => new OutputRenderer({})).to.throw('Invalid OutputRenderer constructor - Missing name');
  });

  it('Should train model - Empty case', () => {
    const renderer = new OutputRenderer({ name: 'test-renderer' });
    renderer.train();

    expect(renderer.outputs).to.eql([]);
  });

  it('Should train model', () => {
    const renderer = new OutputRenderer({ name: 'test-renderer' });
    renderer.train([1]);

    expect(renderer.outputs).to.eql([1]);
  });

  it('Should throw error, execute need to be override in sub-class', async () => {
    const renderer = new OutputRenderer({ name: 'test-renderer' });
    await renderer
      .execute()
      .catch(err =>
        expect(err.message).to.equal('Invalid OutputRenderer - execute() should be implemented in child class'),
      );
  });
});
