/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
export default class Validator {
  constructor(ajv, schema) {
    this.ajv = ajv;
    this.schema = schema;
  }

  execute(data) {
    const exe = this.ajv.compile(this.schema);
    const result = exe(data);
    return result;
  }
}
