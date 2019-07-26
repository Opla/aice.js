/* eslint-disable no-param-reassign */
/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { ConditionEvaluator, Renderer, Utils } = require('../utils');

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
  async process() {
    throw new Error('Invalid OutputRenderer - process() should be implemented in child class');
  }
}

class SimpleOutputRenderer extends OutputRenderer {
  constructor({ settings, outputs }) {
    super({ settings, outputs, name: 'simple-output-rendering' });
  }

  async process(lang, intents, context) {
    const { intentid, score } = intents[0] || {}; // Best match for now

    // Retrieve output object for this intentid
    const output = this.outputs.find(o => o.intentid === intentid);
    if (!output) {
      return undefined;
    }

    // Retrieve all answers for this lang
    const filtredAnswers = output.answers.filter(a => a.lang === lang);
    const res = await Utils.filterAsync(filtredAnswers, async ans => {
      const { preConditionsCallable, conditions, preRenderCallable } = ans;

      // Call pre-conditions callables
      const preCondCallableContext =
        typeof preConditionsCallable === 'function' ? await preConditionsCallable(context) : {};
      context = { ...context, ...preCondCallableContext };

      // Check Conditions
      const conditionChecked = conditions
        ? conditions.reduce(
            (accumulator, condition) => accumulator && ConditionEvaluator.evaluate(condition, context),
            true,
          )
        : true;
      if (!conditionChecked) return false;

      // Call pre-render callables
      const preRenderContext = typeof preRenderCallable === 'function' ? await preRenderCallable(context) : {};
      context = { ...context, ...preRenderContext };

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

module.exports = { SimpleOutputRenderer, OutputRenderer };
