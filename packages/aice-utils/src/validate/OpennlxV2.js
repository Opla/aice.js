/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Validator from './Validator';
import schema from '../../../../schemas/opennlx/v2.json';

export default class OpennlxV2 extends Validator {
  constructor(ajv) {
    super(ajv, schema);
  }

  static seemsOk(data) {
    return !!(data.avatar && data.name);
  }
}
