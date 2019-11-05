/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Ajv from 'ajv';
import Configuration from './Configuration';
import OpennlxV1 from './OpennlxV1';
import OpennlxV2 from './OpennlxV2';

export default class {
  constructor() {
    this.ajv = new Ajv({ allErrors: true, useDefaults: true });
    this.validators = {};
  }

  // eslint-disable-next-line class-methods-use-this
  getSchemaValidator(schemaName, version = '1') {
    if (schemaName === 'aice-configuration') {
      return new Configuration(this.ajv);
    }
    if (schemaName === 'opennlx') {
      if (version === '2') {
        return new OpennlxV2(this.ajv);
      }
      return new OpennlxV1(this.ajv);
    }
    const msg =
      schemaName && schemaName.length ? `Unknown schema: ${schemaName} with version=${version}` : 'Unknown schema';
    throw new Error(msg);
  }

  getValidator(schemaName, version) {
    let validator = this.validators[`${schemaName}_${version}`];
    if (!validator) {
      validator = this.getSchemaValidator(schemaName, version);
      this.validators[`${schemaName}_${version}`] = validator;
    }
    return validator;
  }

  execute(data, schemaName) {
    const result = {};
    if (data) {
      const validator = this.getValidator(schemaName, data.version);
      result.isValid = validator.execute(data);
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
