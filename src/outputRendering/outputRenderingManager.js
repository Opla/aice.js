/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { SimpleOutputRenderer } from './outputRenderer';

export default class OutputRenderingManager {
  constructor({ settings }) {
    this.settings = settings || {};
    this.outputRenderers = [];
    if (this.settings.outputRenderers && this.settings.outputRenderers.length > 0) {
      this.outputRenderers = this.settings.outputRenderers;
    } else {
      this.outputRenderers = [new SimpleOutputRenderer({ settings: this.settings })];
    }
  }

  /**
   * Train all IntentsResolvers
   * @returns {Intents}
   */
  train(outputs) {
    this.outputRenderers[0].train(outputs);
    // this.outputRenderers.forEach(or => or.train(outputs));
  }

  async process(lang, intents = [], context) {
    // Will need some more mechanics before using multiple OutputRenderer techniques
    // If context.internal_slotfilling use SlotFillingRenderer
    // else use SimpleRenderer
    // Last If previous renderers returns undefined use MLBasedRenderer
    return this.outputRenderers[0].process(lang, intents, context);
  }
}
