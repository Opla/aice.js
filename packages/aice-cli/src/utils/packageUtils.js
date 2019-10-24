/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import pkg from '../../package.json';

export const getPackageDependencyVersion = (name, ref) => {
  let v = ref;
  if (pkg.dependencies[name]) {
    v = pkg.dependencies[name];
  }
  if (v && (v[0] < '0' || v[0] > '9')) {
    v = v.substring(1);
  }
  return v;
};

export const getPackageVersion = () => pkg.version;
