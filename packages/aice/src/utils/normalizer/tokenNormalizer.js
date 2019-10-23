/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { fastNormalizer } from './normalizer';

export default token => {
  if (!token.expression || !token.ner) {
    // eslint-disable-next-line no-param-reassign
    token.normalized = fastNormalizer(token.text);
  }
  return token;
};
