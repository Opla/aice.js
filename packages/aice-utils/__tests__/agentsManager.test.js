/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import aiceUtils from '../src';

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
      return { score: 0, answer: utterance, context: {} };
    }
    return { score: 0.75, answer: utterance, context: {} };
  }
}

describe('AgentsManager', () => {
  it('getAgentManager', async () => {
    const agentsManager = aiceUtils.getAgentsManager();
    expect(agentsManager).to.be.a('object');
  });
  it('createAgent', async () => {
    const agentsManager = aiceUtils.getAgentsManager();
    const agent = agentsManager.createAgent({ name: 'bot', intents: [] });
    expect(agent).to.be.a('object');
  });
  it('getAgent', async () => {
    const agentsManager = aiceUtils.getAgentsManager();
    const agent = agentsManager.createAgent({ name: 'bot' });
    const agentB = agentsManager.getAgent('bot');
    expect(agent.name).to.equal(agentB.name);
  });
  it('dummy getAgent', async () => {
    const agentsManager = aiceUtils.getAgentsManager();
    const agentB = agentsManager.getAgent('dummy');
    expect(agentB).to.equal(null);
  });
  it('saveAgentContext', async () => {
    const agentsManager = aiceUtils.getAgentsManager();
    const agent = agentsManager.createAgent({ name: 'bot' });
    agentsManager.saveAgentContext('bot', 'conversation', { name: 'value' });
    expect(agent.conversations.conversation).to.eql({ name: 'value' });
  });
  it('saveAgentContext empty', async () => {
    const agentsManager = aiceUtils.getAgentsManager();
    agentsManager.reset();
    const agent = agentsManager.createAgent({ name: 'bot' });
    agentsManager.saveAgentContext('bot', 'conversation');
    expect(agent.conversations.conversation).to.eql(undefined);
    agentsManager.saveAgentContext('dummy', 'conversation');
  });
  it('setContext without agent', async () => {
    const agentsManager = aiceUtils.getAgentsManager();
    agentsManager.reset();
    try {
      await agentsManager.setContext('bot', 'conversation');
    } catch (error) {
      expect(error.message).to.be.equal('Unknown agent with this name bot');
    }
  });
  it('getContext without agent', async () => {
    const agentsManager = aiceUtils.getAgentsManager();
    agentsManager.reset();
    try {
      await agentsManager.getContext('bot', 'conversation');
    } catch (error) {
      expect(error.message).to.be.equal('Unknown agent with this name bot');
    }
  });
  it('resetAgent', async () => {
    const agentsManager = aiceUtils.getAgentsManager();
    const agent = agentsManager.createAgent({ name: 'bot' });
    agentsManager.saveAgentContext('bot', 'conversation', { name: 'value' });
    agentsManager.resetAgent('bot');
    expect(agent.conversations).to.eql({});
    agentsManager.resetAgent('dummy');
  });
  it('removeAgent', async () => {
    const agentsManager = aiceUtils.getAgentsManager();
    agentsManager.createAgent({ name: 'bot' });
    agentsManager.removeAgent('bot');
    const agentB = agentsManager.getAgent('bot');
    expect(agentB).to.equal(null);
    agentsManager.removeAgent('dummy');
  });
  it('train wihout AIce engine', async () => {
    const agentsManager = aiceUtils.getAgentsManager();
    try {
      await agentsManager.train({ dataset: { name: 'bot', intents: [] } });
    } catch (error) {
      expect(error.message).to.be.equal("Can't train this agent without an engine");
    }
  });
  it('evaluate wihout AIce engine', async () => {
    const agentsManager = aiceUtils.getAgentsManager();
    agentsManager.createAgent({ name: 'bot' });
    try {
      await agentsManager.evaluate('bot');
    } catch (error) {
      expect(error.message).to.be.equal("Can't evaluate this utterance without an engine");
    }
  });
  it('createAgent with AIce', async () => {
    aiceUtils.setAIceClass(AICEClass);
    const agentsManager = aiceUtils.getAgentsManager();
    const agent = agentsManager.createAgent({ dataset: { name: 'bot' } });
    expect(agent).to.be.a('object');
  });
  it('train without datasets', async () => {
    aiceUtils.setAIceClass(AICEClass);
    const agentsManager = aiceUtils.getAgentsManager();
    try {
      await agentsManager.train({ name: 'bot' });
    } catch (error) {
      expect(error.message).to.be.equal('No valid datasets');
    }
  });
  it('evaluate without training', async () => {
    aiceUtils.setAIceClass(AICEClass);
    const agentsManager = aiceUtils.getAgentsManager();
    try {
      await agentsManager.evaluate('bot');
    } catch (error) {
      expect(error.message).to.be.equal('Not trained');
    }
  });
  it('evaluate without agent', async () => {
    aiceUtils.setAIceClass(AICEClass);
    const agentsManager = aiceUtils.getAgentsManager();
    agentsManager.reset();
    try {
      await agentsManager.evaluate('bot');
    } catch (error) {
      expect(error.message).to.be.equal('Unknown agent with this name bot');
    }
  });
  it('train empty datasets', async () => {
    aiceUtils.setAIceClass(AICEClass);
    const agentsManager = aiceUtils.getAgentsManager();
    await agentsManager.train({ name: 'bot', dataset: { intents: [] } });
    expect(agentsManager.agents.bot.engine.isTrained).to.be.equal(true);
  });
  it('train simple datasets', async () => {
    aiceUtils.setAIceClass(AICEClass);
    const agentsManager = aiceUtils.getAgentsManager();
    await agentsManager.train({
      name: 'bot',
      dataset: {
        intents: [
          {
            name: 'i1',
            input: [{ text: 'hello' }],
            output: [
              { text: 'hello' },
              {
                type: 'condition',
                children: [
                  { name: 'name', value: 'value' },
                  { name: 'name', value: '"value"' },
                ],
              },
            ],
          },
        ],
      },
    });
    expect(agentsManager.agents.bot.engine.isTrained).to.be.equal(true);
  });
  it('train callable datasets', async () => {
    aiceUtils.setAIceClass(AICEClass);
    const agentsManager = aiceUtils.getAgentsManager();
    await agentsManager.train({
      name: 'bot',
      dataset: {
        intents: [
          {
            name: 'i1',
            input: [{ text: 'hello' }],
            output: [
              { text: 'hello' },
              {
                type: 'condition',
                callable: 'callableA',
                children: [
                  { name: 'name', value: 'value' },
                  { name: 'name', value: '"value"' },
                ],
              },
            ],
          },
        ],
        callables: [{ name: 'callableA', values: {} }],
      },
    });
    expect(agentsManager.agents.bot.engine.isTrained).to.be.equal(true);
  });
  it('train entities datasets', async () => {
    aiceUtils.setAIceClass(AICEClass);
    const agentsManager = aiceUtils.getAgentsManager();
    await agentsManager.train({
      name: 'bot',
      dataset: {
        language: 'fr',
        intents: [],
        entities: [
          { name: 'e', values: '[{"name":"n","tags":"value"}]', extra: {} },
          { name: 'e2', values: '[]', extra: { type: 'enum' } },
        ],
      },
    });
    expect(agentsManager.agents.bot.engine.isTrained).to.be.equal(true);
  });
  it('evaluate simple agent', async () => {
    aiceUtils.setAIceClass(AICEClass);
    const agentsManager = aiceUtils.getAgentsManager();
    agentsManager.reset();
    await agentsManager.train({
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
    });
    let response = await agentsManager.evaluate('bot', 'conversation', 'hello');
    expect(response.message.text).to.be.equal('hello');
    response = await agentsManager.evaluate('bot', 'conversation', 'Yabadoo');
    expect(response.message.text).to.be.equal('No response');
  });
});
