/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import aiceUtils from '../../src';

describe('import configurations', () => {
  it('simple configuration', async () => {
    const result = await aiceUtils.importData('{ "configuration": { "threshold": 0.75 } }');
    expect(result.length).to.equal(1);
    expect(result[0]).to.eql({
      content: { configuration: { threshold: 0.75 } },
      schema: { name: 'aice-configuration' },
      isValid: true,
    });
  });
});
