/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import SchemaModel from './SchemaModel';
import schema from '../schemas/aice-configuration/v1.json';

export default class Configuration extends SchemaModel {
  constructor(manager) {
    super(manager, schema, 'aice-configuration', '1');
  }

  static seemsOk(data) {
    return !!(!data.version && data.configuration);
  }

  async merge(_data, list) {
    const data = _data;
    const { configuration } = data.content;
    data.content.isThis = true;
    const l = [...list];
    l.forEach((d, index) => {
      if (d.isValid && !d.content.isThis && d.schema.name === this.name) {
        const { resolvers } = d.content.configuration;
        if (resolvers) {
          configuration.resolvers = resolvers.reduce(
            (rs, resolver) => (rs.findIndex(i => i.name === resolver.name) > -1 ? rs : [...rs, resolver]),
            configuration.resolvers || [],
          );
        }
        if (!Array.isArray(data.url)) {
          data.url = [data.url];
        }
        data.url.push(d.url);
        list.splice(index, 1);
      }
    });
    delete data.content.isThis;
  }
}
