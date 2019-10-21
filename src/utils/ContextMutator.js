/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable no-prototype-builtins */
/* eslint-disable no-param-reassign */
export default class ContextMutator {
  /**
   * Set variable to context - re-affect context !
   */
  static setToContext(context, variable) {
    context[variable.name] = variable.value;
  }

  /**
   * Add variable to context - Don't re-affect context, create new variable.name_1, variable.name_2...
   */
  static addVariableToContext(context, variable) {
    if (context && context.hasOwnProperty(variable.name)) {
      if (context.hasOwnProperty(`${variable.name}_1`)) {
        const [, index] = Object.keys(context)
          .reduce((acc, k) => {
            // Is this "if" usefull ?
            // if (k.indexOf('_')) acc.push(k);
            acc.push(k);
            return acc;
          }, [])
          .reverse()[0]
          .split('_');
        context[`${variable.name}_${Number(index) + 1}`] = variable.value;
      } else {
        context[`${variable.name}_1`] = variable.row || variable.value;
      }
    } else {
      context[variable.name] = variable.row || variable.value;
    }
  }

  /**
   * Add entity to context - Don't re-affect context, create new entity.name_1, entity.name_2...
   */
  static addEntityToContext(context, entity) {
    if (context && context[entity.name]) {
      if (context[`${entity.name}_1`]) {
        const [, index] = Object.keys(context)
          .reduce((acc, k) => {
            // Is this "if" usefull ?
            // if (k.indexOf('_')) acc.push(k);
            acc.push(k);
            return acc;
          }, [])
          .reverse()[0]
          .split('_');
        context[`${entity.name}_${Number(index) + 1}`] = entity.row || entity.match;
      } else {
        context[`${entity.name}_1`] = entity.row || entity.match;
      }
    } else {
      context[entity.name] = entity.row || entity.match;
    }
  }
}
