/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import SchemaModel from './SchemaModel';
import schema from '../schemas/aice-testset/v1.json';

export default class Testset extends SchemaModel {
  constructor(ajv) {
    super(ajv, schema, 'aice-testset', '1');
  }

  static seemsOk(data) {
    return !!(data.name && data.scenarios);
  }
}
