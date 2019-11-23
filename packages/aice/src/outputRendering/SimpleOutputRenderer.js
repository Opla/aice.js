/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ConditionEvaluator, Renderer, Utils } from '../utils';
import OutputRenderer from './OutputRenderer';

export default class SimpleOutputRenderer extends OutputRenderer {
  constructor(settings) {
    super({ ...settings, name: 'simple-output-rendering' });
    this.callablesManager = this.settings.callablesManager;
  }

  async executeCallable(lang, callables, baseContext) {
    let context = baseContext;

    await Promise.all(
      callables.map(async callable => {
        let ctx = {};
        if (typeof callable === 'function' || callable.constructor.name === 'AsyncFunction') {
          ctx = await callable(context);
        } else if (
          callable.func &&
          (callable.func.constructor.name === 'AsyncFunction' || typeof callable.func === 'function')
        ) {
          ctx = await callable.func(context);
        } else if (callable.isReference) {
          const output = this.find(callable.name);
          const resp = await this.execute(lang, [{ intentid: output.intentid, score: 0.99 }], context);
          ctx[callable.value] = resp.renderResponse;
        } else if (this.callablesManager) {
          ctx = await this.callablesManager(callable, context, lang);
        } else {
          throw new Error('AICE executeCallable - no callablesManager defined');
        }
        context = { ...context, ...ctx };
      }),
    );
    return context;
  }

  async execute(lang, intents, baseContext) {
    const { issuesFactory } = this.services || { create: () => {} };
    let context = baseContext;
    const { intentid, score } = intents[0] || {}; // Best match for now

    // Retrieve output object for this intentid
    const output = this.outputs.find(o => o.intentid === intentid);
    if (!output) {
      return undefined;
    }

    // Retrieve all answers for this lang
    const filteredAnswers = output.answers.filter(a => a.lang === lang);
    let outputIndex = -1;
    let noConditionsMatch = false;
    const res = await Utils.filterAsync(filteredAnswers, async ans => {
      const { preCallables, conditions, callables } = ans;

      // Call pre-conditions callables
      if (preCallables && preCallables.length > 0) {
        context = await this.executeCallable(lang, preCallables, context);
      }

      // Check Conditions
      const conditionMatch = conditions
        ? conditions.reduce(
            (accumulator, condition) => accumulator && ConditionEvaluator.evaluate(condition, context),
            true,
          )
        : true;
      if (!conditionMatch) {
        if (conditions) {
          noConditionsMatch = true;
        }
        return false;
      }

      // Call pre-render callables
      if (callables && callables.length > 0) {
        context = await this.executeCallable(lang, callables, context);
      }

      // Final Check Context Evaluation
      return Renderer.isRenderable(ans.tokenizedOutput, context);
    });

    if (res && res.length > 0) {
      let renderResponse;
      const i = Math.floor(Math.random() * Math.floor(res.length));
      switch (output.outputType) {
        case 'single':
          outputIndex = res[0].index;
          renderResponse = Renderer.render(res[0].tokenizedOutput, context);
          break;

        case 'multiple':
          // outputIndex is a range
          outputIndex = res[0].index;
          renderResponse = res.reduce((acc, r) => acc + Renderer.render(r.tokenizedOutput, context), '');
          break;

        case 'random':
        default:
          outputIndex = res[i].index;
          renderResponse = Renderer.render(res[i].tokenizedOutput, context);
          break;
      }
      return { intentid, score, renderResponse, outputIndex, context };
    }
    if (this.settings.debug) {
      const issues = [];
      if (noConditionsMatch) {
        const issue = issuesFactory.create(issuesFactory.EVALUATE_NO_CONDITION, [intentid]);
        issues.push({ ...issue, refs: [{ id: intentid }] });
      }
      if (issues.length) {
        return { intentid, issues };
      }
    }
    return undefined;
  }
}
