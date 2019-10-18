/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ValueEvaluator from './ValueEvaluator';

export default class ConditionEvaluator {
  /**
   * Evaluate a condition
   * @param {Object} condition a condition
   * @param {Object} context context to refer context variables
   */
  static evaluate(condition, context) {
    if (condition.type === 'LeftRightExpression') {
      return ConditionEvaluator.leftRightExpressionEvaluator(condition, context);
    }

    if (condition.type === 'UnaryExpression') {
      return ConditionEvaluator.unaryExpressionEvaluator(condition, context);
    }

    throw new Error('ConditionEvaluator.evaluate - Unknown condition type');
  }

  static leftRightExpressionEvaluator(condition, context) {
    let leftOperand = null;
    let rightOperand = null;
    let result;
    if (condition.leftOperand.operator) {
      leftOperand = ConditionEvaluator.evaluate(condition.leftOperand, context);
    }

    if (condition.rightOperand.operator) {
      rightOperand = ConditionEvaluator.evaluate(condition.rightOperand, context);
    }

    if (!leftOperand) {
      leftOperand = ValueEvaluator.evaluateValue(condition.leftOperand, context);
    }

    if (!rightOperand) {
      rightOperand = ValueEvaluator.evaluateValue(condition.rightOperand, context);
    }

    switch (condition.operator) {
      case 'eq':
        result = leftOperand === rightOperand;
        break;

      case 'ne':
        result = leftOperand !== rightOperand;
        break;

      case 'or':
        result = leftOperand || rightOperand;
        break;

      case 'and':
        result = leftOperand && rightOperand;
        break;

      default:
        throw new Error('ConditionEvaluator.leftRightExpressionEvaluator - Unknown condition operator');
    }

    return result;
  }

  static unaryExpressionEvaluator(condition, context) {
    let LrightOperand = null;
    let result;
    if (condition.LrightOperand.operator) {
      LrightOperand = ConditionEvaluator.evaluate(condition.LrightOperand, context);
    }

    if (!LrightOperand) {
      LrightOperand = ValueEvaluator.evaluateValue(condition.LrightOperand, context);
    }

    switch (condition.operator) {
      case 'not':
        result = !LrightOperand;
        break;

      default:
        throw new Error('ConditionEvaluator.unaryExpressionEvaluator - Unknown condition operator');
    }

    return result;
  }
}
