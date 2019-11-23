/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import chai from 'chai';
import { AICE } from '../../src';
import { IntentsResolverManager } from '../../src/intentResolvers';
import { InputExpressionTokenizer, AdvancedTokenizer } from '../../src/streamTransformers';

const { expect } = chai;

const tokenizerInput = new InputExpressionTokenizer();
const tokenizerUtterance = AdvancedTokenizer;

describe('Fixes issues', async () => {
  // https://github.com/Opla/aice.js/issues/63
  it('Should exact match the unique result #63', async () => {
    const resolverManager = new IntentsResolverManager({});
    await resolverManager.train([
      { lang: 'us', topic: '*', intentid: 1, tokenizedInput: tokenizerInput.tokenize('f100a'), input: 'f100a' },
      { lang: 'us', topic: '*', intentid: 2, tokenizedInput: tokenizerInput.tokenize('f100b'), input: 'f100b' },
      { lang: 'us', topic: '*', intentid: 3, tokenizedInput: tokenizerInput.tokenize('{{*}}'), input: '{{*}}' },
    ]);

    // If an exact match is found it should be the unique result
    let result = await resolverManager.evaluate('us', tokenizerUtterance.tokenize('f100b'));
    expect(result.length).to.equal(1);
    expect(result[0].intentid).to.equal(2);
    expect(result[0].score).to.equal(1);

    // If a sentence is composed of number+alpha+special only use exact match
    result = await resolverManager.evaluate('us', tokenizerUtterance.tokenize('f100c'));
    expect(result.length).to.equal(1);
    expect(result[0].intentid).to.equal(3);
    expect(result[0].score).to.equal(0.9);
  });

  // https://github.com/Opla/aice.js/issues/81
  it('Should an intent match without any output #81', async () => {
    const aice = new AICE({
      debug: true,
      rules: { no_AnyOrNothing: true },
      services: { logger: { enabled: true }, tracker: { enabled: true } },
    });
    // Initialization
    aice.addInput('en', 'agent.presentation', 'Hello');
    aice.addInput('en', 'agent.presentation', 'Hi');
    await aice.train(true);
    let issues = aice.services.tracker.getIssues();
    expect(issues.length).to.equal(1);
    expect(issues[0].type).to.equal('error');
    expect(issues[0].message).to.equal('No output linked');
    expect(issues[0].description).to.equal(`This intent "agent.presentation" doesn't have any output`);
    expect(issues[0].refs).to.eql([{ id: 'agent.presentation' }]);
    const res = await aice.evaluate('Hello', {}, 'en');
    expect(res.score).to.equal(1);
    expect(res.answer).to.equal(undefined);
    expect(res.intent).to.eql({ id: 'agent.presentation', inputIndex: 0 });
    ({ issues } = res);
    expect(issues.length).to.equal(1);
    expect(issues[0].type).to.equal('error');
    expect(issues[0].message).to.equal('No output linked');
    expect(issues[0].description).to.equal(`This intent "agent.presentation" doesn't have any output`);
    expect(issues[0].refs).to.eql([{ id: 'agent.presentation' }]);
  });
  it('Should an intent match without any output #81', async () => {
    const aice = new AICE({ debug: true, services: { logger: { enabled: true }, tracker: { enabled: true } } });
    // Initialization
    aice.addInput('en', 'agent.presentation', 'Hello');
    aice.addOutput('en', 'agent.presentation', 'Hello', null, [
      { type: 'LeftRightExpression', leftOperand: 'name', operator: 'eq', rightOperand: '"value"' },
    ]);
    await aice.train(true);
    let issues = aice.services.tracker.getIssues();
    expect(issues.length).to.equal(1);
    const res = await aice.evaluate('Hello', {}, 'en');
    expect(res.score).to.equal(1);
    expect(res.answer).to.equal(undefined);
    expect(res.intent).to.eql({ id: 'agent.presentation', inputIndex: 0, outputIndex: undefined });
    ({ issues } = res);
    expect(issues.length).to.equal(1);
    expect(issues[0].type).to.equal('error');
    expect(issues[0].message).to.equal('No condition matched');
    expect(issues[0].description).to.equal(`Output conditions for this intent "agent.presentation" don't match`);
    expect(issues[0].refs).to.eql([{ id: 'agent.presentation' }]);
  });
  it('Should train in debug without any get one "any" issue #81', async () => {
    const aice = new AICE({ debug: true, services: { logger: { enabled: true }, tracker: { enabled: true } } });
    // Initialization
    aice.addInput('en', 'agent.presentation', 'Hello');
    aice.addOutput('en', 'agent.presentation', 'Hello');
    await aice.train(true);
    const issues = aice.services.tracker.getIssues();
    expect(issues.length).to.equal(1);
    expect(issues[0].type).to.equal('warning');
    expect(issues[0].message).to.equal('No any intent found');
    expect(issues[0].description).to.equal(
      `An agent need an intent with an input containing an any or a anyorNothing entry`,
    );
    const res = await aice.evaluate('Hello', {}, 'en');
    expect(res.score).to.equal(1);
    expect(res.answer).to.equal('Hello');
    expect(res.issues).to.equal(undefined);
  });
  it('Should train in debug disable rule: no_anyornothing issue #81', async () => {
    const aice = new AICE({ debug: true, services: { logger: { enabled: true }, tracker: { enabled: true } } });
    // Initialization
    aice.addInput('en', 'agent.presentation', 'Hello');
    await aice.train(true, { no_AnyOrNothing: true });
    const issues = aice.services.tracker.getIssues();
    expect(issues.length).to.equal(1);
    const res = await aice.evaluate('Hello', {}, 'en');
    expect(res.score).to.equal(1);
    expect(res.answer).to.equal(undefined);
    expect(res.issues.length).to.equal(1);
  });

  it('Should a any replace a matched intent without output #81', async () => {
    const aice = new AICE({ debug: true, services: { logger: { enabled: true }, tracker: { enabled: true } } });
    // Initialization
    aice.addInput('en', 'agent.presentation', 'Hello');
    aice.addInput('en', 'agent.any', '{{*}}');
    aice.addOutput('en', 'agent.any', "I don't understand");
    await aice.train(true);
    let issues = aice.services.tracker.getIssues();
    expect(issues.length).to.equal(1);
    const res = await aice.evaluate('Hello', {}, 'en');
    expect(res.score).to.equal(1);
    expect(res.answer).to.equal("I don't understand");
    expect(res.anyOrNothing).to.eql({ id: 'agent.any', inputIndex: 0, outputIndex: 0 });
    expect(res.isAnyOrNothing).to.equal(undefined);
    expect(res.intent).to.eql({ id: 'agent.presentation', inputIndex: 0 });
    ({ issues } = res);
    expect(issues.length).to.equal(1);
    expect(issues[0].type).to.equal('error');
    expect(issues[0].message).to.equal('No output linked');
    expect(issues[0].description).to.equal(`This intent "agent.presentation" doesn't have any output`);
    expect(issues[0].refs).to.eql([{ id: 'agent.presentation' }]);
  });

  // https://github.com/Opla/aice.js/issues/82
  it('Should an intent match return input & output index #82', async () => {
    const aice = new AICE();
    // Initialization
    aice.addInput('en', 'agent.presentation', 'Hello');
    aice.addInput('en', 'agent.presentation', 'Hola');
    aice.addInput('en', 'agent.presentation', 'Hi');
    aice.addOutput('en', 'agent.presentation', 'Hello');
    aice.addOutput('en', 'agent.presentation', 'Your welcome');
    await aice.train();
    const res = await aice.evaluate('Hello', {}, 'en');
    expect(res.intent.id).to.equal('agent.presentation');
    expect(res.intent.inputIndex).to.equal(0);
    expect(res.intent.outputIndex).to.oneOf([0, 1]);
  });

  // https://github.com/Opla/aice.js/issues/83
  it('Should create an issue if an intent have inputs conflict #83', async () => {
    const aice = new AICE({ services: { logger: { enabled: true }, tracker: { enabled: true } } });
    // Initialization
    aice.addInput('en', 'agent.presentation', 'Welcome');
    aice.addInput('en', 'agent.presentation', 'Hello');
    aice.addOutput('en', 'agent.presentation', 'Your welcome');
    aice.addInput('en', 'agent.hello', 'Hello');
    aice.addOutput('en', 'agent.hello', 'Hello');
    await aice.train(true, { no_AnyOrNothing: true });
    let issues = aice.services.tracker.getIssues();
    expect(issues.length).to.equal(1);
    expect(issues[0].type).to.equal('warning');
    expect(issues[0].message).to.equal('Input conflict');
    expect(issues[0].description).to.equal('Same input "Hello" between agent.presentation[1] and agent.hello[2]');
    expect(issues[0].refs).to.eql([
      { id: 'agent.presentation', index: 1 },
      { id: 'agent.hello', index: 2 },
    ]);
    const res = await aice.evaluate('Hello', {}, 'en');
    expect(res.intent).to.eql({ id: 'agent.presentation', inputIndex: 1, outputIndex: 0 });
    ({ issues } = res);
    expect(issues.length).to.equal(1);
    expect(issues[0].type).to.equal('warning');
    expect(issues[0].message).to.equal('Input conflict');
    expect(issues[0].description).to.equal('Same input "Hello" between agent.presentation[1] and agent.hello[2]');
    expect(issues[0].refs).to.eql([
      { id: 'agent.presentation', index: 1 },
      { id: 'agent.hello', index: 2 },
    ]);
  });
});
