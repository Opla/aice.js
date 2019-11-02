/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default class Utils {
  static flatten(array) {
    return array.reduce((x, y) => x.concat(Array.isArray(y) ? Utils.flatten(y) : y), []);
  }

  static mapAsync(array, callbackfn) {
    return Promise.all(array.map(callbackfn));
  }

  static async filterAsync(array, callbackfn) {
    const filterMap = await Utils.mapAsync(array, callbackfn);
    return array.filter((value, index) => filterMap[index]);
  }
}
