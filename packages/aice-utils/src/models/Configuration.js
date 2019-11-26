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

  // eslint-disable-next-line class-methods-use-this
  compare() {
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  doMerge(d, content) {
    const { configuration } = content;
    const { resolvers } = d.content.configuration;
    if (resolvers) {
      configuration.resolvers = resolvers.reduce(
        (rs, resolver) => (rs.findIndex(i => i.name === resolver.name) > -1 ? rs : [...rs, resolver]),
        configuration.resolvers || [],
      );
    }
  }
}
