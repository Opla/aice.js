/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import fs from 'fs';
import { expect } from 'chai';
import FileManager from '../../src/utils/FileManager';

const fsp = fs.promises;

describe('FileManager', () => {
  it('init', async () => {
    const fm = new FileManager();
    fm.init();
    expect(fm.cli).to.equals(undefined);
  });
  it('getFile no parameters', async () => {
    const fm = new FileManager();
    const file = await fm.getFile();
    expect(file.error).to.not.equals(undefined);
  });
  it('getFile a file', async () => {
    const fm = new FileManager();
    const file = await fm.getFile('./package.json');
    expect(file.type).to.equals('file');
    expect(file.filename).to.equals('./package.json');
    expect(file.stats).to.not.equals(undefined);
  });
  it('getFile a dir', async () => {
    const fm = new FileManager();
    const file = await fm.getFile('./src');
    expect(file.type).to.equals('dir');
    expect(file.filename).to.equals('./src');
    expect(file.stats).to.not.equals(undefined);
  });
  it('loadAsJson a file', async () => {
    const fm = new FileManager();
    const file = await fm.getFile('./package.json');
    const json = await fm.loadAsJson(file);
    expect(json.name).to.equals('aice-cli');
  });
  it('loadAsJson a dir', async () => {
    const fm = new FileManager();
    const file = await fm.getFile('./src');
    const res = await fm.loadAsJson(file);
    expect(res.error).to.equals('Not a valid file');
  });
  it('loadAsJson not valid file', async () => {
    const fm = new FileManager();
    const file = await fm.getFile('./.gitignore');
    const json = await fm.loadAsJson(file);
    expect(json.error).to.equals('Not a valid file');
  });
  it('loadAsJson not existing  json file', async () => {
    const fm = new FileManager();
    const file = { type: 'file', filename: './notvalid.json' };
    const json = await fm.loadAsJson(file);
    expect(json.error).to.equals("Can't read file");
  });
  it('loadAsJson not valid json file', async () => {
    const fm = new FileManager();
    const file = await fm.getFile('./__tests__/dataset/notvalid.json');
    const json = await fm.loadAsJson(file);
    expect(json.error).to.equals('Not a valid JSON');
  });
  it('loadAsJson faulty file', async () => {
    const fm = new FileManager();
    const file = { type: 'file' };
    const json = await fm.loadAsJson(file);
    expect(json.error).to.equals('Not a valid file');
  });
  it('Extract not valid zip file', async () => {
    const fm = new FileManager();
    const file = await fm.getFile('./.gitignore');
    const res = await fm.extract(file);
    expect(res.error).to.equals('Not a valid zip file');
  });
  it('Extract faulty zip file', async () => {
    const fm = new FileManager();
    const file = await fm.getFile('./__tests__/dataset/notvalid.zip');
    const res = await fm.extract(file);
    expect(res.error).to.equals("Can't unzip file");
  });
  it('Extract zip file', async () => {
    const fm = new FileManager();
    const file = await fm.getFile('./__tests__/dataset/valid.zip');
    const res = await fm.extract(file);
    expect(res.ok).to.equals('Extracted');
  });
  it('Extract zip file with handler', async () => {
    const fm = new FileManager();
    try {
      await fsp.mkdir('./temp-test');
    } catch (e) {
      //
    }
    let data;
    const handler = async (fn, output, entry, filem) => {
      let resp = true;
      if (fn.endsWith('.json')) {
        const d = await filem.readZipEntry(entry);
        try {
          data = JSON.parse(d);
        } catch (e) {
          // data = null;
        }
      } else if (fn.endsWith('dummy.pdf')) {
        try {
          await filem.writeZipEntry(entry, fn, output);
        } catch (e) {
          resp = false;
        }
      } else {
        try {
          await filem.readZipEntry(entry, fn, output);
        } catch (e) {
          resp = false;
        }
      }
      return resp;
    };
    const file = await fm.getFile('./__tests__/dataset/valid.zip');
    const res = await fm.extract(file, './temp-test', handler);

    await fsp.rmdir('./temp-test', { recursive: true });
    expect(res.ok).to.equals('Extracted');
    expect(data.var).to.equals('value');
  });
});
