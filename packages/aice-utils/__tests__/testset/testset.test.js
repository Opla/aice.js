/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import aiceUtils from '../../src';

describe('validate testset', () => {
  it('simple testset', async () => {
    const result = await aiceUtils.validateData({
      name: 'test',
      scenarios: [
        {
          name: 'sc1',
          stories: [
            { name: 'story1', actors: [{ name: 'user', type: 'human' }, { name: 'bot', type: 'robot' }], dialogs: [] },
          ],
        },
      ],
    });
    console.log('result=', result);
    expect(result.isValid).to.equal(true);
    expect(result.schema).to.eql({ name: 'aice-testset', version: '1' });
  });
});
