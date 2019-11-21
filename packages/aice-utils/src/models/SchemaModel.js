/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
export default class SchemaModel {
  constructor(manager, schema, name, version) {
    this.manager = manager;
    this.schema = schema;
    this.name = name;
    this.version = version;
  }

  async validate(data) {
    const exe = this.manager.ajv.compile(this.schema);
    const result = exe(data);
    this.errors = exe.errors;
    return result;
  }

  async buildData(content) {
    return { content, schema: { name: this.name }, isValid: true, model: this };
  }
}
