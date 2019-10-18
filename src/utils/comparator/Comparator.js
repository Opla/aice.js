/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ContextMutator from '../ContextMutator';
import { ExactStrategy } from './wordsComparator/strategies';

const equalsText = (a, b) => a.length === b.length && a.every((t, i) => t.text === b[i].text);

/**
 * @class Comparator
 */
export default class Comparator {
  constructor(wordComparator = new ExactStrategy()) {
    this.wordComparator = wordComparator;
  }

  /**
   * Match two LinkedLists (Sentences)
   * @param {Sentence} linkedListI A linkedlist representing an input (can comporte expression from ExpressionParser)
   * @param {Sentence} linkedListU A linkedlist representing a utterance (can comporte expression from NER)
   * @returns {result} match: true if it matched & context[] that will be used to change user context (contains capture / entities)
   */
  compare(linkedListI, linkedListU) {
    let result = { context: [], match: false, confidence: 1.0 };

    // Simpliest strict word token equality check
    result.match = equalsText([...linkedListI.values()], [...linkedListU.values()]);

    // Expressioned equality check
    if (!result.match) {
      result.match = true;

      result.iteratorGeneratorI = linkedListI.values();
      result.iteratorGeneratorU = linkedListU.values();
      result.iteratorI = result.iteratorGeneratorI.next();
      result.iteratorU = result.iteratorGeneratorU.next();

      while (result.match && !result.iteratorI.done) {
        result = this.compareExpressions(result);

        // Do we need to proceed next tokens
        if (!result.iteratorI.done) {
          result.iteratorI = result.iteratorGeneratorI.next();
          result.iteratorU = result.iteratorGeneratorU.next();
        }
      }

      // It only match if the iterators are both done (at the end of each sentences)
      if (result.match) {
        result.match = result.iteratorI.done && result.iteratorU.done;
      }

      // Delete iterator from result
      delete result.iteratorGeneratorI;
      delete result.iteratorGeneratorU;
      delete result.iteratorI;
      delete result.iteratorU;
    }

    return result;
  }

  /**
   * Matchs Expressions
   * @param {result} result result is a complexe object used to proceed Sentences comparison
   * @returns {result} match: true if it matched & context[] that will be used to change user context (contains capture / entities)
   */
  compareExpressions(resultState, affectation = true) {
    let result = resultState;
    const { expression, text } = result.iteratorI.value;

    // Case iteratorI contains an expression
    switch (expression && expression.type) {
      case 'ANY':
      case 'ANYORNOTHING':
        {
          const res = this.compareGenericAnyOrNothing(result, expression.type === 'ANY');

          result = { ...result, ...res.result };
        }
        break;

      case 'ENTITY':
        {
          if (result.iteratorU.done) {
            result.match = false;
            break;
          }
          const { ner, text: textU } = result.iteratorU.value;
          result.match = expression.name === ner.name || expression.name === ner.row; // row used to handle sub enum entity

          if (result.match) {
            // TODO Will change after the NER TOKEN Implementation => ner.value ? ner.row ? ner.match ...
            const varName = expression.contextName || expression.name.toLowerCase();
            if (affectation) ContextMutator.addVariableToContext(result.context, { name: varName, value: textU });
          }
        }
        break;

      default: {
        if (result.iteratorU.done) {
          result.match = false;
          break;
        }
        const { text: textU } = result.iteratorU.value;
        const res = this.wordComparator.compare(text.toLowerCase(), textU.toLowerCase());
        // TODO handle comparison score we may lower
        // result.confidence = ((result.size - 1) / result.size) * result.confidence + (1 / result.size) * res.score;
        result.match = res.match;
      }
    }
    return result;
  }

  /**
   * Matchs Any Expression or AnyOrNothing Expression
   * @param {result} result result is a complexe object used to proceed Sentences comparison
   * @param {Boolean} caseAny AnyOrNothing
   * @returns {result} match: true if it matched & context[] that will be used to change user context (contains capture / entities)
   */
  compareGenericAnyOrNothing(resultState, caseAny = true) {
    const result = resultState;
    let text = '';

    const varName =
      result.iteratorI.value.expression.contextName || result.iteratorI.value.expression.type.toLowerCase();

    // Iterate on Input
    result.iteratorI = result.iteratorGeneratorI.next();

    // case Not Last Token in Input
    if (!result.iteratorI.done) {
      // Case ANY - At least one token needed
      if (caseAny) {
        text += result.iteratorU.value.text;
        result.iteratorU = result.iteratorGeneratorU.next();
      }
      // Iterate until same expression or end of sentence
      while (!result.iteratorU.done && !this.compareExpressions(result, false).match) {
        const { text: textU } = result.iteratorU.value;
        text += (!text && textU) || ` ${textU}`;
        result.iteratorU = result.iteratorGeneratorU.next();
      }

      if (!result.iteratorU.done) result.match = this.compareExpressions(result).match;
      else result.match = false;
      // case Ending Token in Input
    } else {
      // Iterate until end of sentence
      while (!result.iteratorU.done) {
        const { text: textU } = result.iteratorU.value;
        text += (!text && textU) || ` ${textU}`;
        result.iteratorU = result.iteratorGeneratorU.next();
      }

      // Case ANY - At least one token needed
      if (caseAny) {
        result.match = text !== '';
      }
    }

    if (result.match) {
      ContextMutator.addVariableToContext(result.context, { name: varName, value: text });
    }
    return result;
  }
}

export { Comparator };
