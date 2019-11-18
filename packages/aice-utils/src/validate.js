/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Ajv from 'ajv';
import Configuration from './models/Configuration';
import OpennlxV1 from './models/OpennlxV1';
import OpennlxV2 from './models/OpennlxV2';
import Testset from './models/Testset';

export default class {
  constructor(utils) {
    this.ajv = new Ajv({ allErrors: true, useDefaults: true });
    this.validators = {};
    this.utils = utils;
  }

  // eslint-disable-next-line class-methods-use-this
  getErrorMessage(schemaName, version) {
    let msg = schemaName && schemaName.length ? `Unknown schema: ${schemaName}` : 'Unknown schema';
    if (version) {
      msg += ` with version=${version}`;
    }
    return msg;
  }

  // eslint-disable-next-line class-methods-use-this
  getSchemaValidator(schemaName, version) {
    if (schemaName === 'aice-configuration') {
      return new Configuration(this.ajv);
    }
    if (schemaName === 'aice-testset') {
      return new Testset(this.ajv);
    }
    if (schemaName === 'opennlx') {
      if (version === '2') {
        return new OpennlxV2(this.ajv);
      }
      return new OpennlxV1(this.ajv);
    }
    throw new Error(this.getErrorMessage(schemaName, version));
  }

  // eslint-disable-next-line class-methods-use-this
  findSchemaNameAndVersion(data) {
    let schema;
    if (Configuration.seemsOk(data)) {
      schema = { name: 'aice-configuration' };
    } else if (Testset.seemsOk(data)) {
      schema = { name: 'aice-testset', version: '1' };
    } else if (OpennlxV2.seemsOk(data)) {
      schema = { name: 'opennlx', version: '2' };
    } else if (OpennlxV1.seemsOk(data)) {
      schema = { name: 'opennlx' };
    }
    return schema;
  }

  getValidator(schemaName, version) {
    let validator = this.validators[`${schemaName}_${version}`];
    if (!validator) {
      validator = this.getSchemaValidator(schemaName, version);
      this.validators[`${schemaName}_${version}`] = validator;
    }
    return validator;
  }

  findValidator(data, schemaName) {
    if (schemaName && data[schemaName] && data[schemaName].version) {
      return this.getValidator(schemaName, data[schemaName].version);
    }
    const schema = this.findSchemaNameAndVersion(data);
    if (schema) {
      return this.getValidator(schema.name, schema.version);
    }
    throw new Error(this.getErrorMessage(schemaName));
  }

  async run(data, schemaName) {
    const result = { isValid: false };
    if (data && !Array.isArray(data) && typeof data === 'object') {
      try {
        const validator = this.findValidator(data, schemaName);
        result.isValid = await validator.execute(data);
        if (!schemaName) {
          result.schema = { name: validator.name, version: validator.version };
        }
        if (!result.isValid) {
          // TODO handle errors format
          // for not valid properties
          result.error = validator.errors;
        }
      } catch (e) {
        result.error = e.message;
      }
    } else {
      result.error = 'wrong data format';
    }
    return result;
  }
}
