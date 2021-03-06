/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import fs from 'fs';
import { expect } from 'chai';
import FileManager from '../src/FileManager';

const fsp = fs.promises;

describe('FileManager', () => {
  it('init', async () => {
    const fm = new FileManager();
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
  it('readdir', async () => {
    const fm = new FileManager();
    const dir = await fm.getFile('./__tests__/dataset');
    const files = await fm.readDir(dir);
    expect(files).to.be.an('array');
  });
  it('loadAsJson a file', async () => {
    const fm = new FileManager();
    const file = await fm.getFile('./package.json');
    const json = await fm.loadAsJson(file);
    expect(json.name).to.equals('aice-nfm');
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
    expect(json.error).to.equals('Not a valid JSON : Unexpected token o in JSON at position 2');
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
  it('Extract zip file with handler #dev', async () => {
    const fm = new FileManager();
    try {
      await fsp.mkdir('./temp-test');
    } catch (e) {
      //
    }
    const outputPath = './temp-test';
    const entryHandler = async entry => {
      let resp = true;
      const fn = entry.filename;
      console.log('handler:', fn);
      if (fn.endsWith('dummy.pdf')) {
        try {
          console.log('saveTo:', fn);
          await entry.saveTo(outputPath);
          resp = false;
        } catch (e) {
          //
        }
      }
      return resp;
    };
    const file = await fm.getFile('./__tests__/dataset/valid.zip');
    const res = await fm.extract(file, {
      outputPath,
      pattern: /(^(?!\.))(.+(.png|.jpeg|.jpg|.svg|.pdf|.json))$/i,
      flattenPath: true,
      disableSave: true,
      disableOutput: true,
      rules: [
        { pattern: /(^(?!\.))(test.json)$/i, outputContent: true },
        { pattern: /(^(?!\.))(.+(.png|.jpeg|.jpg|.svg|.pdf))$/i, entryHandler },
      ],
    });

    // await fsp.rmdir('./temp-test', { recursive: true });
    expect(res.ok).to.equals('Extracted');
    console.log('res', res);
    const data = JSON.parse(res.files[0].content.toString());
    expect(data.var).to.equals('value');
  });
});
