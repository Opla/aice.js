/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Ajv from 'ajv';
import config from '../../../schemas/aice-configuration/v1.json';
import opennlxV1 from '../../../schemas/opennlx/v1.json';
import opennlxV2 from '../../../schemas/opennlx/v2.json';

export default class {
  constructor() {
    this.ajv = new Ajv({ allErrors: true, useDefaults: true });
    this.validators = {};
  }

  // eslint-disable-next-line class-methods-use-this
  getSchema(schemaName, version = '1') {
    if (schemaName === 'aice-configuration') {
      return config;
    }
    if (schemaName === 'opennlx') {
      if (version === '2') {
        return opennlxV2;
      }
      return opennlxV1;
    }
    const msg =
      schemaName && schemaName.length ? `Unknown schema: ${schemaName} with version=${version}` : 'Unknown schema';
    throw new Error(msg);
  }

  getValidator(schemaName, version) {
    let validator = this.validators[`${schemaName}_${version}`];
    if (!validator) {
      const schema = this.getSchema(schemaName, version);
      validator = this.ajv.compile(schema);
      this.validators[`${schemaName}_${version}`] = validator;
    }
    return validator;
  }

  execute(data, schemaName) {
    const result = {};
    if (data) {
      const validator = this.getValidator(schemaName, data.version);
      result.isValid = validator(data);
      if (!result.isValid) {
        // TODO handle errors format
        // for not valid properties
        result.error = validator.errors;
      }
    } else {
      result.error = 'empty data';
    }
    return result;
  }
}
