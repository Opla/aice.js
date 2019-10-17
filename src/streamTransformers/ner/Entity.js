/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Entity class
 * All NamedEntity extracted should extends this class
 */

export default class Entity {
  constructor({ match, row, confidence, type, name, resolution, start, end }) {
    this.match = match;
    this.row = row;
    this.confidence = confidence;
    this.type = type;
    this.name = name;
    this.resolution = resolution;
    this.start = start;
    this.end = end;
  }
}
