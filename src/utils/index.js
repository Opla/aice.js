/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  Comparator,
  UnorderedComparator,
  LazzyUnorderedComparator,
  StrategyWordComparator,
  ExactStrategy,
  LevenshteinStrategy,
  DamerauLevenshteinStrategy,
} from './comparator';
import Utils from './TMPUtils';
import ContextMutator from './TMPContextMutator';
import { ConditionEvaluator, ValueEvaluator } from './evaluator';
import Renderer from './rendering/TMPRenderer';
import openNLXSyntaxAdapter from './openNLXSyntaxAdapter';

export default Utils;

export {
  Comparator,
  UnorderedComparator,
  LazzyUnorderedComparator,
  ContextMutator,
  ConditionEvaluator,
  StrategyWordComparator,
  ExactStrategy,
  LevenshteinStrategy,
  DamerauLevenshteinStrategy,
  Renderer,
  Utils,
  ValueEvaluator,
  openNLXSyntaxAdapter,
};
