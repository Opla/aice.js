import chai from 'chai';
import { NamedEntity, EnumEntity, RegExpEntity } from '../../src/streamTransformers';

const { expect } = chai;

describe('Named/EnumEntity', () => {
  it('EnumEntity should throw err if no enumeration is passed', () => {
    expect(() => new EnumEntity({})).to.throw('Invalid Entity constructor - Missing enum');
  });

  it('RegExpEntity should throw err if no regex provided', () => {
    expect(() => new RegExpEntity({})).to.throw('Invalid Entity constructor - Missing regex');
  });

  it('NamedEntity should throw err if no name provided', () => {
    expect(() => new NamedEntity({})).to.throw('Invalid Entity constructor - name are required');
  });

  it('NamedEntity should add parameters ', () => {
    const ne = new NamedEntity({ name: 'testentity' });
    const param = { var1: 'value1' };
    ne.addParameter(param);

    expect(ne.getParameter('var1')).to.equal(param.var1);
    ne.addParameter(param);
    expect(ne.parameters.length).to.equal(1);
  });

  it('should not call extract on NamedEntity', () => {
    expect(() => new NamedEntity({ name: 'test' }).extract()).to.throw(
      'Invalid NamedEntity extraction - Should be implemented in child class',
    );
  });
});
