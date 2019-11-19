/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Validate from './validate';
import OpennlxV2 from './models/OpennlxV2';
import AgentsManager from './AgentsManager';
import TestsManager from './TestsManager';

class AIceUtils {
  constructor() {
    this.parameters = {};
    this.utils = {};
    this.validate = new Validate(this);
    this.testManager = new TestsManager(this);
  }

  setAIceClass(AIceClass) {
    this.utils.AIceClass = AIceClass;
  }

  createAIceInstance(opts) {
    if (this.utils.AIceClass) {
      const { AIceClass } = this.utils;
      return new AIceClass(opts);
    }
    throw new Error('No AIce class defined');
  }

  getAgentsManager(opts) {
    if (!this.utils.agentsManager) {
      this.utils.agentsManager = new AgentsManager(this, opts);
    }
    return this.utils.agentsManager;
  }

  setFileManager(fileManager) {
    if (fileManager && typeof fileManager.getFile === 'function' && typeof fileManager.loadAsJson === 'function') {
      this.utils.fileManager = fileManager;
    } else {
      throw new Error('Invalid FileManager');
    }
  }

  getFileManager() {
    return this.utils.fileManager;
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

  async loadData(filename, transformer, opts) {
    const fileManager = this.getFileManager();
    if (fileManager) {
      //  Check if it is a filename or a path
      const file = await fileManager.getFile(filename);
      if (file) {
        if (file.type === 'file') {
          //  load file
          const content = await fileManager.loadAsJson(file);
          return transformer(content, opts);
        }
        if (file.type === 'dir') {
          // Get all sub files
          const files = await fileManager.readDir(file);
          const output = [];
          await Promise.all(
            files.map(async f => {
              const content = await fileManager.loadAsJson(f);
              const data = await transformer(content, opts);
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

  async validateData(data, schemaName) {
    let result;
    try {
      result = await this.transformData(data, async (d, opts) => this.validate.run(d, opts.schemaName), { schemaName });
    } catch (e) {
      result = { error: e.message, isValid: false };
    }
    return result;
  }

  async doImport(content, output, opts) {
    const result = await this.validate.run(content, opts.schemaName);
    if (result.isValid) {
      const schemaName = result.schema && result.schema.name ? result.schema.name : opts.schemaName;
      if (schemaName === 'aice-configuration') {
        const schema = { name: 'aice-configuration' };
        output.push({ content, schema, isValid: result.isValid });
        return true;
      }
      if (schemaName === 'aice-testset') {
        const schema = { name: 'aice-testset' };
        output.push({ content, schema, isValid: result.isValid });
        return true;
      }
      let agent = content;
      if ((result.schema && result.schema.version === '1') || opts.version === '1') {
        // Convert v1 to v2
        agent = await OpennlxV2.convert(content, opts);
      }
      const schema = { name: 'opennlx', version: '2' };
      output.push({ content: agent, schema, isValid: result.isValid });
      return true;
    }
    return false;
  }

  async importData(data, opts = {}) {
    let result;
    const output = [];
    try {
      await this.transformData(data, async (d, o) => this.doImport(d, output, o), opts);
      result = output;
    } catch (e) {
      result = { error: e.message };
    }
    return result;
  }

  /* istanbul ignore next */
  async doExport(content, output, opts) {
    // TODO export in a zip
    const result = await this.validate.run(content, opts.schemaName);
    if (result.isValid) {
      const schemaName = result.schema && result.schema.name ? result.schema.name : opts.schemaName;
      if (schemaName === 'aice-configuration') {
        const { configuration } = content;
        configuration.schema = { name: 'aice-configuration' };
        output.push({ configuration });
        return true;
      }
      if (schemaName === 'aice-testset') {
        const data = { content };
        data.schema = { name: 'aice-testset' };
        output.push(data);
        return true;
      }
      let agent = content;
      if ((result.schema && result.schema.version === '1') || opts.version === '1') {
        // Convert v1 to v2
        agent = await OpennlxV2.convert(content, opts);
      }
      agent.schema = { name: 'opennlx', version: '2' };
      output.push({ agent });
      return true;
    }
    return false;
  }

  /* istanbul ignore next */
  async exportData(data, opts = {}) {
    let result;
    const output = [];
    try {
      await this.transformData(data, async (d, o) => this.doExport(d, output, o), opts);
      result = output;
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
