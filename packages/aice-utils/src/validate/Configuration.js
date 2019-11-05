/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Validator from './Validator';
import schema from '../../../../schemas/aice-configuration/v1.json';

export default class Configuration extends Validator {
  constructor(ajv) {
    super(ajv, schema);
  }
}
