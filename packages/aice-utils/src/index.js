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
    this.validate = new Validate(this);
  }

  setFileManager(fileManager) {
    if (fileManager && typeof fileManager.getFile === 'function' && typeof fileManager.loadAsJson === 'function') {
      this.parameters.fileManager = fileManager;
    } else {
      throw new Error('Invalid fileManager');
    }
  }

  getFileManager() {
    return this.parameters.fileManager;
  }

  setConfiguration(config) {
    this.parameters.config = config;
  }

  getConfiguration() {
    return this.parameters.config;
  }

  /* istanbul ignore next */
  validateData(data, schemaName) {
    try {
      return this.validate.execute(data, schemaName);
    } catch (e) {
      return { error: e.message };
    }
  }
}

const singletonInstance = new AIceUtils();
Object.freeze(singletonInstance);
export default singletonInstance;
