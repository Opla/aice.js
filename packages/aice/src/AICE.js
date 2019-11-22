/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { IntentsResolverManager } from './intentResolvers';
import { OutputRenderingManager } from './outputRendering';
import { InputExpressionTokenizer, OutputExpressionTokenizer } from './streamTransformers/expression';
import { NamedEntityTokenizer } from './streamTransformers/tokenizer';
import { NERManager, SystemEntities } from './streamTransformers';
import buildServices from './services';

export default class AICE {
  constructor({ services = {}, ...settings } = { defaultLanguage: 'en' }) {
    this.settings = settings;
    this.services = buildServices(services);
    this.inputs = [];
    this.outputs = [];
    // StreamsTransformers
    this.NERManager = new NERManager();
    this.NamedEntityTokenizer = new NamedEntityTokenizer(this.NERManager);
    this.InputExpressionTokenizer = new InputExpressionTokenizer();
    this.OutputExpressionTokenizer = new OutputExpressionTokenizer();

    this.IntentResolverManager = new IntentsResolverManager(this.settings);
    this.OutputRenderingManager = new OutputRenderingManager(this.settings);

    SystemEntities.getSystemEntities().forEach(e => {
      this.NERManager.addNamedEntity(e);
    });
  }

  /**
   * Returns all entities.
   */
  getAllEntities() {
    return this.NERManager.entities;
  }

  /**
   * Returns all variables.
   */
  getAllVariables() {
    const variables = this.inputs.reduce((acc, i) => {
      const { tokenizedInput } = i;
      for (const { expression } of tokenizedInput.values()) {
        const variableName = expression && (expression.contextName || expression.type.toLowerCase());
        if (variableName && !acc.includes(variableName)) acc.push(variableName);
      }
      return acc;
    }, []);

    return variables;
  }

  /**
   * Returns a normalized input
   * Looks for the entities in a input and directly creates the NLX Syntax version.
   * @param {String} lang Language of the input.
   * @param {String} inputText The input text to be normalized.
   */
  normalizeInputEntities(lang, inputText) {
    return this.NERManager.normalizeEntityUtterance(lang, inputText);
  }

  /**
   * Adds an named entity.
   * @param {NamedEntity} namedEntity Devivated NamedEntity class.
   */
  addEntity(namedEntity) {
    if (this.NERManager.entities.filter(e => e.name === namedEntity.name).length === 0)
      this.NERManager.addNamedEntity(namedEntity);
  }

  /**
   * Adds a new input associated to an intent for the given language.
   * @param {String} lang Language of the input.
   * @param {String} intentid Intent name/id.
   * @param {String} input Text of the input includes Input NLX syntax.
   * @param {String} topic The topic, is used to attach a input to a group that only can be reach if in that topic.
   */
  addInput(lang, intentid, input, previous = [], topic = '*') {
    if (!lang || !input || !intentid) {
      throw new Error('AICE addInput - Has some missing mandatory parameters');
    }
    const tokenizedInput = this.InputExpressionTokenizer.tokenize(input);
    const document = { lang, input, tokenizedInput, intentid, previous, topic };

    if (this.inputs.filter(i => i.lang === lang && i.input === input && i.intentid === intentid).length === 0) {
      this.inputs.push(document);
    }
  }

  /**
   * Adds a new ouput associated to an intent for the given language.
   * @param {String} lang Language of the output.
   * @param {String} intentid Intent name/id.
   * @param {String} output Text of the output can includes Output NLX syntax.
   * @param {AsyncFunction} preConditionsCallable Pre-Conditions callables executed before conditions. (should mutate context)
   * @param {Array} conditions Conditions to be evaluated.
   * @param {AsyncFunction} preRenderCallable Pre-Render callables executed before redering only if conditions are checked. (can mutate context)
   */
  addOutput(lang, intentid, output, preConditionsCallable, conditions = [], preRenderCallable) {
    if (!lang || !output || !intentid) {
      throw new Error('AICE addOutput - Has some missing mandatory parameters');
    }
    const tokenizedOutput = this.OutputExpressionTokenizer.tokenize(output);
    const preCallables = [];
    if (preConditionsCallable) {
      preCallables.push({ func: preConditionsCallable });
    }
    const callables = [];
    if (preRenderCallable) {
      callables.push({ func: preRenderCallable });
    }
    const answer = {
      lang,
      output,
      tokenizedOutput,
      preCallables,
      conditions,
      callables,
    };

    const intentOutput = this.outputs.find(o => o.intentid === intentid);
    if (!intentOutput) {
      this.outputs.push({ intentid, outputType: 'random', answers: [answer] });
    } else if (intentOutput.answers.filter(a => a.lang === lang && a.output === output).length === 0) {
      intentOutput.answers.push(answer);
    }
  }

  /**
   * Removes all inputs and outputs
   */
  clear() {
    this.inputs = [];
    this.outputs = [];
  }

  /**
   * Train all resolvers and renderers
   */
  async train() {
    await this.IntentResolverManager.train(this.inputs);
    await this.OutputRenderingManager.train(this.outputs);
  }

  /**
   * Evaluate an utterance to fully understand it.
   * The process is:
   * - Streams Transformer: Tokenize the utterance and look for entities using NER
   * - Intents Resolvers: Look for the user intention
   * - Output Rendering: Handles callables, conditions and the rendering/generation of the answer.
   * @param {String} utterance Text writen by the user
   * @param {Object} context The context object
   * @param {String} lang Default lang is french.
   * @returns {reponse} An object containing: answer, score, intent, context
   */
  async evaluate(utterance, context = {}, lang = this.settings.defaultLanguage) {
    // Streams Transformer
    // Tokenize the utterance and look for entities using NER
    const tokenizedUtterance = this.NamedEntityTokenizer.tokenize(lang, utterance);

    // Intents Resolvers
    const result = await this.IntentResolverManager.evaluate(lang, tokenizedUtterance, context);
    const ctx = { ...context, ...((result && result[0]) || {}).context };

    // Output Rendering
    const answer = await this.OutputRenderingManager.execute(lang, result, ctx);
    return {
      answer: (answer || {}).renderResponse,
      score: answer ? answer.score : 0,
      intent: (answer || {}).intentid,
      context: (answer && answer.context) || ctx,
    };
  }
}
