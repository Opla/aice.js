/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ValueEvaluator from '../evaluator/Value';

import ContextMutator from '../TMPContextMutator';

export default class Renderer {
  static isRenderable(tokenizedOutput, context) {
    let renderable = true;
    for (const {
      value: { expression },
    } of tokenizedOutput) {
      if (expression) {
        // TYPE OUTPUT
        if (expression.type === 'OUTPUT') {
          if (expression.value) {
            renderable = renderable && ValueEvaluator.evaluateValue(expression.value, context) !== undefined;
          } else {
            renderable = renderable && ValueEvaluator.evaluateContext(expression.contextName, context) !== undefined;
          }
        } else if (expression.type === 'CODE') {
          renderable = renderable && ValueEvaluator.evaluateValue(expression.value, context) !== undefined;
        } else {
          throw new Error('Invalid OutputRendering isRenderable - Unknown expression');
        }
      }
    }
    return renderable;
  }

  static render(tokenizedOutput, context) {
    let outputMesssage = '';
    for (const {
      value: { text, expression },
    } of tokenizedOutput) {
      if (expression) {
        // TYPE OUTPUT
        if (expression.type === 'OUTPUT') {
          if (expression.value) {
            const variableEvaluated = ValueEvaluator.evaluateValue(expression.value, context);
            ContextMutator.setToContext(context, {
              name: expression.contextName,
              value: variableEvaluated,
            });

            outputMesssage += variableEvaluated;
          } else {
            outputMesssage += ValueEvaluator.evaluateContext(expression.contextName, context);
          }

          // TYPE CODE
        } else if (expression.type === 'CODE') {
          ContextMutator.setToContext(context, {
            name: expression.contextName,
            value: ValueEvaluator.evaluateValue(expression.value, context),
          });

          // ERROR
        } else {
          throw new Error('Invalid OutputRendering Render - Unknown expression');
        }
      } else {
        outputMesssage += text;
      }
    }
    return outputMesssage;
  }
}
