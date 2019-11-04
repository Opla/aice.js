/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import IntentResolver from './IntentResolver';

export default class RemoteIntentResolver extends IntentResolver {
  constructor({ fetch, url, ...settings }) {
    super(settings);
    if (!fetch) {
      throw new Error('Invalid RemoteIntentResolverconstructor - Missing fetch function');
    }
    if (!url) {
      throw new Error('Invalid RemoteIntentResolverconstructor - Missing url');
    }
    this.fetch = fetch;
    this.url = url;
  }

  async train(intents = []) {
    const body = JSON.stringify({ intents });
    const raw = await this.fetch(`${this.url}/train`, { method: 'POST', body });
    const resp = await raw.json();
    this.inputs = resp.intents;
    return resp.intents;
  }

  async execute(lang, sentence, context) {
    const body = JSON.stringify({ lang, sentence, context });
    const res = await this.fetch(`${this.url}/execute`, { method: 'POST', body });
    const resp = await res.json();
    return resp;
  }

  async evaluate(lang, sentence, context) {
    const body = JSON.stringify({ lang, sentence, context });
    const res = await this.fetch(`${this.url}/evaluate`, { method: 'POST', body });
    const resp = await res.json();
    return resp;
  }
}
