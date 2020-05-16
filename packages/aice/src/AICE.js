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
import { NERManager, SystemEntities, EnumEntity } from './streamTransformers';
import buildServices from './services';
import issuesFactory from './issues';
import { Utils } from './utils';
import Tools from './Tools';

const defaultLanguage = 'en';
const defaultThreshold = 0.75;

export default class AICE {
  constructor({ services = {}, ...settings } = {}) {
    this.settings = settings;
    if (!this.settings.defaultLanguage) {
      this.settings.defaultLanguage = defaultLanguage;
    }
    if (!this.settings.threshold) {
      this.settings.threshold = defaultThreshold;
    }
    this.services = buildServices(services);
    this.services.issuesFactory = issuesFactory;
    this.settings.services = this.services;
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
  addEntity(namedEntity, type) {
    if (this.NERManager.entities.filter(e => e.name === namedEntity.name).length === 0) {
      if (type === 'enum') {
        this.NERManager.addNamedEntity(new EnumEntity(namedEntity));
      } else {
        this.NERManager.addNamedEntity(namedEntity);
      }
    }
  }

  /**
   * Adds a new input associated to an intent for the given language.
   * @param {String} lang Language of the input.
   * @param {String} intentid Intent name/id.
   * @param {String} input Text of the input includes Input NLX syntax.
   * @param {String} topic The topic, is used to attach a input to a group that only can be reach if in that topic.
   */
  addInput(lang, intentid, input, previous = [], topic = '*') {
    if (!Utils.isEmpty(lang) || !Utils.isEmpty(input) || !Utils.isEmpty(intentid)) {
      throw new Error('AICE addInput - Has some missing mandatory parameters');
    }
    const tokenizedInput = this.InputExpressionTokenizer.tokenize(input);
    const index = this.inputs.filter(i => i.lang === lang && i.intentid === intentid).length;
    const document = { lang, input, tokenizedInput, intentid, previous, topic, index };

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
    if (!Utils.isEmpty(lang) || !Utils.isEmpty(output) || !Utils.isEmpty(intentid)) {
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
      answer.index = 0;
      this.outputs.push({ intentid, outputType: 'random', answers: [answer] });
    } else if (intentOutput.answers.filter(a => a.lang === lang && a.output === output).length === 0) {
      answer.index = intentOutput.answers.length;
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
  async train(debug = false, _rules) {
    const rules = _rules || this.settings.rules || {};
    await this.IntentResolverManager.train(this.inputs);
    await this.OutputRenderingManager.train(this.outputs);
    if (debug || this.settings.debug) {
      // Check : inputs conflicts
      let isAnyOrNothing = false;
      this.inputs.forEach((input, i) => {
        isAnyOrNothing = input.isAnyOrNothing ? true : isAnyOrNothing;
        this.inputs.forEach((next, n) => {
          if (!next.done && n !== i && next.topic === input.topic && next.input === input.input) {
            let issue = issuesFactory.create(issuesFactory.INTENT_DUPLICATE_INPUT, [
              input.input,
              input.intentid,
              i,
              next.intentid,
              n,
            ]);
            issue = this.services.tracker.addIssue({
              ...issue,
              refs: [
                { id: input.intentid, index: i },
                { id: next.intentid, index: n },
              ],
            });
            this.inputs[i].issues = Utils.addToArray(this.inputs[i].issues, issue);
            this.inputs[n].issues = Utils.addToArray(this.inputs[n].issues, issue);
          }
        });
        const match = this.outputs.some(
          output => output.answers && output.answers.length && output.intentid === input.intentid,
        );
        if (!match) {
          let issue = this.services.tracker.getIssues('error', issuesFactory.codes.INTENT_NO_OUTPUT, [
            { id: input.intentid },
          ])[0];
          if (!issue) {
            issue = issuesFactory.create(issuesFactory.INTENT_NO_OUTPUT, [input.intentid]);
            issue = this.services.tracker.addIssue({
              ...issue,
              refs: [{ id: input.intentid }],
            });
          }
          this.inputs[i].issues = Utils.addToArray(this.inputs[i].issues, issue);
        }
        this.inputs[i].done = true;
      });
      if (!isAnyOrNothing && !rules.no_AnyOrNothing) {
        const issue = issuesFactory.create(issuesFactory.AGENT_EXPECT_ANY);
        this.services.tracker.addIssue(issue);
      }
      this.inputs.forEach((input, i) => {
        delete this.inputs[i].done;
      });
      return this.services.tracker.getIssues();
    }
    return [];
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
    const tokenizedUtterance = this.NamedEntityTokenizer.tokenize(lang, utterance, undefined, true, true);
    // Intents Resolvers
    const results = await this.IntentResolverManager.evaluate(lang, tokenizedUtterance, context);
    const r = results && results[0] ? results[0] : {};
    const ctx = { ...context, ...r.context };
    // Output Rendering
    const answer = await this.OutputRenderingManager.execute(lang, results, ctx);
    console.log('answer', answer, lang, results);
    const a = answer || {};
    let { renderResponse } = a;
    const { isAnyOrNothing } = r;
    let anyOrNothing;
    if (!renderResponse && !isAnyOrNothing) {
      // We try to get an answer from an AnyOrNothing intent
      // First from results
      let an;
      let aon;
      /* istanbul ignore next */
      // TODO better handling and more coverage
      if (results) {
        [aon] = results.filter(rs => rs && rs.isAnyOrNothing);
        if (aon) {
          an = await this.OutputRenderingManager.execute(lang, [aon], ctx);
        }
      }
      /* istanbul ignore next */
      if (!an) {
        const topic = ctx.topic || '*';
        /* istanbul ignore next */
        [aon] = this.inputs.filter(rs => rs.isAnyOrNothing && rs.topic === topic && rs.lang === lang);
        /* istanbul ignore next */
        if (aon) {
          an = (await this.OutputRenderingManager.execute(lang, [aon], ctx)) || {};
          ({ renderResponse } = an);
        }
        if (!renderResponse) {
          [aon] = this.inputs.filter(rs => rs.isAnyOrNothing && rs.topic === topic && rs.lang === lang);
          if (aon) {
            an = (await this.OutputRenderingManager.execute(lang, [aon], ctx)) || {};
            ({ renderResponse } = an);
          }
        }
      }
      if (renderResponse) {
        anyOrNothing = { id: an.intentid, inputIndex: aon.inputIndex || 0, outputIndex: an.outputIndex };
      }
    }
    const ret = {
      answer: renderResponse,
      score: answer ? answer.score : 0,
      intent: a.intentid ? { id: a.intentid, inputIndex: r.inputIndex, outputIndex: a.outputIndex } : undefined,
      context: (answer && answer.context) || ctx,
    };
    if (anyOrNothing) {
      ret.anyOrNothing = anyOrNothing;
    }
    if (!ret.intent && r.intentid) {
      ret.intent = { id: r.intentid, inputIndex: r.inputIndex };
    }
    if (ret.score === undefined || (ret.score === 0 && r.score !== undefined)) {
      ret.score = r.score;
    }
    ret.isAnyOrNothing = isAnyOrNothing;
    if (r.issues || (answer && answer.issues)) {
      ret.issues = [];
      if (r.issues) {
        ret.issues.push(...r.issues);
      }
      if (answer && answer.issues) {
        ret.issues.push(...answer.issues);
      }
    }
    return ret;
  }

  static evaluateFromContext(nlxSyntax, context, isMandatory = false) {
    return Tools.evaluateFromContext(nlxSyntax, context, isMandatory);
  }
}
