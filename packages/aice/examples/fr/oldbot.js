/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable no-console */
import readline from 'readline';
import Loader from '../../src/Loader';
import { EnumEntity } from '../../src/streamTransformers';

const threshold = 0.5;

const BOT_NAME = 'jarvich';
const isSilent = process.argv[2] === '--silent';
const ctxt = {};

const bot = {
  name: 'OplaZap',
  timestamp: '2019-07-19T10:20:57.590Z',
  intents: [
    {
      name: 'hello',
      outputType: 'random',
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
          inputMessage: 'slt',
        },
        {
          inputMessage: 'bjr',
        },
        {
          inputMessage: 'hola',
        },
      ],
      outputs: [
        {
          conditions: [],
          callables: [],
          outputMessage: 'Hello 🤖 <<action="nopizza">>',
        },
        {
          conditions: [],
          callables: [],
          outputMessage: 'Et bienvenue chez OplaZap ! En quoi puis-je vous aider ? <<action="nopizza">>',
        },
      ],
    },
    {
      name: "what'sup",
      outputType: 'random',
      inputs: [
        {
          inputMessage: 'Comment vas-tu',
        },
        {
          inputMessage: 'Ca va ?',
        },
        {
          inputMessage: 'Bien ?',
        },
        {
          inputMessage: 'Comment ça va ?',
        },
      ],
      outputs: [
        {
          conditions: [],
          callables: [],
          outputMessage: 'Tout comme hier et sans doute comme demain.\nJe ne peux me plaindre de ma situation.',
        },
        {
          conditions: [],
          callables: [],
          outputMessage: 'Comment puis-je vous aider ?',
        },
      ],
    },
    {
      name: 'forcecustomerintent',
      outputType: 'random',
      inputs: [
        {
          inputMessage: 'Je ne sais pas',
        },
        {
          inputMessage: 'je sais pas',
        },
        {
          inputMessage: 'dis moi quoi faire',
        },
      ],
      outputs: [
        {
          conditions: [],
          callables: [],
          outputMessage: "Et bien, je suis là pour vous accompagner dans l'achat de nos superbes pizzas !",
        },
      ],
    },
    {
      name: 'orderpizzachoiceplus',
      outputType: 'random',
      inputs: [
        {
          inputMessage: '{{^}}{{pizza=@pizzatype}} {{size=@pizzasize}}{{^}}',
        },
        {
          inputMessage: '{{^}}{{size=@pizzasize}} {{pizza=@pizzatype}}{{^}}',
        },
      ],
      outputs: [
        {
          conditions: [],
          callables: [],
          outputMessage: 'Ok, ça sera donc une {{pizza}} {{size}} en livraison ou à emporter ?',
        },
      ],
    },
    {
      name: 'intentorderpizza',
      outputType: 'random',
      inputs: [
        {
          inputMessage: "J'aimerai commander une pizza.",
        },
        {
          inputMessage: 'Je veux commander une pizza.',
        },
        {
          inputMessage: "Tu peux m'avoir un zap ?",
        },
        {
          inputMessage: 'pizza pizza pizza',
        },
        {
          inputMessage: '{{^}} pizza {{^}}',
        },
      ],
      outputs: [
        {
          conditions: [],
          callables: [],
          outputMessage: 'Je suis à votre écoute. Quelle pizza vous faut-il ?',
        },
      ],
    },
    {
      name: 'fillemail',
      outputType: 'multiple',
      inputs: [
        {
          inputMessage: '{{^}} {{@email}} {{^}}',
        },
      ],
      outputs: [
        {
          conditions: [],
          callables: [],
          outputMessage: 'Merci pour votre email.',
        },
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
    {
      name: 'whyyoufeltbad',
      outputType: 'random',
      inputs: [
        {
          inputMessage: 'Je me sens mal.',
        },
        {
          inputMessage: 'Je {{^}} arrive pas.',
        },
        {
          inputMessage: "Je n'y arrive pas.",
        },
        {
          inputMessage: 'Je ne comprends pas.',
        },
        {
          inputMessage: 'Tu comprends rien.',
        },
        {
          inputMessage: 'Tu es nul.',
        },
        {
          inputMessage: 'nul',
        },
        {
          inputMessage: 'merde',
        },
        {
          inputMessage: 'de la chiasse',
        },
        {
          inputMessage: 'merde en boite',
        },
      ],
      outputs: [
        {
          conditions: [],
          callables: [],
          outputMessage: 'Je suis là pour vous aider. Pourriez-vous être plus précis ?',
        },
      ],
    },
    {
      name: 'orderpizzasummary',
      outputType: 'random',
      inputs: [
        {
          inputMessage: 'Alors cette commande ?',
        },
        {
          inputMessage: "C'est tout bon ?",
        },
        {
          inputMessage: 'Quel est ma commande ?',
        },
      ],
      outputs: [
        {
          conditions: [],
          callables: [],
          outputMessage: 'Je regarde dans notre système.\nVous avez commandé une {{pizza}}.',
        },
      ],
    },
    {
      name: 'orderpizzachoice',
      outputType: 'random',
      inputs: [
        {
          inputMessage: '{{^}}{{pizza=@pizzatype}}{{^}}',
        },
      ],
      outputs: [
        {
          conditions: [],
          callables: [],
          outputMessage: 'Ok, ça sera donc une {{pizza}} en livraison ou à emporter ?',
        },
      ],
    },
    {
      name: 'orderpizzawaydelivery',
      outputType: 'random',
      inputs: [
        {
          inputMessage: '{{^}} {{@way}} {{^}}',
        },
      ],
      outputs: [
        {
          conditions: [],
          callables: [],
          outputMessage:
            'Votre commande est prise en compte. Veuillez me transmettre votre email afin finaliser la commande. <<action="pizzamail">>',
        },
      ],
    },
  ],
};

const SizeEnumEntity = new EnumEntity({
  name: 'pizzasize',
  scope: 'global',
  enumeration: [
    { key: 'petite', values: ['petite', 'small'] },
    { key: 'moyenne', values: ['moyenne', 'medium'] },
    { key: 'grande', values: ['grande', 'large'] },
  ],
});

const TypeEnumEntity = new EnumEntity({
  name: 'pizzatype',
  scope: 'global',
  enumeration: [
    {
      key: 'pizzatype',
      values: ['regina', 'napoletana', 'Marinara', 'Calzone', 'Capricciosa', 'Diavola'],
    },
  ],
});

const TakeAwayEnumEntity = new EnumEntity({
  name: 'way',
  scope: 'global',
  enumeration: [
    {
      key: 'takeaway',
      values: ['emporter'],
    },
    {
      key: 'delivery',
      values: ['livraison'],
    },
  ],
});

(async () => {
  const say = console.log;
  say('[training] start');
  let start = +Date.now();
  const nlp = Loader.fromJSON(bot);
  nlp.addEntity(SizeEnumEntity);
  nlp.addEntity(TypeEnumEntity);
  nlp.addEntity(TakeAwayEnumEntity);

  nlp.train();
  let end = +Date.now();
  say('[training] done');
  say(`[training] spent:  ${end - start}ms`);
  say(`[${BOT_NAME}] Bonjour !`);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });
  rl.on('line', async line => {
    if (line.toLowerCase() === 'quit') {
      rl.close();
      process.exit();
    } else {
      start = +Date.now();
      const result = await nlp.evaluate(line, ctxt);
      end = +Date.now();
      const answer =
        result.score > threshold && result.answer ? result.answer : 'Désolé, je ne comprends pas votre question';
      const extra = !isSilent ? `- spent: ${end - start}ms - extra: ${JSON.stringify(result)}` : '';
      say(`[${BOT_NAME}] - ${answer} ${extra}`);
    }
  });
})();
