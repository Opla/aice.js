/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import chai from 'chai';
import { RemoteIntentResolver } from '../../src/intentResolvers';

const { expect } = chai;

class DummyFetchBody {
  constructor(data) {
    this.data = data;
  }
  // eslint-disable-next-line lines-between-class-members
  async json() {
    return this.data;
  }
}

describe('RemoteIntentsResolver', () => {
  it('Should throw error if no fetch function provided', () => {
    expect(() => new RemoteIntentResolver({ name: 'test-resolver' })).to.throw(
      'Invalid RemoteIntentResolverconstructor - Missing fetch function',
    );
  });
  it('Should throw error if no url provided', () => {
    const fetch = () => [];
    expect(() => new RemoteIntentResolver({ name: 'test-resolver', fetch })).to.throw(
      'Invalid RemoteIntentResolverconstructor - Missing url',
    );
  });

  it('Should train empty model', async () => {
    const fetch = async (uri, { method, body }) => {
      expect(uri).to.eql('stub/train');
      expect(method).to.eql('POST');
      const res = JSON.parse(body);
      expect(res.intents).to.eql([]);
      return new DummyFetchBody({ intents: [{ id: 1, inputs: ['hello', 'hi', 'Yo'] }] });
    };
    const resolver = new RemoteIntentResolver({ name: 'test-resolver', fetch, url: 'stub' });
    await resolver.train();
    expect(resolver.inputs).to.eql([{ id: 1, inputs: ['hello', 'hi', 'Yo'] }]);
  });

  it('Should train model', async () => {
    const fetch = async (uri, { method, body }) => {
      expect(uri).to.eql('stub/train');
      expect(method).to.eql('POST');
      const res = JSON.parse(body);
      expect(res.intents).to.eql([{ id: 1, inputs: ['hello', 'hi'] }]);
      return new DummyFetchBody({ intents: [{ id: 1, inputs: ['hello', 'hi', 'Yo'] }] });
    };
    const resolver = new RemoteIntentResolver({ name: 'test-resolver', fetch, url: 'stub' });
    await resolver.train([{ id: 1, inputs: ['hello', 'hi'] }]);
    expect(resolver.inputs).to.eql([{ id: 1, inputs: ['hello', 'hi', 'Yo'] }]);
  });

  it('Should execute', async () => {
    const fetch = async (uri, { method, body }) => {
      expect(uri).to.eql('stub/execute');
      expect(method).to.eql('POST');
      const res = JSON.parse(body);
      expect(res.lang).to.eql('fr');
      return new DummyFetchBody([{ id: 1, lang: 'fr' }]);
    };
    const resolver = new RemoteIntentResolver({ name: 'test-resolver', fetch, url: 'stub' });

    const result = await resolver.execute('fr', '', {});
    expect(result.length).to.equal(1);
    expect(result[0].id).to.equal(1);
    expect(result[0].lang).to.equal('fr');
  });

  it('Should evaluate', async () => {
    const fetch = async (uri, { method, body }) => {
      expect(uri).to.eql('stub/evaluate');
      expect(method).to.eql('POST');
      const res = JSON.parse(body);
      expect(res.lang).to.eql('fr');
      return new DummyFetchBody([{ id: 1, lang: 'fr' }]);
    };
    const resolver = new RemoteIntentResolver({ name: 'test-resolver', fetch, url: 'stub' });

    const result = await resolver.evaluate('fr', '', {});
    expect(result.length).to.equal(1);
    expect(result[0].id).to.equal(1);
    expect(result[0].lang).to.equal('fr');
  });
});
