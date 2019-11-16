/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/* istanbul ignore file */
import Agent from './models/Agent';

export default class AgentsManager {
  constructor(utils, opts = {}) {
    this.utils = utils;
    this.agents = {};
    this.opts = opts;
  }

  createAgent(dataset, name, opts = {}) {
    const n = name || dataset.name;
    const agent = new Agent({ ...opts, name: n, dataset });
    const engine = this.utils.createAIceInstance(opts);
    this.agents[agent.name] = { agent, engine, dataset };
    return agent;
  }

  getAgent(name) {
    return this.agents[name].agent;
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

  async train(dataset, name, opts) {
    const n = name || dataset.name;
    if (!this.agents[n]) {
      this.createAgent(dataset, n, opts);
    }
    const { agent, engine } = this.agents[n];
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
      const language = intent.language || dataset;
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
            this.agent.addOutput('fr', intent.name, conditionOutput.text, undefined, [condition], outputCallable);
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

  async evaluate(name, conversationId, utterance) {
    if (!this.agents[name]) {
      throw new Error(`Unknown agent with this name :${name}`);
    }
    const { agent, engine } = this.agents[name];
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
