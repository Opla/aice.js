/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { OutputExpressionTokenizer } from '../streamTransformers/expression';
import { Renderer } from '../utils';

const outputExpressionTokenizer = new OutputExpressionTokenizer();

export default class Tools {
  /**
   * Evaluate nlxSyntax using the context
   * Replace the NLXSyntax by its value in the context
   * @param {String} nlxSyntax A string that contains NLXSyntax.
   * @param {Object} context The context containing the variables.
   * @param {Boolean} isMandatory Throw an error if isMandatory and variable(s) not in the context.
   * @return {reponse} A string with the variables replaced by there values
   */
  static evaluateFromContext(nlxSyntax, context, isMandatory = false) {
    const tokenizedNlxSyntax = outputExpressionTokenizer.tokenize(nlxSyntax);
    if (isMandatory && !Renderer.isRenderable(tokenizedNlxSyntax, context))
      throw new Error('Tools - evaluateFromContext mandatory variable(s) not in context');
    return Renderer.render(tokenizedNlxSyntax, context);
  }
}
