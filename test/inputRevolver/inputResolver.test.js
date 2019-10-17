import chai from 'chai';
import { IntentResolver } from '../../src/intentsResolver';

const { expect } = chai;

describe('IntentResolver', () => {
  it('Should throw error if no name provided', () => {
    expect(() => new IntentResolver({})).to.throw('Invalid IntentsResolver constructor - Missing name');
  });

  it('Should train model - Empty case', () => {
    const resolver = new IntentResolver({ name: 'test-resolver' });
    resolver.train();

    expect(resolver.inputs).to.eql([]);
  });

  it('Should train model', () => {
    const resolver = new IntentResolver({ name: 'test-resolver' });
    resolver.train([1]);

    expect(resolver.inputs).to.eql([1]);
  });

  it('Should process with filter using LANG', () => {
    const resolver = new IntentResolver({ name: 'test-resolver' });
    resolver.train([{ lang: 'fr', topic: '*', id: 1 }, { lang: 'en', topic: '*', id: 2 }]);

    const result = resolver.process('fr', {});
    expect(result.length).to.equal(1);
    expect(result[0].id).to.equal(1);
  });
});
