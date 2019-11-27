/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import SchemaModelsManager from './SchemaModelsManager';
import OpennlxV2 from './models/OpennlxV2';
import AgentsManager from './AgentsManager';
import TestsManager from './TestsManager';

class AIceUtils {
  constructor() {
    this.parameters = {};
    this.services = {};
    this.schemaManager = new SchemaModelsManager(this);
    this.testManager = new TestsManager(this);
  }

  setAIceClass(AIceClass) {
    this.services.AIceClass = AIceClass;
  }

  setServices(services) {
    Object.keys(services).forEach(name => {
      this.services[name] = services[name];
    });
  }

  createAIceInstance(opts) {
    if (this.services.AIceClass) {
      const { AIceClass } = this.services;
      return new AIceClass(opts);
    }
    throw new Error('No AIce class defined');
  }

  // eslint-disable-next-line class-methods-use-this
  initSettings(_settings, debug) {
    const settings = _settings || {};
    if (debug) {
      settings.debug = debug;
      const services = settings.services || {};
      if (!services.logger) {
        services.logger = { enabled: true };
      }
      if (!services.tracker) {
        services.tracker = { enabled: true };
      }
      settings.services = services;
    }
    return settings;
  }

  getAgentsManager(opts) {
    if (!this.services.agentsManager) {
      this.services.agentsManager = new AgentsManager(this, opts);
    }
    return this.services.agentsManager;
  }

  setFileManager(fileManager) {
    if (fileManager && typeof fileManager.getFile === 'function' && typeof fileManager.loadAsJson === 'function') {
      this.services.fileManager = fileManager;
    } else {
      throw new Error('Invalid FileManager');
    }
  }

  getFileManager() {
    return this.services.fileManager;
  }

  setConfiguration(config) {
    this.parameters.config = config;
  }

  getConfiguration() {
    return this.parameters.config;
  }

  // eslint-disable-next-line class-methods-use-this
  async handleZipEntry(filename, outputDir, entry, fileManager) {
    const result = { autoDrain: true };
    if (filename.endsWith('.json')) {
      const raw = await fileManager.readZipEntry(entry, outputDir);
      result.autoDrain = false;
      try {
        result.content = JSON.parse(raw);
      } catch (e) {
        result.content = null;
      }
    } else if (outputDir) {
      await fileManager.writeZipEntry(entry, filename, outputDir);
      result.autoDrain = false;
    }
    return result;
  }

  async loadFile(file, transformer, opts) {
    const fileManager = this.getFileManager();
    const content = await fileManager.loadAsJson(file);
    let data;
    if (content && !content.error) {
      data = await transformer(content, opts);
    } else {
      /* istanbul ignore next */
      data = { error: content && content.error ? content.error : 'No content found', isValid: false };
    }
    data.url = file.filename;
    return data;
  }

  async loadData(filename, transformer, opts) {
    const fileManager = this.getFileManager();
    if (fileManager) {
      //  Check if it is a filename or a path
      const file = await fileManager.getFile(filename);
      if (file) {
        if (file.type === 'file') {
          //  load file
          return this.loadFile(file, transformer, opts);
        }
        if (file.type === 'dir') {
          // Get all sub files
          const files = await fileManager.readDir(file);
          const output = [];
          await Promise.all(
            files.map(async f => {
              const data = await this.loadFile(f, transformer, opts);
              output.push(data);
            }),
          );
          if (output.length > 0) {
            return output;
          }
        }
        if (file.type === 'zip') {
          const output = [];
          await fileManager.extract(
            file,
            opts.outputDir,
            async (f, o, e, m) => {
              const r = await this.handleZipEntry(f, o, e, m);
              if (r.content) {
                const data = await transformer(r.content, opts);
                data.isZipped = true;
                data.url = f;
                output.push(data);
              }
              return r.autoDrain;
            },
            opts.matchExtensions,
          );
          return output;
        }
      }
      throw Error(`file not found : ${filename}`);
    }
    throw Error('No FileManager defined');
  }

  async transformData(data, transformer = d => d, opts) {
    let content = data;
    if (content) {
      if (typeof content === 'string' && content.trim().length > 0) {
        // Check if the string is JSON
        try {
          content = JSON.parse(content);
        } catch (e) {
          content = null;
        }
        // If not a string we try to use it as a filename
        if (!content) {
          return this.loadData(data, transformer, opts);
        }
      }
      // Transform at least the data
      return transformer(content, opts);
    }
    throw Error('empty data');
  }

  async doValidate(data, { schemaName, saveModel = true }) {
    const result = { isValid: false };
    if (data && !Array.isArray(data) && typeof data === 'object') {
      try {
        const model = this.schemaManager.find(data, schemaName);
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
  }

  async validateData(data, schemaName) {
    let result;
    try {
      result = await this.transformData(
        data,
        async (d, opts) => this.doValidate(d, { schemaName: opts.schemaName, saveModel: false }),
        { schemaName },
      );
    } catch (e) {
      result = { error: e.message, isValid: false };
    }
    return result;
  }

  async doImport(content, opts) {
    const result = await this.doValidate(content, { schemaName: opts.schemaName });
    if (result.model) {
      return result.model.buildData(content, opts);
    }
    return result;
  }

  async importData(data, opts = {}) {
    let result;
    try {
      const output = await this.transformData(data, async (d, o) => this.doImport(d, o), opts);
      if (!Array.isArray(output)) {
        if (output.model) {
          delete output.model;
        }
        result = [output];
      } else {
        result = [];
        for (const d of output) {
          if (d.isValid && !d.merged) {
            // eslint-disable-next-line no-await-in-loop
            await d.model.merge(d, output);
            delete d.model;
            result.push(d);
          } else if (!d.isValid) {
            result.push(d);
          }
        }
      }
    } catch (e) {
      result = [{ error: e.message, isValid: false }];
    }
    return result;
  }

  /* istanbul ignore next */
  async doExport(content, opts) {
    // TODO export in a zip
    const result = await this.doValidate(content, { schemaName: opts.schemaName });
    if (result.isValid) {
      const schemaName = result.schema && result.schema.name ? result.schema.name : opts.schemaName;
      if (schemaName === 'aice-configuration') {
        const { configuration } = content;
        configuration.schema = { name: 'aice-configuration' };
        return { configuration };
      }
      if (schemaName === 'aice-testset') {
        const data = { content };
        data.schema = { name: 'aice-testset' };
        return data;
      }
      let agent = content;
      if ((result.schema && result.schema.version === '1') || opts.version === '1') {
        // Convert v1 to v2
        agent = await OpennlxV2.convert(content, opts);
      }
      agent.schema = { name: 'opennlx', version: '2' };
      return { agent };
    }
    return result;
  }

  /* istanbul ignore next */
  async exportData(data, opts = {}) {
    let result;
    try {
      let output = await this.transformData(data, async (d, o) => this.doExport(d, o), opts);
      if (output && !Array.isArray(output)) {
        output = [output];
      }
      result = output || [];
    } catch (e) {
      result = { error: e.message };
    }
    if (Array.isArray(result) && result.length === 1) {
      [result] = result;
    }
    if (result.configuration && result.configuration.schema) {
      //
      delete result.configuration.schema;
    }
    return JSON.stringify(result);
  }

  async test(agentName, testset, scenarioName, storyName) {
    return this.testManager.test(agentName, testset, scenarioName, storyName);
  }
}

const singletonInstance = new AIceUtils();
Object.freeze(singletonInstance);
export default singletonInstance;
