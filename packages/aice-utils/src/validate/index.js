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
  constructor(utils) {
    this.ajv = new Ajv({ allErrors: true, useDefaults: true });
    this.validators = {};
    this.utils = utils;
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

  // eslint-disable-next-line class-methods-use-this
  findSchemaNameAndVersion(data) {
    let schemaNameAndVersion;
    if (Configuration.seemsOk(data)) {
      schemaNameAndVersion = { schemaName: 'aice-configuration' };
    } else if (OpennlxV2.seemsOk(data)) {
      schemaNameAndVersion = { schemaName: 'opennlx', version: '2' };
    } else if (OpennlxV1.seemsOk(data)) {
      schemaNameAndVersion = { schemaName: 'opennlx' };
    }
    return schemaNameAndVersion;
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
    if (schemaName) {
      return this.getValidator(schemaName, data.version);
    }
    const res = this.findSchemaNameAndVersion(data);
    if (res) {
      return this.getValidator(res.schemaName, res.version);
    }
    throw new Error('Unknown schema');
  }

  execute(input, schemaName) {
    const result = { isValid: false };
    let data = input;
    if (data) {
      if (typeof data === 'string' && data.trim().length > 0) {
        // Check if it is JSON
        try {
          data = JSON.parse(data);
        } catch (e) {
          data = null;
        }
        const fileManager = this.utils.getFileManager();
        if (!data && fileManager) {
          // TODO Check if it is a filename or a path
          const file = fileManager.getFile(input);
          if (file && file.type === 'file') {
            // TODO load file
            data = fileManager.loadAsJson(file);
          } else {
            data = null;
            result.error = `file not found : ${input}`;
          }
        }
      }
      if (data && !Array.isArray(data) && typeof data === 'object') {
        try {
          const validator = this.findValidator(data, schemaName);
          result.isValid = validator.execute(data);
          if (!result.isValid) {
            // TODO handle errors format
            // for not valid properties
            result.error = validator.errors;
          }
        } catch (e) {
          result.error = e.message;
        }
      } else if (!result.error) {
        result.error = 'wrong data format';
      }
    } else {
      result.error = 'empty data';
    }
    return result;
  }
}
