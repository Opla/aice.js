/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Authors: Morgan Perre, Jeff Ladiray
 */

export default (a, b) => {
  if (!a) return 0;
  if (!b) return a.length;
  const m = [];
  for (let i = 0; i <= b.length; i += 1) {
    m[i] = [i];
    if (i === 0) {
      // eslint-disable-next-line no-continue
      continue;
    }
    for (let j = 0; j <= a.length; j += 1) {
      m[0][j] = j;
      if (j === 0) {
        // eslint-disable-next-line no-continue
        continue;
      }
      m[i][j] =
        b.charAt(i - 1) === a.charAt(j - 1)
          ? m[i - 1][j - 1]
          : Math.min(m[i - 1][j - 1] + 1, m[i][j - 1] + 1, m[i - 1][j] + 1);
    }
  }
  return m[b.length][a.length];
};
