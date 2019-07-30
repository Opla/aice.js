/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const intersection = (a, b) => {
  const attributes = [];
  const intersectionCheck = e => {
    // eslint-disable-next-line no-bitwise
    if (~b.indexOf(e)) attributes.push(e);
  };

  a.forEach(element => intersectionCheck(element));
  return attributes;
};

/*
 * Jaccard similarity coefficient
 */
const jaccardSimilarity = (a, b) => {
  const intersec = intersection(a, b).length;
  return intersec / (a.length + b.length - intersec);
};

/*
 * Jaccard distance
 */
module.exports = (a, b) => {
  const A = [...a.values()].map(e => (e.expression && e.expression.name) || e.text);
  const B = [...b.values()].map(e => (e.ner && (e.ner.name || e.ner.row)) || e.text);

  const result = { score: jaccardSimilarity(A, B) };
  result.distance = 1 - result.score;

  return result;
};
