/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import charMap from './charMap';

/* eslint-disable no-bitwise */
export const charNormalizer = (char, toLowerCase = false) => {
  let c = char.charCodeAt(0);
  let s = '';
  if (c > 126) {
    s = charMap[char] || '';
    if (toLowerCase) {
      c = char.charCodeAt(0);
    }
  } else if (
    (c > 47 && c < 57) ||
    (c > 64 && c < 91) ||
    (c > 96 && c < 123) || // Alphanum
    c === 42 ||
    c === 94
  ) {
    s = char;
  }
  if (toLowerCase && c > 64 && c < 91) {
    s = String.fromCharCode(c + (97 - 65)); // To lower case
  }
  return s;
};

export const fastNormalizer = word => {
  let w = '';
  for (const char of word) {
    w += charNormalizer(char, true);
  }
  return w;
};

export const hashCode = word => {
  let h = 0;
  for (const char of word) {
    h = (Math.imul(31, h) + char.charCodeAt(0)) | 0;
  }
  h >>>= 0;
  return h;
};

/**
 * @param {string} text
 * @param {boolean} leadingPunctation
 * @returns {string}
 */
export const trimPunctuation = (text, leadingPunctation = true) => {
  let l = text.length;
  let i = 0;
  for (; i < l; i += 1) {
    const c = text[i];
    if (c > ' ' && c !== ',' && c !== '.' && c !== '!' && c !== ':' && c !== '?') {
      break;
    }
  }

  for (l -= 1; l >= 0; l -= 1) {
    const c = text[l];
    if (!leadingPunctation && c > ' ' && c !== ',' && c !== '.' && c !== '!' && c !== ':' && c !== '?') {
      break;
    } else if (leadingPunctation && c > ' ') {
      break;
    }
  }
  return text.substring(i, l + 1);
};
