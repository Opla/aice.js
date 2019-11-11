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
    if (schemaName && data[schemaName] && data[schemaName].version) {
      return this.getValidator(schemaName, data[schemaName].version);
    }
    const res = this.findSchemaNameAndVersion(data);
    if (res) {
      return this.getValidator(res.schemaName, res.version);
    }
    throw new Error(this.getErrorMessage(schemaName));
  }

  async proceedData(data, schemaName) {
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

  async loadData(filename, schemaName) {
    const fileManager = this.utils.getFileManager();
    if (fileManager) {
      //  Check if it is a filename or a path
      const file = await fileManager.getFile(filename);
      if (file) {
        if (file.type === 'file') {
          //  load file
          const data = await fileManager.loadAsJson(file);
          return this.proceedData(data, schemaName);
        }
        if (file.type === 'dir') {
          // Get all sub files
          const files = await fileManager.readDir(file);
          const output = [];
          await Promise.all(
            files.map(async f => {
              // console.log('file', f);
              const d = await fileManager.loadAsJson(f);
              const r = await this.proceedData(d);
              output.push(r);
            }),
          );
          if (output.length > 0) {
            return output;
          }
        }
      }
    }
    return { error: `file not found : ${filename}`, isValid: false };
  }

  async execute(input, schemaName) {
    const result = { isValid: false };
    let data = input;
    if (data) {
      if (typeof data === 'string' && data.trim().length > 0) {
        // Check if the string is JSON
        try {
          data = JSON.parse(data);
        } catch (e) {
          data = null;
        }
        // If not a string we try to use it as a filename
        if (!data) {
          return this.loadData(input, schemaName);
        }
      }
      // Maybe data is an object
      return this.proceedData(data, schemaName);
    }
    result.error = 'empty data';
    return result;
  }
}
