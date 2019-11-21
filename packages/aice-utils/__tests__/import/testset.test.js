/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import aiceUtils from '../../src';

describe('import testset', () => {
  it('simple testset', async () => {
    const result = await aiceUtils.importData(
      '{"name": "test","scenarios": [{"name": "sc1","stories": [{ "name": "story1", "actors": [{ "name": "user", "type": "human"}, { "name": "bot", "type": "robot" }], "dialogs": [] }]}]}',
    );
    expect(result.length).to.equal(1);
    expect(result[0]).to.eql({
      content: {
        name: 'test',
        scenarios: [
          {
            name: 'sc1',
            stories: [
              {
                name: 'story1',
                context: {},
                actors: [
                  { name: 'user', type: 'human' },
                  { name: 'bot', type: 'robot' },
                ],
                dialogs: [],
              },
            ],
          },
        ],
      },
      schema: { name: 'aice-testset' },
      isValid: true,
    });
  });
  it('testset file', async () => {
    const model1 = {
      name: 'test',
      scenarios: [
        {
          name: 'sc1',
          stories: [
            {
              name: 'story1',
              actors: [
                { name: 'user', type: 'human' },
                { name: 'bot', type: 'robot' },
              ],
              dialogs: [],
            },
          ],
        },
      ],
    };
    const model2 = { configuration: { threshold: 0.75 } };
    const fileManager = {
      getFile: async f => (f === 'directory' ? { type: 'dir', filename: f } : { type: 'file', filename: f }),
      loadAsJson: async f => (f.filename === 'filename' ? model1 : model2),
      readDir: async () => [
        { type: 'file', filename: 'filename' },
        { type: 'file', filename: 'filename2' },
      ],
    };
    aiceUtils.setFileManager(fileManager);
    const result = await aiceUtils.importData('directory');
    expect(result.length).to.equal(2);
    expect(result[0]).to.eql({
      content: {
        name: 'test',
        scenarios: [
          {
            name: 'sc1',
            stories: [
              {
                name: 'story1',
                context: {},
                actors: [
                  { name: 'user', type: 'human' },
                  { name: 'bot', type: 'robot' },
                ],
                dialogs: [],
              },
            ],
          },
        ],
      },
      schema: { name: 'aice-testset' },
      isValid: true,
      url: 'filename',
    });
  });
  it('merge 4 json from dir', async () => {
    const model1 = {
      name: 'test',
      scenarios: [
        {
          name: 'sc1',
          stories: [
            {
              name: 'story1',
              actors: [
                { name: 'user', type: 'human' },
                { name: 'bot', type: 'robot' },
              ],
              dialogs: [],
            },
          ],
        },
      ],
    };
    const model2 = {
      name: 'test',
      scenarios: [],
    };
    const model3 = {
      name: 'test',
      scenarios: [
        {
          name: 'sc2',
          stories: [
            {
              name: 'story1',
              actors: [
                { name: 'user', type: 'human' },
                { name: 'bot', type: 'robot' },
              ],
              dialogs: [],
            },
          ],
        },
      ],
    };
    const model4 = {
      name: 'test',
      scenarios: [
        {
          name: 'sc2',
          stories: [
            {
              name: 'story1',
              actors: [
                { name: 'user', type: 'human' },
                { name: 'bot', type: 'robot' },
              ],
              dialogs: [],
            },
          ],
        },
      ],
    };
    const models = { model1, model2, model3, model4 };
    const fileManager = {
      getFile: async f => (f === 'directory' ? { type: 'dir', filename: f } : { type: 'file', filename: f }),
      loadAsJson: async f => models[f.filename],
      readDir: async () => [
        { type: 'file', filename: 'model1' },
        { type: 'file', filename: 'model2' },
        { type: 'file', filename: 'model3' },
        { type: 'file', filename: 'model4' },
      ],
    };
    aiceUtils.setFileManager(fileManager);
    const result = await aiceUtils.importData('directory');
    expect(result).to.be.an('array');
    expect(result.length).to.equal(2);
    expect(result[0].isValid).to.equal(false);
    expect(result[1].isValid).to.equal(true);
    expect(result[1].schema.name).to.equal('aice-testset');
    expect(result[1].content.scenarios.length).to.equal(2);
    expect(result[1].content.scenarios[0].name).to.equal('sc2');
    expect(result[1].content.scenarios[1].name).to.equal('sc1');
    aiceUtils.parameters.fileManager = null;
  });
});
