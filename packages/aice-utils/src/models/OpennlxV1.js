/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import SchemaModel from './SchemaModel';
import schema from '../schemas/opennlx/v1.json';
import OpennlxV2 from './OpennlxV2';

// eslint-disable-next-line no-unused-vars
const regex = {
  // TODO: entities
  inputSentence: '(?<space>(s|\n|\0|,|;|.|:|!|`|\'|")+)|(?<any>(?<!*)*{1}(?!*))|(?<code>{{.+}})|(?<word>S+)',
  // TODO : <button>, images, link
  outputSentence: '(?<space>(s|\n|\0|,|;|.|:|!|`|\'|")+)|(?<code>{{.+}})|(?<output><<.+>>)|(?<word>S+)',
};

export default class OpennlxV1 extends SchemaModel {
  constructor(manager) {
    super(manager, schema, 'opennlx', '1');
  }

  static seemsOk(data) {
    return !!(!data.version && data.intents && data.name);
  }

  // eslint-disable-next-line class-methods-use-this
  async buildData(_content, opts) {
    const content = await OpennlxV2.convert(_content, opts);
    const modelV2 = this.manager.getSchemaModel('opennlx', '2');
    return modelV2.buildData(content, opts);
  }
}
