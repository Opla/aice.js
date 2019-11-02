/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default (a, b) => {
  if (!a) return 0;
  if (!b) return a.length;

  if (a.length > b.length) {
    throw new Error('Hamming - Length of strings a must be smaller or equal to b');
  }

  let distance = 0;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      distance += 1;
    }
  }
  distance += b.length - a.length;
  return distance;
};
