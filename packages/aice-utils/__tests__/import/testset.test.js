/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import aiceUtils from '../../src';

describe('import testset', () => {
  it('simple testset', async () => {
    const result = await aiceUtils.importData(
      '{"name": "test","scenarios": [{"name": "sc1","stories": [{ "name": "story1", "actors": [{ "name": "user", "type": "human"}, { "name": "bot", "type": "robot" }], "dialogs": [] }]}]}',
    );
    expect(result.length).to.equal(1);
    expect(result[0]).to.eql({
      content: {
        name: 'test',
        scenarios: [
          {
            name: 'sc1',
            stories: [
              {
                name: 'story1',
                context: {},
                actors: [{ name: 'user', type: 'human' }, { name: 'bot', type: 'robot' }],
                dialogs: [],
              },
            ],
          },
        ],
      },
      schema: { name: 'aice-testset' },
      isValid: true,
    });
  });
});
