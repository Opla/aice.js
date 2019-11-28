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

  // eslint-disable-next-line class-methods-use-this
  compare(d, content) {
    return content.name === d.content.name;
  }

  // eslint-disable-next-line class-methods-use-this
  mergeStories(_source, target) {
    const source = _source;
    source.stories = target.stories.reduce(
      (stories, story) => (stories.findIndex(s => s.name === story.name) > -1 ? stories : [...stories, story]),
      source.stories,
    );
    return source;
  }

  // eslint-disable-next-line class-methods-use-this
  doMerge(d, content) {
    // eslint-disable-next-line no-param-reassign
    content.scenarios = d.content.scenarios.reduce((scenarios, scenario) => {
      const index = scenarios.findIndex(i => i.name === scenario.name);
      if (index > -1) {
        // eslint-disable-next-line no-param-reassign
        scenarios[index] = this.mergeStories(scenarios[index], scenario);
        return scenarios;
      }
      return [...scenarios, scenario];
    }, content.scenarios);
  }
}
