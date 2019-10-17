import chai from 'chai';
import { ContextMutator } from '../../src/utils';

const { expect } = chai;

describe('ContextMutator', () => {
  it('Context mutation setToContext', () => {
    const context = {};
    const variable = { name: 'varname', value: 'sometext' };
    ContextMutator.setToContext(context, variable);
    expect(context.varname).to.equal('sometext');
  });

  it('Context mutation setToContext - reaffect', () => {
    const context = { varname: 'initial value' };
    const variable = { name: 'varname', value: 'sometext' };
    ContextMutator.setToContext(context, variable);
    expect(context.varname).to.equal('sometext');
  });

  it('Context mutation addVariableToContext', () => {
    const context = {};
    const variable = { name: 'varname', value: 'sometext' };
    ContextMutator.addVariableToContext(context, variable);
    expect(context.varname).to.equal('sometext');
  });

  it('Context mutation addVariableToContext - multiple times same name', () => {
    const context = {};
    const variable = { name: 'varname', value: 'sometext' };
    ContextMutator.addVariableToContext(context, variable);
    expect(context.varname).to.equal('sometext');

    ContextMutator.addVariableToContext(context, variable);
    expect(context.varname_1).to.equal('sometext');

    ContextMutator.addVariableToContext(context, variable);
    expect(context.varname_2).to.equal('sometext');
  });

  it('Context mutation addEntityToContext', () => {
    const context = {};
    const entity = { name: 'email', match: 'opla@opla.ai' };
    ContextMutator.addEntityToContext(context, entity);
    expect(context.email).to.equal('opla@opla.ai');
  });

  it('Context mutation addEntityToContext - multiple times same name', () => {
    const context = {};
    const entity = { name: 'email', match: 'opla@opla.ai' };
    ContextMutator.addEntityToContext(context, entity);
    expect(context.email).to.equal('opla@opla.ai');

    ContextMutator.addEntityToContext(context, entity);
    expect(context.email_1).to.equal('opla@opla.ai');

    ContextMutator.addEntityToContext(context, entity);
    expect(context.email_2).to.equal('opla@opla.ai');
  });

  it('Context mutation indexOf error', () => {
    const context = { email: 'test@opla.ai' };
    const entity = { name: 'email', match: 'opla@opla.ai' };
    ContextMutator.addEntityToContext(context, entity);
    expect(context.email).to.equal('test@opla.ai');
    expect(context.email_1).to.equal('opla@opla.ai');
  });
});
