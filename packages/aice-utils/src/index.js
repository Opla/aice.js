/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Validate from './validate';

class AIceUtils {
  constructor() {
    this.parameters = {};
    this.utils = {};
    this.validate = new Validate(this);
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
              // console.log('file', f);
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

  /* istanbul ignore next */
  async doImport(data, opts) {
    const result = this.validate.run(data, opts.schemaName);
    if (result.isValid) {
      return true;
    }
    return false;
  }

  /* istanbul ignore next */
  async importData(data, opts) {
    let result;
    try {
      result = await this.transformData(data, async (d, o) => this.doImport(d, o), opts);
    } catch (e) {
      result = false;
    }
    return result;
  }
}

const singletonInstance = new AIceUtils();
Object.freeze(singletonInstance);
export default singletonInstance;
