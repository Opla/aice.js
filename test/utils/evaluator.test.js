/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import chai from 'chai';
import { ConditionEvaluator, ValueEvaluator } from '../../src/utils';

const { expect } = chai;

// TEST ConditionEvaluator
describe('ConditionEvaluator', () => {
  it('LeftRightExpression - condition equals', () => {
    const condition = { type: 'LeftRightExpression', operator: 'eq', leftOperand: 'text', rightOperand: 'text' };
    const result = ConditionEvaluator.evaluate(condition, {});
    expect(result).to.equal(true);
  });

  it('LeftRightExpression - condition not equals', () => {
    const condition = { type: 'LeftRightExpression', operator: 'ne', leftOperand: 'text', rightOperand: 'text' };
    const result = ConditionEvaluator.evaluate(condition, {});
    expect(result).to.equal(false);
  });

  it('LeftRightExpression - condition or', () => {
    const condition = { type: 'LeftRightExpression', operator: 'or', leftOperand: false, rightOperand: true };
    const result = ConditionEvaluator.evaluate(condition, {});
    expect(result).to.equal(true);
  });

  it('LeftRightExpression - condition and', () => {
    const condition = { type: 'LeftRightExpression', operator: 'and', leftOperand: true, rightOperand: true };
    const result = ConditionEvaluator.evaluate(condition, {});
    expect(result).to.equal(true);
  });

  it('intricated LeftRightExpression - condition equals', () => {
    const context = { var1: 'something', var2: 'something' };
    const condition = {
      type: 'LeftRightExpression',
      operator: 'eq',
      leftOperand: { type: 'VARIABLE', value: 'var1' },
      rightOperand: { type: 'VARIABLE', value: 'var2' },
    };
    const result = ConditionEvaluator.evaluate(condition, context);
    expect(result).to.equal(true);
  });

  it('UnaryExpression - condition not', () => {
    const condition = { type: 'UnaryExpression', operator: 'not', LrightOperand: false };
    const result = ConditionEvaluator.evaluate(condition, {});
    expect(result).to.equal(true);
  });

  it('Hard UnaryExpression - condition not', () => {
    const context = { var1: false };
    const condition = { type: 'UnaryExpression', operator: 'not', LrightOperand: { type: 'VARIABLE', value: 'var1' } };
    const result = ConditionEvaluator.evaluate(condition, context);
    expect(result).to.equal(true);
  });

  it('Very hard chained LeftRightExpression - (var1===var2) && true', () => {
    const context = { var1: 'something', var2: 'something' };
    const condition = {
      type: 'LeftRightExpression',
      operator: 'and',
      leftOperand: {
        type: 'LeftRightExpression',
        operator: 'eq',
        leftOperand: { type: 'VARIABLE', value: 'var1' },
        rightOperand: { type: 'VARIABLE', value: 'var2' },
      },
      rightOperand: true,
    };
    const result = ConditionEvaluator.evaluate(condition, context);
    expect(result).to.equal(true);
  });

  it('Hard chained LeftRightExpression - true && (var1===var2)', () => {
    const context = { var1: 'something', var2: 'something' };
    const condition = {
      type: 'LeftRightExpression',
      operator: 'and',
      leftOperand: true,
      rightOperand: {
        type: 'LeftRightExpression',
        operator: 'eq',
        leftOperand: { type: 'VARIABLE', value: 'var1' },
        rightOperand: { type: 'VARIABLE', value: 'var2' },
      },
    };
    const result = ConditionEvaluator.evaluate(condition, context);
    expect(result).to.equal(true);
  });

  it('Hard chained UnaryExpression - !(var1===var2)', () => {
    const context = { var1: 'something', var2: 'something' };
    const condition = {
      type: 'UnaryExpression',
      operator: 'not',
      LrightOperand: {
        type: 'LeftRightExpression',
        operator: 'eq',
        leftOperand: { type: 'VARIABLE', value: 'var1' },
        rightOperand: { type: 'VARIABLE', value: 'var2' },
      },
    };
    const result = ConditionEvaluator.evaluate(condition, context);
    expect(result).to.equal(false);
  });

  it("Shouldn't evaluate condition no type error", () => {
    const condition = { leftOperand: 'text', rightOperand: 'text' };

    expect(() => ConditionEvaluator.evaluate(condition, {})).to.throw(
      'ConditionEvaluator.evaluate - Unknown condition type',
    );
  });

  it("Shouldn't evaluate LeftRightExpression condition no operator error", () => {
    const condition = { type: 'LeftRightExpression', leftOperand: 'text', rightOperand: 'text' };

    expect(() => ConditionEvaluator.evaluate(condition, {})).to.throw(
      'ConditionEvaluator.leftRightExpressionEvaluator - Unknown condition operator',
    );
  });

  it("Shouldn't evaluate UnaryExpression condition no operator error", () => {
    const condition = { type: 'UnaryExpression', LrightOperand: 'text' };

    expect(() => ConditionEvaluator.evaluate(condition, {})).to.throw(
      'ConditionEvaluator.unaryExpressionEvaluator - Unknown condition operator',
    );
  });
});

// TEST ValueEvaluator
describe('ValueEvaluator', () => {
  it('Should evaluate value type VARIABLE', () => {
    const value = { type: 'VARIABLE', value: 'varName' };
    const result = ValueEvaluator.evaluateValue(value, { varName: 'someText' });

    expect(result).to.equal('someText');
  });

  it('Should evaluate direct value - String', () => {
    const value = 'text';
    expect(ValueEvaluator.evaluateValue(value, {})).to.equal('text');
  });

  it('Should evaluate direct value - Integer', () => {
    const value = 5;
    expect(ValueEvaluator.evaluateValue(value, {})).to.equal(5);
  });

  it("Shouldn't evaluate object with no type", () => {
    const value = { value: 5 };
    expect(() => ValueEvaluator.evaluateValue(value, {})).to.throw(
      'VariableEvaluator.evaluateValue - Unknown value type',
    );
  });
});
