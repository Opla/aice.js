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
  constructor(services) {
    this.ajv = new Ajv({ allErrors: true, useDefaults: true });
    this.models = {};
    this.services = services;
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
  createSchemaModel(schemaName, version) {
    if (schemaName === 'aice-configuration') {
      return new Configuration(this);
    }
    if (schemaName === 'aice-testset') {
      return new Testset(this);
    }
    if (schemaName === 'opennlx') {
      if (version === '2') {
        return new OpennlxV2(this);
      }
      return new OpennlxV1(this);
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

  getSchemaModel(schemaName, version) {
    let model = this.models[`${schemaName}_${version}`];
    if (!model) {
      model = this.createSchemaModel(schemaName, version);
      this.models[`${schemaName}_${version}`] = model;
    }
    return model;
  }

  find(data, schemaName) {
    if (schemaName && data[schemaName] && data[schemaName].version) {
      return this.getSchemaModel(schemaName, data[schemaName].version);
    }
    const schema = this.findSchemaNameAndVersion(data);
    if (schema) {
      return this.getSchemaModel(schema.name, schema.version);
    }
    throw new Error(this.getErrorMessage(schemaName));
  }

  /* async run(data, { schemaName, saveModel = true }) {
    const result = { isValid: false };
    if (data && !Array.isArray(data) && typeof data === 'object') {
      try {
        const model = this.find(data, schemaName);
        result.isValid = await model.validate(data);
        if (!schemaName) {
          result.schema = { name: model.name, version: model.version };
        }
        if (!result.isValid) {
          // TODO handle errors format
          // for not valid properties
          result.error = model.errors;
        } else if (saveModel) {
          result.model = model;
        }
      } catch (e) {
        result.error = e.message;
      }
    } else {
      result.error = 'wrong data format';
    }
    return result;
  } */
}
