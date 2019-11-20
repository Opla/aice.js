/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Agent from './models/Agent';

export default class AgentsManager {
  constructor(utils, opts) {
    this.utils = utils;
    this.agents = {};
    this.opts = opts;
  }

  reset() {
    this.agents = {};
  }

  createAgent({ name, avatar, dataset: d, settings, ...opts }) {
    const n = name || d.name;
    const agent = new Agent({ ...opts, name: n, avatar });
    let engine;
    try {
      engine = this.utils.createAIceInstance(settings);
    } catch (e) {
      //
    }
    let dataset = d;
    if (!dataset) {
      if (opts.intents) {
        dataset = { intents: opts.intents, callables: opts.callables, entities: opts.entities };
      }
    }
    this.agents[agent.name] = { agent, engine, dataset };
    return agent;
  }

  getAgent(name) {
    return this.agents[name] ? this.agents[name].agent : null;
  }

  saveAgentContext(name, conversationId, context) {
    if (this.agents[name]) {
      this.agents[name].agent.saveContext(conversationId, context);
    }
  }

  resetAgent(name) {
    if (this.agents[name]) {
      this.agents[name].agent.resetConversations();
    }
  }

  removeAgent(name) {
    if (this.agents[name]) {
      delete this.agents[name];
    }
  }

  // eslint-disable-next-line class-methods-use-this
  parseValue(match) {
    const isText = match.includes("'") || match.includes('"');
    const value = match.trim();
    return isText ? value.slice(1, -1) : { type: 'VARIABLE', value };
  }

  async train({ name, dataset: ds = {}, ...opts }) {
    const n = name || ds.name;
    if (!this.agents[n]) {
      this.createAgent({ ...opts, name: n, dataset: ds });
    }
    const dataset = ds && ds.intents ? ds : this.agents[n].dataset;
    if (!dataset || !Array.isArray(dataset.intents)) {
      throw new Error('No valid datasets');
    }
    const { agent, engine } = this.agents[n];
    if (!engine) {
      throw new Error("Can't train this agent without an engine");
    }
    engine.clear();
    agent.reset();
    this.agents[n].callables = {};
    const { intents, entities, callables } = dataset;
    if (callables) {
      callables.forEach(callable => {
        const { name: cn } = callable;
        // TODO instanciate callable function
        this.agents[n].callables[cn] = callable;
      });
    }
    intents.forEach(intent => {
      const language = intent.language || dataset.language || engine.settings.defaultLanguage;
      intent.input.forEach(input => {
        engine.addInput(language, intent.name, input.text, [], intent.topic);
      });
      intent.output.forEach(output => {
        const outputCallable = this.agents[n].callables[output.callable];
        if (output.type !== 'condition') {
          engine.addOutput(language, intent.name, output.text, undefined, undefined, outputCallable);
        } else {
          output.children.forEach(conditionOutput => {
            const condition = {
              type: 'LeftRightExpression',
              operator: 'eq',
              leftOperand: this.parseValue(conditionOutput.name),
              rightOperand: this.parseValue(conditionOutput.value),
            };
            engine.addOutput('fr', intent.name, conditionOutput.text, undefined, [condition], outputCallable);
          });
        }
      });
    });
    if (entities) {
      entities.forEach(e => {
        let enumeration = null;
        const values = JSON.parse(e.values);
        if (e.extra.type === 'enum') {
          enumeration = [{ key: e.name, values }];
        } else {
          enumeration = values.map(v => ({
            key: v.name,
            values: v.tags,
          }));
        }
        agent.addEntity({
          name: e.name,
          scope: 'global',
          enumeration,
        });
      });
    }
    await engine.train(dataset);
  }

  async setContext(name, conversationId, context = {}) {
    if (!this.agents[name]) {
      throw new Error(`Unknown agent with this name ${name}`);
    }
    return this.agents[name].agent.saveContext(conversationId, context);
  }

  async getContext(name, conversationId) {
    if (!this.agents[name]) {
      throw new Error(`Unknown agent with this name ${name}`);
    }
    return this.agents[name].agent.getContext(conversationId);
  }

  async evaluate(name, conversationId, utterance) {
    if (!this.agents[name]) {
      throw new Error(`Unknown agent with this name ${name}`);
    }
    const { agent, engine } = this.agents[name];
    if (!engine) {
      throw new Error("Can't evaluate this utterance without an engine");
    }
    const currentContext = await agent.getContext(conversationId);
    const response = await engine.evaluate(utterance, currentContext || {});
    await agent.saveContext(conversationId, response.context);
    return {
      message: {
        text: response.score > 0 ? response.answer : 'No response',
      },
      debug: { intent: { name: response.intent } },
    };
  }
}
