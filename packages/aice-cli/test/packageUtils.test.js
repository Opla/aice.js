/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import { getPackageDependencyVersion, getPackageVersion } from '../src/utils/packageUtils';

describe('packageUtils', () => {
  it('getPackageDependencyVersion', async () => {
    let res = getPackageDependencyVersion('dgdfg');
    expect(res).to.be.eq(undefined);
    res = getPackageDependencyVersion();
    expect(res).to.be.eq(undefined);
    let version = getPackageDependencyVersion('aice');
    expect(version)
      .to.be.a('string')
      .and.match(/^\d.\d.\d/);
    version = getPackageDependencyVersion('aice', '^0.4.0');
    expect(version)
      .to.be.a('string')
      .and.match(/^\d.\d.\d/);
  });
  it('getPackageVersion', async () => {
    const version = await getPackageVersion();
    expect(version)
      .to.be.a('string')
      .and.match(/^\d.\d.\d/);
  });
});
