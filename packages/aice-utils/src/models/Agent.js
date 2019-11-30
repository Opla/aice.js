/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
export default class Agent {
  constructor({ name, avatar, language, context, ...opts }) {
    this.name = name;
    this.avatar = avatar;
    this.language = language;
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
    if (context && typeof conversationId === 'string' && conversationId.trim().length) {
      const sanitizedContext = {};
      Object.keys(context).forEach(name => {
        const value = context[name];
        let ok = true;
        if (typeof value === 'string') {
          ok = value.trim().length && value !== '*' && name.indexOf('anyornothing') === -1 && name !== 'any';
        } else if (typeof value === 'object') {
          ok = !!Object.keys(context).length;
        } /* else if (Array.isArray(value)) {
          ok = !!value.length;
        } else if (value === undefined && value === null) {
          ok = false;
        } */
        if (ok) {
          sanitizedContext[name] = value;
        }
      });
      this.conversations[conversationId] = sanitizedContext;
    }
  }

  async addEntity(entity) {
    this.entities[entity.name] = entity;
  }
}
