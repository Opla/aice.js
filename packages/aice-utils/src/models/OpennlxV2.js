/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import SchemaModel from './SchemaModel';
import schema from '../schemas/opennlx/v2.json';

export default class OpennlxV2 extends SchemaModel {
  constructor(manager) {
    super(manager, schema, 'opennlx', '2');
  }

  static seemsOk(data) {
    return !!(data.avatar && data.name);
  }

  static async convert(data, opts) {
    const { agentDefault = {} } = opts;
    const avatar = data.icon || agentDefault.avatar || 'default';
    const locale = data.locale || agentDefault.locale;
    const language = data.language || agentDefault.language;
    const timezone = data.timezone || agentDefault.timezone;
    const email = data.email || agentDefault.email;
    const converted = { name: data.name, avatar, intents: [] };
    if (locale) {
      converted.locale = locale;
    }
    if (language) {
      converted.language = language;
    }
    if (timezone) {
      converted.timezone = timezone;
    }
    if (email) {
      converted.email = email;
    }
    // TODO welcome put in extensions
    data.intents.forEach(intent => {
      const convertedIntent = { name: intent.name || intent.id };
      // TODO convert input
      if (typeof intent.input === 'string') {
        convertedIntent.input = intent.input;
      } else {
        convertedIntent.input = [...intent.input];
      }
      // TODO convert output
      if (typeof intent.output === 'string') {
        convertedIntent.output = intent.output;
      } else {
        convertedIntent.output = [...intent.output];
      }
      if (intent.order || intent.order === 0) {
        convertedIntent.order = intent.order;
      }
      converted.intents.push(convertedIntent);
    });
    return converted;
  }

  async buildData(content) {
    return { content, schema: { name: this.name, version: this.version }, isValid: true, model: this };
  }

  // eslint-disable-next-line class-methods-use-this
  compare(d, content) {
    return d.schema.version === this.version && content.name === d.content.name;
  }

  // eslint-disable-next-line class-methods-use-this
  doMerge(d, content) {
    // eslint-disable-next-line no-param-reassign
    content.intents = d.content.intents.reduce(
      (intents, intent) => (intents.findIndex(i => i.name === intent.name) > -1 ? intents : [...intents, intent]),
      content.intents,
    );
  }
}
