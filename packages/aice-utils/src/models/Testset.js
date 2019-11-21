/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import SchemaModel from './SchemaModel';
import schema from '../schemas/aice-testset/v1.json';

export default class Testset extends SchemaModel {
  constructor(manager) {
    super(manager, schema, 'aice-testset', '1');
  }

  static seemsOk(data) {
    return !!(data.name && data.scenarios);
  }

  async merge(_data, list) {
    const data = _data;
    const { content } = data;
    content.isThis = true;
    const l = [...list];
    l.forEach((d, index) => {
      if (d.isValid && !d.content.isThis && d.schema.name === this.name && content.name === d.content.name) {
        content.scenarios = d.content.scenarios.reduce(
          (scenarios, scenario) =>
            scenarios.findIndex(i => i.name === scenario.name) > -1 ? scenarios : [...scenarios, scenario],
          content.scenarios,
        );
        if (!Array.isArray(data.url)) {
          data.url = [data.url];
        }
        data.url.push(d.url);
        list.splice(index, 1);
      }
    });
    delete content.isThis;
  }
}
