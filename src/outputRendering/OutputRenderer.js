/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ConditionEvaluator, Renderer, Utils } from '../utils';

class OutputRenderer {
  constructor({ name, settings, outputs }) {
    if (!name) {
      throw new Error('Invalid OutputRenderer constructor - Missing name');
    }
    this.settings = settings || {};
    this.name = name;
    this.outputs = outputs || [];
  }

  train(outputs) {
    this.outputs = outputs || [];
  }

  // eslint-disable-next-line class-methods-use-this
  async execute() {
    throw new Error('Invalid OutputRenderer - execute() should be implemented in child class');
  }
}

class SimpleOutputRenderer extends OutputRenderer {
  constructor({ settings, outputs }) {
    super({ settings, outputs, name: 'simple-output-rendering' });
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
        await Promise.all(
          preCallables.map(async callable => {
            if (callable.func && typeof callable.func === 'function') {
              const ctx = await callable.func(context);
              context = { ...context, ...ctx };
            }
          }),
        );
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
      // const preRenderContext = typeof preRenderCallable === 'function' ? await preRenderCallable(context) : {};
      // context = { ...context, ...preRenderContext };
      if (callables && callables.length > 0) {
        await Promise.all(
          callables.map(async callable => {
            if (callable.func && typeof callable.func === 'function') {
              const ctx = await callable.func(context);
              context = { ...context, ...ctx };
            }
          }),
        );
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

export { SimpleOutputRenderer, OutputRenderer };
