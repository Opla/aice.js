/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import chai from 'chai';
import { openNLXSyntaxAdapter } from '../../src/utils';

const { expect } = chai;

const { parseAdaptOpenNLXSyntax, parseAdaptOpenNLXSyntaxV3 } = openNLXSyntaxAdapter;

describe('parseAdaptOpenNLXSyntax', () => {
  it('V2 parseAdaptOpenNLXSyntax', () => {
    const bot = {
      name: 'OplaZap',
      description: 'Super bot de démonstration des fonctionnalités de la v0.3 après le sprint 1 (OplaZap)',
      avatar: '/images/bots/robot-62.svg',
      locale: 'en-en',
      language: 'fr',
      timezone: 'Europe/Paris',
      email: 'oplazap@opla.ai',
      needTrain: false,
      intents: [
        {
          name: 'hello',
          state: 'enabled',
          input: ['Hello', 'Salut', 'Bonjour', 'Coucou', 'Helo', 'salt', 'salut', 'sl', 'slt', 'bjr', 'brj', 'cc'],
          output: ['Hello 🤖 <<action=nopizza>>', 'Et bienvenue chez OplaZap ! En quoi puis-je vous aider ?'],
        },
      ],
    };
    const newBot = parseAdaptOpenNLXSyntax(bot);
    expect(newBot.name).to.equal('OplaZap');
    expect(newBot.intents).to.eql([
      {
        id: undefined,
        name: 'hello',
        outputType: 'multiple',
        previous: [],
        topic: '*',
        inputs: [
          {
            inputMessage: 'Hello',
          },
          {
            inputMessage: 'Salut',
          },
          {
            inputMessage: 'Bonjour',
          },
          {
            inputMessage: 'Coucou',
          },
          {
            inputMessage: 'Helo',
          },
          {
            inputMessage: 'salt',
          },
          {
            inputMessage: 'salut',
          },
          {
            inputMessage: 'sl',
          },
          {
            inputMessage: 'slt',
          },
          {
            inputMessage: 'bjr',
          },
          {
            inputMessage: 'brj',
          },
          {
            inputMessage: 'cc',
          },
        ],
        outputs: [
          {
            conditions: [],
            callables: [],
            outputMessage: 'Hello 🤖 <<action=nopizza>>',
          },
          {
            conditions: [],
            callables: [],
            outputMessage: 'Et bienvenue chez OplaZap ! En quoi puis-je vous aider ?',
          },
        ],
      },
    ]);
  });

  it('V3 parseAdaptOpenNLXSyntax', () => {
    const bot = {
      name: 'OplaZap',
      description: 'Super bot de démonstration des fonctionnalités de la v0.3 après le sprint 1 (OplaZap)',
      avatar: '/images/bots/robot-62.svg',
      locale: 'en-en',
      language: 'fr',
      timezone: 'Europe/Paris',
      email: 'oplazap@opla.ai',
      needTrain: false,
      intents: [
        {
          name: 'hello',
          state: 'enabled',
          input: ['Hello', 'Salut', 'Bonjour', 'Coucou', 'Helo', 'salt', 'salut', 'sl', 'slt', 'bjr', 'brj', 'cc'],
          output: ['Hello 🤖 <<action=nopizza>>', 'Et bienvenue chez OplaZap ! En quoi puis-je vous aider ?'],
        },
      ],
    };
    const newBot = parseAdaptOpenNLXSyntaxV3(bot);
    expect(newBot.name).to.equal('OplaZap');
    expect(newBot.intents).to.eql([
      {
        id: undefined,
        name: 'hello',
        outputType: 'multiple',
        previous: [],
        topic: '*',
        inputs: [
          {
            inputMessage: 'Hello',
          },
          {
            inputMessage: 'Salut',
          },
          {
            inputMessage: 'Bonjour',
          },
          {
            inputMessage: 'Coucou',
          },
          {
            inputMessage: 'Helo',
          },
          {
            inputMessage: 'salt',
          },
          {
            inputMessage: 'salut',
          },
          {
            inputMessage: 'sl',
          },
          {
            inputMessage: 'slt',
          },
          {
            inputMessage: 'bjr',
          },
          {
            inputMessage: 'brj',
          },
          {
            inputMessage: 'cc',
          },
        ],
        outputs: [
          {
            conditions: [],
            callables: [],
            outputMessage: 'Hello 🤖 <<action=nopizza>>',
          },
          {
            conditions: [],
            callables: [],
            outputMessage: 'Et bienvenue chez OplaZap ! En quoi puis-je vous aider ?',
          },
        ],
      },
    ]);
  });

  it('parseAdaptOpenNLXSyntax conditions', () => {
    const bot = {
      name: 'OplaZap',
      description: 'Super bot de démonstration des fonctionnalités de la v0.3 après le sprint 1 (OplaZap)',
      locale: 'en-en',
      language: 'fr',
      timezone: 'Europe/Paris',
      intents: [
        {
          id: undefined,
          name: 'fillemail',
          state: 'enabled',
          input: ['@email', '*@email*', '*@email'],
          output: [
            'Merci pour votre email.',
            {
              type: 'condition',
              children: [
                {
                  name: 'action',
                  type: 'item',
                  value: 'pizzamail',
                  text: 'Je vous envoi une confirmation.',
                },
              ],
            },
            {
              type: 'condition',
              children: [
                {
                  name: 'action',
                  type: 'item',
                  value: 'nopizza',
                  text: 'Que dois-je faire avec ?',
                },
              ],
            },
          ],
        },
      ],
    };
    const newBot = parseAdaptOpenNLXSyntax(bot);
    expect(newBot.name).to.equal('OplaZap');
    expect(newBot.intents).to.eql([
      {
        id: undefined,
        name: 'fillemail',
        outputType: 'multiple',
        previous: [],
        topic: '*',
        inputs: [{ inputMessage: '@email' }, { inputMessage: '*@email*' }, { inputMessage: '*@email' }],
        outputs: [
          { conditions: [], callables: [], outputMessage: 'Merci pour votre email.' },
          {
            conditions: [
              {
                type: 'LeftRightExpression',
                operator: 'eq',
                leftOperand: { type: 'VARIABLE', value: 'action' },
                rightOperand: 'pizzamail',
              },
            ],
            callables: [],
            outputMessage: 'Je vous envoi une confirmation.',
          },
          {
            conditions: [
              {
                type: 'LeftRightExpression',
                operator: 'eq',
                leftOperand: { type: 'VARIABLE', value: 'action' },
                rightOperand: 'nopizza',
              },
            ],
            callables: [],
            outputMessage: 'Que dois-je faire avec ?',
          },
        ],
      },
    ]);
  });

  it('parseAdaptOpenNLXSyntax callable (CODE)', () => {
    const bot = {
      name: 'OplaZap',
      intents: [
        {
          id: undefined,
          name: 'fillemail',
          state: 'enabled',
          input: ['@email'],
          output: ["<<system.sendMail($email, test, `salut c'est {$body} et {$blbl}`)>>"],
        },
      ],
    };
    const newBot = parseAdaptOpenNLXSyntax(bot);
    expect(newBot.name).to.equal('OplaZap');
    const webService = newBot.intents[0].outputs[0].callables[0];
    expect(webService.service).to.equal('system.sendMail');
    expect(webService.parameters[0]).to.equal('{{email}}');
    expect(webService.parameters[1]).to.equal('test');
    expect(webService.parameters[2]).to.equal("salut c'est {{body}} et {{blbl}}");
  });

  it('parseAdaptOpenNLXSyntax callable (OUTPUT)', () => {
    const bot = {
      name: 'OplaZap',
      intents: [
        {
          id: undefined,
          name: 'fillemail',
          state: 'enabled',
          input: ['@email'],
          output: ['{{doSomething($highest, $lowest)}}'],
        },
      ],
    };
    const newBot = parseAdaptOpenNLXSyntax(bot);
    expect(newBot.name).to.equal('OplaZap');
    const output = newBot.intents[0].outputs[0];
    expect(output.outputMessage).to.equal('{{doSomething}}');
    const webService = output.callables[0];
    expect(webService.service).to.equal('doSomething');
    expect(webService.parameters[0]).to.equal('{{highest}}');
    expect(webService.parameters[1]).to.equal('{{lowest}}');
  });
});
