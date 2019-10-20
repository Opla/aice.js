/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ConditionEvaluator, Renderer, Utils } from '../utils';
import OutputRenderer from './OutputRenderer';

export default class SimpleOutputRenderer extends OutputRenderer {
  constructor({ settings, outputs }) {
    super({ settings, outputs, name: 'simple-output-rendering' });
    this.callablesManager = this.settings.callablesManager;
  }

  async executeCallable(callables, baseContext) {
    let context = baseContext;
    await Promise.all(
      callables.map(async callable => {
        let ctx = {};
        if (typeof callable === 'function') {
          ctx = await callable(context);
        } else if (callable.func && typeof callable.func === 'function') {
          ctx = await callable.func(context);
        } else if (this.callablesManager) {
          ctx = await this.callablesManager(callable, context);
        } else {
          throw new Error('AICE executeCallable - no callablesManager defined');
        }
        context = { ...context, ...ctx };
      }),
    );
    return context;
  }

  async execute(lang, intents, baseContext) {
    let context = baseContext;
    const { intentid, score } = intents[0] || {}; // Best match for now

    // Retrieve output object for this intentid
    const output = this.outputs.find(o => o.intentid === intentid);
    if (!output) {
      return undefined;
    }

    // Retrieve all answers for this lang
    const filtredAnswers = output.answers.filter(a => a.lang === lang);
    const res = await Utils.filterAsync(filtredAnswers, async ans => {
      const { preCallables, conditions, callables } = ans;

      // Call pre-conditions callables
      if (preCallables && preCallables.length > 0) {
        context = await this.executeCallable(preCallables, context);
      }

      // Check Conditions
      const conditionChecked = conditions
        ? conditions.reduce(
            (accumulator, condition) => accumulator && ConditionEvaluator.evaluate(condition, context),
            true,
          )
        : true;
      if (!conditionChecked) return false;

      // Call pre-render callables
      if (callables && callables.length > 0) {
        context = await this.executeCallable(callables, context);
      }

      // Final Check Context Evaluation
      return Renderer.isRenderable(ans.tokenizedOutput, context);
    });

    if (res && res.length > 0) {
      let renderResponse;
      switch (output.outputType) {
        case 'single':
          renderResponse = Renderer.render(res[0].tokenizedOutput, context);
          break;

        case 'multiple':
          renderResponse = res.reduce((acc, r) => acc + Renderer.render(r.tokenizedOutput, context), '');
          break;

        case 'random':
        default:
          renderResponse = Renderer.render(
            res[Math.floor(Math.random() * Math.floor(res.length))].tokenizedOutput,
            context,
          );
          break;
      }
      return { intentid, score, renderResponse, context };
    }
    return undefined;
  }
}
