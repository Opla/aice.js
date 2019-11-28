/**
 * Opla-PS
 * Copyright (c) 2015-present, CWB SAS - All Rights Reserved
 * Unauthorized copying of this project and files, via any medium is strictly prohibited
 * Proprietary and confidential
 * Opla-PS can not be copied and/or distributed without the express permission of CWB SAS
 */

export default class AbstractCallable {
  constructor(services, opts) {
    this.parameters = {};
    this.callParameters = {};
    this.services = services;
    this.opts = opts;
  }

  static get className() {
    return 'abstract-callable';
  }

  static get category() {
    return 'none';
  }

  setParameters(parameters, schema) {
    if (this.validateParameters(parameters, schema)) {
      this.parameters = parameters;
      return true;
    }
    return false;
  }

  setCallParameters(cp) {
    this.callParameters = cp;
  }

  // By default, callable doesn't take parameters, but those are still automatically validated
  static getParametersSchema() {
    return {};
  }

  static getCallParametersSchema() {
    return {};
  }

  prepare(ctxt) {
    const result = {};
    Object.entries(this.callParameters).forEach(([k, v]) => {
      result[k] = this.services.AIceClass.evaluateFromContext(v, ctxt);
    });
    return result;
  }

  validateParameters(parameters, schema = AbstractCallable.getParametersSchema()) {
    try {
      Object.entries(schema).forEach(([ks, { type, properties }]) => {
        const p = Object.entries(parameters).find(([k]) => ks === k);
        if (!p) {
          throw new Error(`Missing property ${ks}`);
        }

        const [, vp] = p;

        // eslint-disable-next-line valid-typeof
        if (!(typeof vp === type)) {
          throw new Error(`Property ${ks} must be an instance of ${type}`);
        }

        if (type === 'object') {
          this.validateParameters(vp, properties);
        }
      });
      return true;
    } catch (error) {
      // throw new Error(`Invalid parameters: ${error.message}`);
    }
    return false;
  }

  call(ctxt, schema) {
    const parameters = this.prepare(ctxt);
    if (this.validateParameters(parameters, schema)) {
      return parameters;
    }
    throw new Error('Cannot call call - Invalid call parameters');
  }
}
