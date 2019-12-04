/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import fs from 'fs';
import path from 'path';
import unzipper from 'unzipper';

const fsp = fs.promises;

export default class FileManager {
  constructor(settings) {
    this.settings = settings || {};
  }

  // eslint-disable-next-line class-methods-use-this
  async readDir(dir, list) {
    const fileList = list || [];
    const files = await fsp.readdir(dir.filename);
    await Promise.all(
      files.map(async f => {
        const filename = path.join(dir.filename, f);
        const file = await this.getFile(filename);
        if (file.type === 'dir') {
          await this.readDir(file, fileList);
        }
        fileList.push(file);
      }),
    );
    return fileList;
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
        if (filename.toLowerCase().endsWith('.zip')) {
          file.type = 'zip';
        } else {
          file.type = 'file';
        }
      }
      file.stats = stats;
      file.filename = filename;
    } catch (e) {
      file.error = e;
    }
    return file;
  }

  // eslint-disable-next-line class-methods-use-this
  async writeZipEntry(entry, filename, outputDir) {
    let ws;
    try {
      const f = path.join(outputDir, filename);
      ws = fs.createWriteStream(f);
      return entry.pipe(ws).promise();
    } catch (e) {
      ws = null;
    }
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  async readZipEntry(entry, filename, outputDir = this.settings.outputDir) {
    const content = await entry.buffer();
    if (filename) {
      const f = path.join(outputDir, filename);
      await fsp.writeFile(f, content);
    }
    return content;
  }

  // eslint-disable-next-line class-methods-use-this
  async extract(file, outputDir, handler = () => false, matchExtensions = /.+(.png|.jpeg|.jpg|.svg|.pdf|.json)$/i) {
    let result;
    const { filename } = file;
    if (file.type === 'zip' && file.filename && filename.toLowerCase().endsWith('.zip')) {
      try {
        await fs
          .createReadStream(filename)
          .pipe(unzipper.Parse())
          .on('entry', async entry => {
            let fn = entry.path;
            const { type } = entry;
            let shouldDrain = true;
            if (type === 'File' && fn[0] !== '.' && fn.match(matchExtensions)) {
              const i = fn.lastIndexOf('/');
              if (i > -1) {
                fn = fn.substring(i + 1);
              }
              if (fn[0] !== '.') {
                shouldDrain = await handler(fn, outputDir, entry, this);
              }
            }
            if (shouldDrain) {
              entry.autodrain();
            }
          })
          .promise();
        result = { ok: 'Extracted' };
      } catch (error) {
        result = { error: "Can't unzip file" };
      }
    } else {
      result = { error: 'Not a valid zip file' };
    }
    return result;
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
          result = { error: `Not a valid JSON : ${e.message}` };
        }
      }
    } else {
      result = { error: 'Not a valid file' };
    }
    return result;
  }
}
