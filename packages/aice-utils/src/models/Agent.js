/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
export default class Agent {
  constructor({ name, avatar, context, ...opts }) {
    this.name = name;
    this.avatar = avatar;
    // Global context
    this.context = context;
    this.conversations = {};
    this.opts = opts;
    this.entities = {};
  }

  reset() {
    this.entities = {};
  }

  resetConversations() {
    this.conversations = {};
  }

  async getContext(conversationId) {
    return this.conversations[conversationId];
  }

  async saveContext(conversationId, context) {
    if (context) this.conversations[conversationId] = context;
  }

  async addEntity(entity) {
    this.entities[entity.name] = entity;
  }
}
