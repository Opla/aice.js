/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable no-console */
import readline from 'readline';
import { AICE } from '../../src';

const threshold = 0.5;

const BOT_NAME = 'jarvich';
const isSilent = process.argv[2] === '--silent';
const ctxt = {};

(async () => {
  const say = console.log;
  say('[training] start');
  let start = +Date.now();
  const nlp = new AICE();
  // Fallback
  nlp.addInput('fr', 'agent.fallback', '*');

  nlp.addOutput('fr', 'agent.fallback', 'Je ne comprends pas.', 'fr');
  nlp.addOutput('fr', 'agent.fallback', 'Je ne sais pas quoi vous répondre.', 'fr');
  nlp.addOutput('fr', 'agent.fallback', "J'essaie' de m'améliorer mais la je bloque...", 'fr');
  nlp.addOutput('fr', 'agent.fallback', 'Je ne comprends pas vraiment pas.', 'fr');

  nlp.addInput('fr', 'agent.presentation', 'Bonjour{{^}}');
  nlp.addInput('fr', 'agent.presentation', 'Coucou{{^}}');
  nlp.addInput('fr', 'agent.presentation', 'Salut{{^}}');
  nlp.addInput('fr', 'agent.presentation', 'Hello{{^}}');

  nlp.addOutput('fr', 'agent.presentation', 'Coucou :)', 'fr');

  nlp.addInput('fr', 'agent.askname', '{{^}}je suis {{name=*}}');
  nlp.addInput('fr', 'agent.askname', "{{^}}je m'appelle {{name=*}}");

  nlp.addOutput('fr', 'agent.askname', 'Hello {{name}}', 'fr');

  nlp.addInput('fr', 'agent.bye', '{{^}}bye{{^}}');
  nlp.addInput('fr', 'agent.bye', '{{^}}a la prochaine{{^}}');
  nlp.addInput('fr', 'agent.bye', '{{^}}a plus{{^}}');
  nlp.addInput('fr', 'agent.bye', '{{^}}bonne journée{{^}}');

  nlp.addOutput('fr', 'agent.bye', 'A la prochaine!', 'fr');

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
