/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable no-console */
import fs from 'fs';
import OpenNLXSyntaxAdapter from '../../src/utils/openNLXSyntaxAdapter';

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
    {
      name: "what'sup",
      state: 'enabled',
      input: ['Comment vas-tu', 'Ca va ?', 'Bien ?', 'Comment ça va ?'],
      output: [
        'Tout comme hier et sans doute comme demain.\nJe ne peux me plaindre de ma situation.',
        'Comment puis-je vous aider ?',
      ],
    },
    {
      name: 'forcecustomerintent',
      state: 'enabled',
      input: ['Je ne sais pas', 'je sais pas', 'dis moi quoi faire'],
      output: ["Et bien, je suis là pour vous accompagner dans l'achat de nos superbes pizzas !"],
    },
    {
      name: 'orderpizzachoiceplus',
      state: 'disabled',
      input: ['*{{pizza=@pizza_type}} {{size=pizza_size}}', '*{{pizza=@pizza_type}}*{{size=pizza_size}}'],
      output: ['Ok, ça sera donc une {{size}} {{pizza}} en livraison ou à emporter ?'],
    },
    {
      name: 'intentorderpizza',
      state: 'enabled',
      input: [
        "J'aimerai commander une pizza.",
        "Tu peux m'avoir un zap ?",
        'pizza pizza pizza',
        'une pizza',
        'pizza',
        'je veux une pizza',
        'piz',
      ],
      output: ['Je suis à votre écoute. Quelle pizza vous faut-il ?'],
    },
    {
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
    {
      name: 'whyyoufeltbad',
      state: 'enabled',
      input: [
        'Je me sens mal.',
        "Je n'y arrive pas.",
        'Je ne comprends pas.',
        'Tu comprends rien.',
        'Tu es nul.',
        'nul',
        'merde',
        'de la chiasse',
        'merde en boite',
      ],
      output: ['Je suis là pour vous aider. Pourriez-vous être plus précis ?'],
    },
    {
      name: 'orderpizzasummary',
      state: 'enabled',
      input: ['Alors cette commande ?', "C'est tout bon ?", 'Quel est ma commande ?'],
      output: ['Je regarde dans notre système.\nVous avez commandé une {{pizza}}.'],
    },
    {
      name: 'orderpizzachoice',
      state: 'enabled',
      input: ['*{{pizza=@pizza_type}}', '*{{pizza=@pizza_type}}*', '{{pizza=@pizza_type}}', '{{pizza=@pizza_type}}*'],
      output: ['Ok, ça sera donc une {{pizza}} en livraison ou à emporter ?'],
    },
    {
      name: 'orderpizzawaydelivery',
      state: 'enabled',
      input: ['*@wayofdelivery', '*@wayofdelivery*'],
      output: [
        'Votre commande est prise en compte. Veuillez me transmettre votre email afin finaliser la commande. <<action=pizzamail>>',
      ],
    },
  ],
  entities: [
    {
      name: 'pizza_size',
      description: 'Les différentes tailles de pizzas disponible chez OplaZap.',
      values: [
        {
          name: 'petite',
          tags: ['petite', 'small'],
        },
        {
          name: 'moyenne',
          tags: ['moyenne', 'medium', 'classique'],
        },
        {
          name: 'large',
          tags: ['grande', 'large'],
        },
      ],
      extra: {
        type: 'complex',
      },
    },
    {
      name: 'pizza_type',
      description: 'Les différentes pizzas disponible chez OplaZap.',
      values: ['Margherita', 'regina', 'napoletana', 'Marinara', 'Calzone', 'Capricciosa', 'Diavola'],
      extra: {
        type: 'enum',
      },
    },
    {
      name: 'wayofdelivery',
      description: "Chez OplaZap, c'est en livraison ou à emporter",
      values: [
        {
          name: 'takeaway',
          tags: ['emporter'],
        },
        {
          name: 'delivery',
          tags: ['livraison'],
        },
      ],
      extra: {
        type: 'complex',
      },
    },
  ],
  variables: [],
};

const json = JSON.stringify(OpenNLXSyntaxAdapter(bot));

fs.writeFile('oplaWebSite.json', json, 'utf8', err => {
  if (err) throw err;
  console.log('complete');
});
