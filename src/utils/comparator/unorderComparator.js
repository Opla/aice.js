/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { Comparator } = require('./comparator');

const { ExactStrategy } = require('./wordsComparator');

/**
 * @class LazzyUnorderComparator
 */
class LazzyUnorderComparator extends Comparator {
  constructor(wordComparator = new ExactStrategy(), weighting = { default: 1, entities: 5 }) {
    super(wordComparator);
    this.weighting = weighting;
  }

  /**
   * Give the weighting for an input token
   * @param {Object} expression InputExpression
   */
  getInputTokenWeight(expression) {
    return expression ? this.weighting.entities : this.weighting.default;
  }

  /**
   * Match (LazzyUnorder strategy) two LinkedLists (Sentences)
   * @param {Sentence} linkedListI A linkedlist representing an input (can comporte expression from ExpressionParser)
   * @param {Sentence} linkedListU A linkedlist representing a utterance (can comporte expression from NER)
   * @returns {result} match: true if it matched & context[] that will be used to change user context (contains capture / entities)
   */
  compare(linkedListI, linkedListU) {
    let result = { context: [], match: true, confidence: 1.0 };

    // Unorder Expressioned equality check
    result.iteratorGeneratorI = linkedListI.values();
    result.iteratorGeneratorU = linkedListU.values();
    result.iteratorI = result.iteratorGeneratorI.next();
    result.iteratorU = result.iteratorGeneratorU.next();

    // Initialization
    // Max possible score for each Input tokens (except Unused expression ANY/ANYORNOTHING) add its weight to maxScore
    let maxScore = 0;
    let score = 0;

    while (!result.iteratorI.done) {
      const { expression } = result.iteratorI.value;
      if (!expression || (expression && expression.type !== 'ANY' && expression.type !== 'ANYORNOTHING')) {
        const tokenWeight = this.getInputTokenWeight(expression);
        // Max possible score computation
        maxScore += tokenWeight;

        // Compare
        result = this.compareExpressions(result);
        if (result.match) {
          score += tokenWeight;
          result.iteratorU = result.iteratorGeneratorU.next();
        } else {
          result.iteratorGeneratorU = linkedListU.values();
          result.iteratorU = result.iteratorGeneratorU.next();
          while (!result.iteratorU.done && !result.match) {
            result = this.compareExpressions(result);
            if (result.match) {
              score += tokenWeight;
            }
            result.iteratorU = result.iteratorGeneratorU.next();
          }
        }
      }
      result.iteratorI = result.iteratorGeneratorI.next();
    }

    // Delete iterator from result
    delete result.iteratorGeneratorI;
    delete result.iteratorI;
    delete result.iteratorU;
    if (score !== 0) result.confidence = score / maxScore;
    else result.confidence = 0;
    result.match = score > 0;

    return result;
  }
}

/**
 * @class UnorderComparator
 */
class UnorderComparator extends Comparator {
  constructor(wordComparator = new ExactStrategy(), weighting = { default: 1, entities: 5 }) {
    super(wordComparator);
    this.weighting = weighting;
  }

  /**
   * Give the weighting for an input token
   * @param {Object} expression InputExpression
   */
  getInputTokenWeight(expression) {
    return expression ? this.weighting.entities : this.weighting.default;
  }

  /**
   * Match (Unorder strategy, kind of Jaccard) two LinkedLists (Sentences)
   * @param {Sentence} linkedListI A linkedlist representing an input (can comporte expression from ExpressionParser)
   * @param {Sentence} linkedListU A linkedlist representing a utterance (can comporte expression from NER)
   * @returns {result} match: true if it matched & context[] that will be used to change user context (contains capture / entities)
   */
  compare(linkedListI, linkedListU) {
    let result = { context: [], match: false, confidence: 1.0 };

    // Unorder Expressioned equality check
    result.match = false;

    result.iteratorGeneratorI = linkedListI.values();
    result.iteratorGeneratorU = linkedListU.values();
    result.iteratorI = result.iteratorGeneratorI.next();
    result.iteratorU = result.iteratorGeneratorU.next();

    // Max possible score for each Input tokens (except Unused expression ANY/ANYORNOTHING) add its weight to maxScore
    let maxScore = 0;
    let score = 0;
    const bags = [];

    while (!result.iteratorI.done) {
      const { expression } = result.iteratorI.value;
      if (!expression || (expression && expression.type !== 'ANY' && expression.type !== 'ANYORNOTHING')) {
        const tokenWeight = this.getInputTokenWeight(expression);
        // Max possible score computation
        maxScore += tokenWeight;

        // Compare
        result = this.compareExpressions(result);
        if (result.match) {
          if (bags.length > 0) {
            bags[bags.length - 1] += ` ${result.iteratorU.value.text}`;
          } else {
            bags.push(result.iteratorU.value.text);
          }
          score += tokenWeight;
          result.iteratorU = result.iteratorGeneratorU.next();
        } else {
          result.iteratorGeneratorU = linkedListU.values();
          result.iteratorU = result.iteratorGeneratorU.next();
          while (!result.iteratorU.done && !result.match) {
            result = this.compareExpressions(result);
            if (result.match) {
              bags.push(result.iteratorU.value.text);
              score += tokenWeight;
            }
            result.iteratorU = result.iteratorGeneratorU.next();
          }
        }
      }
      result.iteratorI = result.iteratorGeneratorI.next();
    }
    // Scoring
    if (score > 1) {
      const normalizedScore = score / maxScore;
      const entropy = (bags.length - 1) / (score - 1);
      result.confidence = normalizedScore * (1 - entropy ** 1.5 * 0.5);
    } else {
      result.confidence = score / maxScore;
    }
    result.match = score > 0;

    // Delete iterator from result
    delete result.iteratorGeneratorI;
    delete result.iteratorGeneratorU;
    delete result.iteratorI;
    delete result.iteratorU;

    return result;
  }
}

module.exports = { LazzyUnorderComparator, UnorderComparator };
