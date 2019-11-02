<div align="justify">
<div align="center">
  <a href="https://opla.ai" target="_blank">
    <img src="https://raw.githubusercontent.com/Opla/opla/master/front/src/public/images/opla-avatar.png" alt="Opla" width="64">
  </a>
</div>
<h1 align="center">
  AIce.js
</h1>

<div align="center">

[![codecov](https://codecov.io/gh/Opla/aice.js/branch/master/graph/badge.svg)](https://codecov.io/gh/Opla/aice.js)
[![CircleCI](https://img.shields.io/circleci/build/github/Opla/aice.js?logo=circleci)](https://circleci.com/gh/Opla/aice.js/tree/master)
[![Contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/Opla/aice.js/issues)
[![Commits](https://img.shields.io/github/last-commit/opla/aice.js.svg)](https://img.shields.io/github/last-commit/opla/aice.js.svg)
[![npm](https://img.shields.io/npm/v/aice?color=9cf)](https://www.npmjs.com/package/aice)

</div>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#how-to-install">How To install</a> •
  <a href="#usages-example">Usages example</a> •
  <a href="#nlx-syntax">NLX syntax</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#more">More</a>
</p>

Artificial Intelligence Conversational Engine (AICE)

AIce is an opensource Javascript natural language processing (NLP) and conversational framework without any dependencies.

## Vision
We want to build a sustainable solution able to guess several languages, to understand the intention of the user, to give the best response in order to satisfy the user's intent. Also, we hope for providing both text-based conversational interface as well as form-based conversational interface. We desire to give a flexible NLP API to better fit various use case.

## Features
 - NLX syntax based
 - **Streams transformers** Tokens based architecture, so it can handle input streams
 - **Intents resolvers** For the moment, we only have kind of ExactScoring methods to detect the intent match.
 - **Outputs renderers** For the moment, we only have SimpleRenderer that handle callables, conditions and the rendering/generation of the answer.
 - Many comparators with a varieties of strategies (hamming, levenshtein, damerau-levenshtein...)
 - **Named Entity Recognition**, accepting similar strings for Enum Entities.
 - Rule based Named Entities. _Conception WIP_
 - And more !

## How to install
It can be installed directly from NPM to be integrated in node.js application.
```bash
npm install aice
```

## Usages example

**How to import**
```js
import { AICE } from 'aice';
```

**Simple use case**
```js
const nlp = new AICE();

nlp.addInput('en', 'hello', 'Hello');

nlp.addOutput('en', 'hello', "Hello. What's up ?");

await nlp.train();

// now you can use evaluate to get the answer
const response = await nlp.evaluate('Hello', {}, 'en');
```

```
{
  "answer":"Hello. What's up ?",
  "score":1,
  "intent":"hello",
  "context":{}
}
```

**Conditions use case**
```js
const nlp = new AICE();

nlp.addInput('en', 'test.conditions', 'Test conditions');

nlp.addOutput(
  'en',
  'test.conditions',
  "This is a test of the conditions",
  undefined,
  [{
      type: 'LeftRightExpression',
      operator: 'eq',
      leftOperand: { type: 'VARIABLE', value: 'state' },
      rightOperand: 'STATE_0',
   }]);

await nlp.train();

// now you can use evaluate to get the answer
const response = await nlp.evaluate('Test condition', { state: 'STATE_0'}, 'en');
```

```
{
  "answer":"This is a test of the conditions",
  "score":1,
  "intent":"test.conditions",
  "context":{"state":"STATE_0"}
}
```

**Callable use case**
```js
const nlp = new AICE();

// Add an input to the intent 'match.email'
nlp.addInput('en', 'match.email', '{{userEmail=@email}}');

// Add an output to the intent 'match.email'
nlp.addOutput('en', 'match.email', "Thanks for your email. I'll send you some thing", undefined, undefined,
  async context => {
    const { userEmail } = context;
    const text = 'Example of email body';
    const mail = {
      to: userEmail,
      subject: 'Example of send mail',
      text,
      html: text,
    };
    await emailSender.sendMessage(mail);
    return {};
  });

  await nlp.train();
```

This will send a mail to userEmail catched by the entity @email. In this example the service emailSender as been created using node-mailer.

## NLX syntax
**INPUT**
```
TEXT            I'm a text
INLINE_CODE     {{ }}           // Expression syntax

SET             namevar=@entityName
SET             namevar=*
SET             namevar=^

ANY             *
ANYORNOTHING    ^
ENTITY          @name           // modify currentContext as entityName=@entityName
```

**OUTPUT**
```
INLINE_CODE     {{ }}           // rendered
CODE            << >>           // not rendered

SET             namevar='value'
SET             namevar=varName
GET             namevar

```

## Contributing
Please, see the [CONTRIBUTING.md](CONTRIBUTING.md) file.

### Contributor Code of Conduct
Please note that this project is released with a [Contributor Code of
Conduct](http://contributor-covenant.org/). By participating in this project you
agree to abide by its terms. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) file.

## More
This project is developed by Opla.

It is still a WIP, but you could contribute, test, report bugs.

How to pronounce it ?
"A-Ice" /eɪ/ /ʌɪs/
</div>
