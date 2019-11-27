/**
 * Opla-PS
 * Copyright (c) 2015-present, CWB SAS - All Rights Reserved
 * Unauthorized copying of this project and files, via any medium is strictly prohibited
 * Proprietary and confidential
 * Opla-PS can not be copied and/or distributed without the express permission of CWB SAS
 */
import AbstractCallable from './AbstractCallable';

export default class JsonWebserviceCallable extends AbstractCallable {
  static get className() {
    return 'jsonWebservice';
  }

  static get category() {
    return 'system';
  }

  static getCallParametersSchema() {
    return {
      url: { type: 'string' },
      method: { type: 'string' },
      body: { type: 'string' },
    };
  }

  async call(ctxt) {
    const params = super.call(ctxt);
    const res = await this.services.fetch(params.url, {
      method: params.method,
      body: params.body,
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await res.json();
    return { ...json };
  }
}
