/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

class AIceUtils {
  constructor() {
    this.parameters = {};
  }

  setConfiguration(config) {
    this.parameters.config = { ...config };
  }

  getConfiguration() {
    return this.parameters.config;
  }
}
const singletonInstance = new AIceUtils();
Object.freeze(singletonInstance);
export default singletonInstance;
