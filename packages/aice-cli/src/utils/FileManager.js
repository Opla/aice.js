/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import fs from 'fs';
import aiceUtils from 'aice-utils';

const fsp = fs.promises;

export default class FileManager {
  constructor(cli) {
    this.cli = cli;
  }

  init() {
    aiceUtils.setFileManager(this);
  }

  // eslint-disable-next-line class-methods-use-this
  async getFile(filename) {
    const file = {};
    let stats;
    try {
      stats = await fsp.stat(filename);
      if (stats.isDirectory()) {
        file.type = 'dir';
      }
      if (stats.isFile()) {
        file.type = 'file';
      }
      file.stats = stats;
      file.filename = filename;
    } catch (e) {
      file.error = e;
    }
    return file;
  }

  // eslint-disable-next-line class-methods-use-this
  async loadAsJson(file) {
    let result;
    const { filename } = file;
    if (file.type === 'file' && file.filename && filename.toLowerCase().endsWith('.json')) {
      let data;
      try {
        data = await fsp.readFile(filename);
      } catch (error) {
        result = { error: "Can't read file" };
      }
      if (data) {
        try {
          result = JSON.parse(data);
        } catch (e) {
          result = { error: 'Not a valid JSON' };
        }
      }
    } else {
      result = { error: 'Not a valid file' };
    }
    return result;
  }
}
