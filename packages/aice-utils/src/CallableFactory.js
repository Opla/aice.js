/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import JsonWebserviceCallable from './callables/JsonWebservicesCallable';

export default class CallableFactory {
  constructor(services, opts) {
    this.services = services;
    this.opts = opts;
  }

  newCallable(callable) {
    let parameters = [];
    let callParameters = [];
    if (typeof callable.values === 'object') {
      ({ parameters = [], callParameters = [] } = callable.values);
    } else {
      try {
        ({ parameters, callParameters } = JSON.parse(callable.values));
      } catch (err) {
        //
      }
    }
    let category;
    let className;
    if (callable.extra) {
      ({ category, className } = callable.extra);
    }
    let instance;
    if (category === 'system' && className === 'jsonWebservice') {
      if (!this.services.fetch) {
        throw new Error("CallableFactory can't instanciate jsonWebservice without services.fetch");
      }
      instance = new JsonWebserviceCallable(this.services, this.opts);
      instance.setParameters(parameters);
      instance.setCallParameters(callParameters);
    } else {
      // TODO others callable types
      instance = { call: () => ({}) };
    }
    return instance;
  }
}
