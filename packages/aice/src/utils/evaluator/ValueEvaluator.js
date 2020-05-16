/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default class ValueEvaluator {
  /**
   * Evaluate a value that can be a litteral or a variable that refer to context variable
   * @param {Object} value
   * @param {Object} context
   */
  static evaluateValue(value, context) {
    if (typeof value !== 'object') {
      return value;
    }

    if (value.type === 'VARIABLE') {
      return ValueEvaluator.evaluateContext(value.value, context);
    }

    throw new Error('VariableEvaluator.evaluateValue - Unknown value type');
  }

  static evaluateContext(variable, context) {
    const v = !variable || variable === '' || context[variable];
    console.log('evaluate value', variable, v);
    return v;
  }
}
