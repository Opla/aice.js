/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Model from './Model';
import schema from '../schemas/opennlx/v2.json';

export default class OpennlxV2 extends Model {
  constructor(ajv) {
    super(ajv, schema, 'opennlx', '2');
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
}
