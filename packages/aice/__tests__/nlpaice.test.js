/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import chai from 'chai';
import { AICE } from '../src';
import { SystemEntities, RegExpEntity } from '../src/streamTransformers';

const { expect } = chai;

describe('AICE NLP', () => {
  it('Basic Use Case - All API', async () => {
    const aice = new AICE();
    // Initialization
    aice.addInput('fr', 'agent.presentation', 'Bonjour');
    aice.addInput('fr', 'agent.presentation', 'Coucou');
    aice.addInput('fr', 'agent.presentation', 'Salut');

    aice.addOutput('fr', 'agent.presentation', 'Coucou :)');

    aice.addInput('fr', 'agent.askname', '{{^}} je suis {{name=*}}');
    aice.addInput('fr', 'agent.askname', "{{^}} je m'appelle {{name=*}}");

    aice.addOutput('fr', 'agent.askname', 'Hello {{name}}');

    aice.addInput('fr', 'agent.bye', '{{^}}bye{{^}}');
    aice.addInput('fr', 'agent.bye', '{{^}}a la prochaine{{^}}');
    aice.addInput('fr', 'agent.bye', '{{^}}bonne journée{{^}}');

    aice.addOutput('fr', 'agent.bye', 'A la prochaine!');

    // Fallback
    aice.addInput('fr', 'agent.fallback', '{{*}}');

    aice.addOutput('fr', 'agent.fallback', "Je n'ai pas compris");

    await aice.train();

    // Tests
    const context = {};
    let res = await aice.evaluate('bonjour', context, 'fr');
    expect(res.score).to.equal(1.0);
    expect(res.intent).to.eql({ id: 'agent.presentation', inputIndex: 0, outputIndex: 0 });
    expect(res.answer).to.equal('Coucou :)');

    res = await aice.evaluate("Superbe, je m'appelle lloyd", context, 'fr');
    expect(res.score).to.equal(1.0);
    expect(res.intent).to.eql({ id: 'agent.askname', inputIndex: 1, outputIndex: 0 });
    expect(res.answer).to.equal('Hello lloyd');

    res = await aice.evaluate('Squeezie ft Joyca - Bye Bye', context, 'fr');
    expect(res.score).to.equal(1.0);
    expect(res.intent).to.eql({ id: 'agent.bye', inputIndex: 0, outputIndex: 0 });
    expect(res.answer).to.equal('A la prochaine!');
  });

  it('AICE - No intents', async () => {
    const aice = new AICE({ threshold: 0.65 });
    await aice.train();
    const res = await aice.evaluate('Hello', context, 'en');

    expect(res.score).to.equal(0);
    expect(res.intent).to.equal(undefined);
    expect(res.answer).to.equal(undefined);
  });

  it('AICE - API getAllEntities', () => {
    const aice = new AICE();
    expect(aice.getAllEntities().length).to.equal(SystemEntities.getSystemEntities().length);
  });

  it('AICE - API addEntity', () => {
    const aice = new AICE();
    aice.addEntity(new RegExpEntity({ name: 'test', regex: /test/gi }));
    expect(aice.getAllEntities().length).to.equal(SystemEntities.getSystemEntities().length + 1);
  });

  it('AICE - API addEntity same entity name twice', () => {
    const aice = new AICE();
    aice.addEntity(new RegExpEntity({ name: 'test', regex: /test/gi }));
    aice.addEntity(new RegExpEntity({ name: 'test', regex: /test/gi }));
    expect(aice.getAllEntities().length).to.equal(SystemEntities.getSystemEntities().length + 1);
  });

  it('AICE - API addInput', () => {
    const aice = new AICE();
    aice.addInput('en', 'Hey', 'agent.presentation');
    expect(aice.inputs.length).to.equal(1);
  });

  it('AICE - API addInput same input twice', () => {
    const aice = new AICE();
    aice.addInput('en', 'Hey', 'agent.presentation');
    aice.addInput('en', 'Hey', 'agent.presentation');
    expect(aice.inputs.length).to.equal(1);
  });

  it('AICE - API addInput no parameters throws an error', () => {
    const aice = new AICE();
    const res = () => aice.addInput();
    expect(res).to.throw(Error, 'AICE addInput - Has some missing mandatory parameters');
  });

  it('AICE - API addOutput', () => {
    const aice = new AICE();
    aice.addOutput('en', 'agent.presentation', 'Hey');
    const numberAnswers = aice.outputs[0].answers.length;
    expect(numberAnswers).to.equal(1);
  });

  it('AICE - API addOutput same output twice', () => {
    const aice = new AICE();
    aice.addOutput('en', 'agent.presentation', 'Hey');
    aice.addOutput('en', 'agent.presentation', 'Hey');
    const numberAnswers = aice.outputs[0].answers.length;
    expect(numberAnswers).to.equal(1);
  });
  it('AICE - API addOutput same output fr/en', () => {
    const aice = new AICE();
    aice.addOutput('en', 'agent.presentation', 'Hey');
    aice.addOutput('fr', 'agent.presentation', 'Salut');
    const numberAnswers = aice.outputs[0].answers.length;
    expect(numberAnswers).to.equal(2);
  });

  it('AICE - API addOutput callables', () => {
    const aice = new AICE();
    aice.addOutput(
      'en',
      'agent.presentation',
      'Hey',
      () => {},
      [],
      () => {},
    );
    const numberAnswers = aice.outputs[0].answers.length;
    expect(numberAnswers).to.equal(1);
  });

  it('AICE - API addOutput no parameters throws an error', () => {
    const aice = new AICE();
    const res = () => aice.addOutput();
    expect(res).to.throw(Error, 'AICE addOutput - Has some missing mandatory parameters');
  });

  it('AICE - API clear', () => {
    const aice = new AICE();
    aice.addInput('en', 'Hey', 'agent.presentation');
    aice.clear();
    expect(aice.inputs.length).to.equal(0);
    expect(aice.outputs.length).to.equal(0);
  });

  it('AICE - API normalizeInputEntities', () => {
    const aice = new AICE();
    const normalizedEntities = aice.normalizeInputEntities('fr', 'My informations are: example@mail.com 0625475309');
    expect(normalizedEntities).to.equal('My informations are: @email @phonenumber');
  });

  it('AICE - API getAllVariables', () => {
    const aice = new AICE();

    aice.addInput('fr', 'agent.askname', "{{^}} je m'appelle {{name=*}}");
    aice.addInput('fr', 'agent.askmail', 'My mail is {{email=@email}} {{^}}');

    const variables = aice.getAllVariables();
    expect(variables).to.eql(['anyornothing', 'name', 'email']);
  });

  it('AICE - Intent reference WIP', async () => {
    const aice = new AICE();
    // Initialization
    aice.addInput('en', 'agent.presentation', 'Hello {{name=*}}');
    aice.addOutput('en', 'agent.presentation', 'Hello {{name}} :)');

    aice.addInput('en', 'agent.yeah', 'Yeah');
    aice.addOutput('en', 'agent.yeah', 'Your Welcome !');
    await aice.train();

    // Tests
    const res = await aice.evaluate('Yeah');
    expect(res.score).to.equal(1.0);
    expect(res.intent).to.eql({ id: 'agent.yeah', inputIndex: 0, outputIndex: 0 });
    expect(res.answer).to.equal('Your Welcome !');
  });
});
