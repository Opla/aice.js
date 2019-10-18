/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Comparator } from './comparator';

import LazzyUnorderedComparator from './LazzyUnorderedComparator';
import UnorderedComparator from './UnorderedComparator';
import {
  StrategyWordComparator,
  ExactStrategy,
  LevenshteinStrategy,
  DamerauLevenshteinStrategy,
} from './wordsComparator';

export {
  Comparator,
  UnorderedComparator,
  LazzyUnorderedComparator,
  StrategyWordComparator,
  ExactStrategy,
  LevenshteinStrategy,
  DamerauLevenshteinStrategy,
};
