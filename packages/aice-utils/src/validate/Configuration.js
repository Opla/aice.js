/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Model from './Model';
import schema from '../schemas/aice-configuration/v1.json';

export default class Configuration extends Model {
  constructor(ajv) {
    super(ajv, schema, 'configuration', '1');
  }

  static seemsOk(data) {
    return !!(!data.version && data.configuration);
  }
}
