/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import chai from 'chai';
import { IntentsResolver } from '../../src/intentsResolver';

const { expect } = chai;

describe('IntentsResolver', () => {
  it('Should throw error if no name provided', () => {
    expect(() => new IntentsResolver({})).to.throw('Invalid IntentsResolver constructor - Missing name');
  });

  it('Should train model - Empty case', () => {
    const resolver = new IntentsResolver({ name: 'test-resolver' });
    resolver.train();

    expect(resolver.inputs).to.eql([]);
  });

  it('Should train model', () => {
    const resolver = new IntentsResolver({ name: 'test-resolver' });
    resolver.train([1]);

    expect(resolver.inputs).to.eql([1]);
  });

  it('Should process with filter using LANG', () => {
    const resolver = new IntentsResolver({ name: 'test-resolver' });
    resolver.train([{ lang: 'fr', topic: '*', id: 1 }, { lang: 'en', topic: '*', id: 2 }]);

    const result = resolver.process('fr', {});
    expect(result.length).to.equal(1);
    expect(result[0].id).to.equal(1);
  });
});
