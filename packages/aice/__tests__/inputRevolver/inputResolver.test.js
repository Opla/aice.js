/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import chai from 'chai';
import { IntentResolver } from '../../src/intentResolvers';

const { expect } = chai;

describe('IntentsResolver', () => {
  it('Should throw error if no settings with name provided', () => {
    expect(() => new IntentResolver()).to.throw('Invalid IntentResolverconstructor - Missing name');
  });

  it('Should throw error if no name provided', () => {
    expect(() => new IntentResolver({})).to.throw('Invalid IntentResolverconstructor - Missing name');
  });

  it('Should train model - Empty case', async () => {
    const resolver = new IntentResolver({ name: 'test-resolver' });
    await resolver.train();

    expect(resolver.inputs).to.eql([]);
  });

  it('Should train model', async () => {
    const resolver = new IntentResolver({ name: 'test-resolver' });
    await resolver.train([1]);

    expect(resolver.inputs).to.eql([1]);
  });

  it('Should execute with filter using LANG', async () => {
    const resolver = new IntentResolver({ name: 'test-resolver' });
    await resolver.train([{ lang: 'fr', topic: '*', id: 1 }, { lang: 'en', topic: '*', id: 2 }]);

    const result = await resolver.execute('fr', '', {});
    expect(result.length).to.equal(1);
    expect(result[0].id).to.equal(1);
    expect(result[0].lang).to.equal('fr');
  });

  it('Should train and execute using callbacks', async () => {
    let train;
    const cbTrain = inputs => {
      train = 'ok';
      return [inputs[1]];
    };
    const cbExecute = () => [{ id: 1, lang: 'us' }];
    const resolver = new IntentResolver({ name: 'test-resolver', cbTrain, cbExecute });
    await resolver.train([{ lang: 'fr', topic: '*', id: 1 }, { lang: 'en', topic: '*', id: 2 }]);
    expect(resolver.inputs.length).to.equal(1);
    const result = await resolver.execute('en', '', {});
    expect(result.length).to.equal(1);
    expect(result[0].id).to.equal(1);
    expect(result[0].lang).to.equal('us');
    expect(train).to.equal('ok');
  });
  it('Should train and evaluate using callbacks', async () => {
    let train;
    const cbTrain = inputs => {
      train = 'ok';
      return [inputs[1]];
    };
    const cbEvaluate = () => [{ id: 1, lang: 'us' }];
    const resolver = new IntentResolver({ name: 'test-resolver', cbTrain, cbEvaluate });
    await resolver.train([{ lang: 'fr', topic: '*', id: 1 }, { lang: 'en', topic: '*', id: 2 }]);
    expect(resolver.inputs.length).to.equal(1);
    const result = await resolver.evaluate('en', '', {});
    expect(result.length).to.equal(1);
    expect(result[0].id).to.equal(1);
    expect(result[0].lang).to.equal('us');
    expect(train).to.equal('ok');
  });
});
