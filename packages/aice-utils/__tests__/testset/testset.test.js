/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import aiceUtils from '../../src';

class AICEClass {
  constructor(opts) {
    this.opts = opts;
    this.isTrained = false;
    this.settings = { defaultLanguage: 'en' };
  }

  async clear() {
    this.isTrained = false;
  }

  async addInput() {
    this.isTrained = false;
  }

  async addOutput() {
    this.isTrained = false;
  }

  async train() {
    this.isTrained = true;
  }

  async evaluate(utterance) {
    if (!this.isTrained) {
      throw new Error('Not trained');
    }
    if (utterance === 'Yabadoo') {
      return { score: 0, answer: utterance, context: {}, issues: [{ message: 'error' }] };
    }
    return { score: 0.75, answer: utterance, context: {} };
  }
}

describe('validate testset', () => {
  it('simple testset', async () => {
    const result = await aiceUtils.validateData({
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
    });
    expect(result.isValid).to.equal(true);
    expect(result.schema).to.eql({ name: 'aice-testset', version: '1' });
  });
});

describe('complete tests', () => {
  const testset = {
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
            dialogs: [
              { from: 'user', say: 'hello' },
              { from: 'bot', say: 'hello' },
            ],
          },
        ],
      },
    ],
  };
  const testsetB = {
    name: 'test',
    scenarios: [
      {
        name: 'scA',
        stories: [
          {
            name: 'storyA1',
            actors: [
              { name: 'user', type: 'human' },
              { name: 'bot', type: 'robot' },
            ],
            dialogs: [
              { from: 'user', say: 'hello' },
              { from: 'bot', say: 'hello' },
            ],
          },
          {
            name: 'storyA2',
            actors: [
              { name: 'user', type: 'human' },
              { name: 'bot', type: 'robot' },
            ],
            dialogs: [
              { from: 'user', say: 'hello' },
              { from: 'bot', say: 'hello' },
            ],
          },
        ],
      },
      {
        name: 'scB',
        stories: [
          {
            name: 'storyB1',
            actors: [
              { name: 'user', type: 'human' },
              { name: 'bot', type: 'robot' },
            ],
            dialogs: [
              { from: 'user', say: 'Yabadoo' },
              { from: 'bot', say: 'hello' },
            ],
          },
        ],
      },
    ],
  };
  const testsetC = {
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
            dialogs: [
              { from: 'user', say: 'hello' },
              { from: 'bot', say: 'hello' },
            ],
            next: ['story2', 'story3'],
          },
          {
            name: 'story2',
            subStory: true,
            actors: [
              { name: 'user', type: 'human' },
              { name: 'bot', type: 'robot' },
            ],
            dialogs: [
              { from: 'user', say: 'hello' },
              { from: 'bot', say: 'hello' },
            ],
          },
          {
            name: 'story3',
            subStory: true,
            disabled: true,
            actors: [
              { name: 'user', type: 'human' },
              { name: 'bot', type: 'robot' },
            ],
            dialogs: [
              { from: 'user', say: 'hello' },
              { from: 'bot', say: 'hello' },
            ],
            next: ['story4'],
          },
          {
            name: 'story4',
            subStory: true,
            actors: [
              { name: 'user', type: 'human' },
              { name: 'bot', type: 'robot' },
            ],
            dialogs: [
              { from: 'user', say: 'hello' },
              { from: 'bot', say: 'hello' },
            ],
          },
        ],
      },
    ],
  };
  const dataset = {
    name: 'bot',
    dataset: {
      intents: [
        {
          name: 'i1',
          input: [{ text: 'hello' }],
          output: [{ text: 'hello' }],
        },
      ],
    },
  };
  it('simple test', async () => {
    aiceUtils.setAIceClass(AICEClass);
    const agentsManager = aiceUtils.getAgentsManager();
    await agentsManager.train(dataset);
    const response = await aiceUtils.test('bot', testset);
    expect(response.sc1.story1.result).to.be.equal('ok');
    expect(response.sc1.story1.count).to.be.equal(2);
  });
  it('test using sc1 story1', async () => {
    aiceUtils.setAIceClass(AICEClass);
    const agentsManager = aiceUtils.getAgentsManager();
    await agentsManager.train(dataset);
    const response = await aiceUtils.test('bot', testsetB, 'scA', 'storyA2');
    expect(response.scA.storyA2.result).to.be.equal('ok');
    expect(response.scA.storyA2.count).to.be.equal(2);
  });
  it('substory test', async () => {
    aiceUtils.setAIceClass(AICEClass);
    const agentsManager = aiceUtils.getAgentsManager();
    await agentsManager.train(dataset);
    const response = await aiceUtils.test('bot', testsetC);
    expect(response.sc1.story1.result).to.be.equal('ok');
    expect(response.sc1.story1.count).to.be.equal(2);
    expect(response.sc1['story1 => story2'].result).to.be.equal('ok');
    expect(response.sc1['story1 => story2'].count).to.be.equal(4);
    expect(response.sc1['story1 => story3']).to.be.equal(undefined);
    expect(response.sc1['story1 => story3 => story4'].result).to.be.equal('ok');
    expect(response.sc1['story1 => story3 => story4'].count).to.be.equal(6);
  });
});

describe('errors test', () => {
  it('No agent', async () => {
    try {
      await aiceUtils.test('dummy', {});
    } catch (error) {
      expect(error.message).to.be.equal("Can't find an agent for this test");
    }
  });
  it('Faulty user', async () => {
    const testsetC = {
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
              dialogs: [
                { from: 'faulty', say: 'hello' },
                { from: 'bot', say: 'hello' },
              ],
            },
          ],
        },
      ],
    };
    try {
      await aiceUtils.test('bot', testsetC);
    } catch (error) {
      expect(error.message).to.be.equal('Not valid user from "faulty"');
    }
  });
  it('Not matching', async () => {
    const testsetC = {
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
              dialogs: [
                { from: 'user', say: 'hello' },
                { from: 'bot', say: 'Dooh' },
              ],
            },
          ],
        },
      ],
    };
    const response = await aiceUtils.test('bot', testsetC);
    expect(response.sc1.story1.result).to.be.equal('Error : Not matching "Dooh" "hello"');
    expect(response.sc1.story1.count).to.be.equal(1);
  });
  it('Unexpected flow', async () => {
    const testsetC = {
      name: 'test',
      scenarios: [
        {
          name: 'sc1',
          stories: [
            {
              name: 'story1',
              actors: [
                { name: 'user', type: 'dog' },
                { name: 'bot', type: 'robot' },
              ],
              dialogs: [
                { from: 'user', say: 'hello' },
                { from: 'user', say: 'Dooh' },
              ],
            },
          ],
        },
      ],
    };
    const response = await aiceUtils.test('bot', testsetC);
    expect(response.sc1.story1.result).to.be.equal('Error : Unexpected flow "hello"');
    expect(response.sc1.story1.count).to.be.equal(0);
  });
  it("Can't find subStory", async () => {
    const testsetC = {
      name: 'test',
      scenarios: [
        {
          name: 'sc1',
          stories: [
            {
              name: 'story1',
              actors: [
                { name: 'user', type: 'dog' },
                { name: 'bot', type: 'robot' },
              ],
              dialogs: [
                { from: 'user', say: 'hello' },
                { from: 'user', say: 'Dooh' },
              ],
              next: ['substoryA'],
            },
          ],
        },
      ],
    };
    try {
      await aiceUtils.test('bot', testsetC);
    } catch (error) {
      expect(error.message).to.be.equal("Can't find this substory : substoryA");
    }
  });
});
