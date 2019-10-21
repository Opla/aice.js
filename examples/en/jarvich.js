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
  nlp.addInput('en', 'agent.fallback', '*');

  nlp.addOutput('en', 'agent.fallback', "I don't get it.", 'en');
  nlp.addOutput('en', 'agent.fallback', "I don't know what to say.", 'en');
  nlp.addOutput('en', 'agent.fallback', "I'm trying to be better, but for now I'm freeze-out..", 'en');
  nlp.addOutput('en', 'agent.fallback', 'Sorry, I don’t understand.', 'en');

  nlp.addInput('en', 'agent.presentation', 'Hello{{^}}');
  nlp.addInput('en', 'agent.presentation', 'Hi{{^}}');
  nlp.addInput('en', 'agent.presentation', 'Hey{{^}}');
  nlp.addInput('en', 'agent.presentation', 'Sup{{^}}');
  nlp.addInput('en', 'agent.presentation', "What's up{{^}}");

  nlp.addOutput('en', 'agent.presentation', 'Beep-Bo ! :)', 'en');

  nlp.addInput('en', 'agent.askname', "{{^}}I'm {{name=*}}");
  nlp.addInput('en', 'agent.askname', '{{^}} my name is {{name=*}}');

  nlp.addOutput('en', 'agent.askname', 'Hello {{name}}', 'en');

  nlp.addInput('en', 'agent.bye', '{{^}}bye{{^}}');
  nlp.addInput('en', 'agent.bye', '{{^}}see you{{^}}');
  nlp.addInput('en', 'agent.bye', '{{^}}see ya{{^}}');

  nlp.addOutput('en', 'agent.bye', 'See you next time!', 'en');

  nlp.train();
  let end = +Date.now();
  say('[training] done');
  say(`[training] spent:  ${end - start}ms`);
  say(`[${BOT_NAME}] Say hi !`);
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
      const result = await nlp.evaluate(line, ctxt, 'en');
      end = +Date.now();
      const answer = result.score > threshold && result.answer ? result.answer : 'Error intent not found';
      const extra = !isSilent ? `- spent: ${end - start}ms - extra: ${JSON.stringify(result)}` : '';
      say(`[${BOT_NAME}] - ${answer} ${extra}`);
    }
  });
})();
