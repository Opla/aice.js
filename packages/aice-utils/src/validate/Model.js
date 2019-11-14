/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
export default class Model {
  constructor(ajv, schema, name, version) {
    this.ajv = ajv;
    this.schema = schema;
    this.name = name;
    this.version = version;
  }

  async execute(data) {
    const exe = this.ajv.compile(this.schema);
    const result = exe(data);
    this.errors = exe.errors;
    return result;
  }
}
