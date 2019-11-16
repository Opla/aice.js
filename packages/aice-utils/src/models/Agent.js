/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/* istanbul ignore file */
export default class Agent {
  constructor({ name, context, ...opts }) {
    this.name = name;
    // Global context
    this.context = context;
    this.conversations = {};
    this.opts = opts;
  }

  reset() {
    this.conversations = {};
  }

  async getContext(conversationId) {
    return this.conversations[conversationId];
  }

  async saveContext(conversationId, context) {
    if (context) this.conversations[conversationId] = JSON.parse(JSON.stringify(context));
  }
}
