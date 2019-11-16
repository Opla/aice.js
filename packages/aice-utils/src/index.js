/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Validate from './validate';
import OpennlxV2 from './validate/OpennlxV2';

class AIceUtils {
  constructor() {
    this.parameters = {};
    this.utils = {};
    this.validate = new Validate(this);
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
      const d = await fileManager.readZipEntry(entry, outputDir);
      result.autoDrain = false;
      try {
        result.data = JSON.parse(d);
      } catch (e) {
        result.data = null;
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
          const data = await fileManager.loadAsJson(file);
          return transformer(data, opts);
        }
        if (file.type === 'dir') {
          // Get all sub files
          const files = await fileManager.readDir(file);
          const output = [];
          await Promise.all(
            files.map(async f => {
              const d = await fileManager.loadAsJson(f);
              const data = await transformer(d, opts);
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
              if (r.data) {
                const data = await transformer(r.data, opts);
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

  async transformData(input, transformer = d => d, opts) {
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
          return this.loadData(input, transformer, opts);
        }
      }
      // Transform at least the data
      return transformer(data, opts);
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

  async doImport(data, output, opts) {
    const result = await this.validate.run(data, opts.schemaName);
    if (result.isValid) {
      const schemaName = result.schema && result.schema.name ? result.schema.name : opts.schemaName;
      if (schemaName === 'configuration') {
        const { configuration } = data;
        configuration.schema = { name: 'configuration' };
        output.push({ configuration });
        return true;
      }
      let agent = data;
      if ((result.schema && result.schema.version === '1') || opts.version === '1') {
        // Convert v1 to v2
        agent = await OpennlxV2.convert(data, opts);
      }
      agent.schema = { name: 'opennlx', version: '2' };
      output.push({ agent });
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
  async doExport(data, output, opts) {
    // TODO export in a zip
    const result = await this.validate.run(data, opts.schemaName);
    if (result.isValid) {
      const schemaName = result.schema && result.schema.name ? result.schema.name : opts.schemaName;
      if (schemaName === 'configuration') {
        const { configuration } = data;
        configuration.schema = { name: 'configuration' };
        output.push({ configuration });
        return true;
      }
      let agent = data;
      if ((result.schema && result.schema.version === '1') || opts.version === '1') {
        // Convert v1 to v2
        agent = await OpennlxV2.convert(data, opts);
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
}

const singletonInstance = new AIceUtils();
Object.freeze(singletonInstance);
export default singletonInstance;
