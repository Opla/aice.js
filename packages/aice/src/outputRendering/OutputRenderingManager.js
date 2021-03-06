/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import SimpleOutputRenderer from './SimpleOutputRenderer';

export default class OutputRenderingManager {
  constructor({ outputRenderers = [], ...settings } = {}) {
    this.settings = settings;
    this.outputRenderers = [];
    if (outputRenderers && outputRenderers.length > 0) {
      this.outputRenderers.push(...outputRenderers);
    } else {
      this.outputRenderers.push(new SimpleOutputRenderer({ ...this.settings }));
    }
  }

  /**
   * Train all IntentsResolvers
   * @returns {Intents}
   */
  async train(outputs) {
    return this.outputRenderers[0].train(outputs);
    // this.outputRenderers.forEach(or => or.train(outputs));
  }

  async execute(lang, intents = [], context) {
    // Will need some more mechanics before using multiple OutputRenderer techniques
    // If context.internal_slotfilling use SlotFillingRenderer
    // else use SimpleRenderer
    // Last If previous renderers returns undefined use MLBasedRenderer
    return this.outputRenderers[0].execute(lang, intents, context);
  }
}
