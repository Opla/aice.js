/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import chai from 'chai';
import fetch from 'node-fetch';
import { SimpleOutputRenderer } from '../../src/outputRendering';
import { OutputExpressionTokenizer } from '../../src/streamTransformers';

const { expect } = chai;

describe('SimpleOutputRenderer', () => {
  const tokenizerOutput = new OutputExpressionTokenizer();
  it('Should execute empty intents', async () => {
    const renderer = new SimpleOutputRenderer({});

    const result = await renderer.execute('fr', [], {});
    expect(result).to.equal(undefined);
  });

  it('Should execute answers - lang filtering', async () => {
    const renderer = new SimpleOutputRenderer({
      outputs: [
        {
          intentid: 1,
          answers: [
            { lang: 'fr', tokenizedOutput: tokenizerOutput.tokenize('Ceci est une reponse'), conditions: [] },
            { lang: 'en', tokenizedOutput: tokenizerOutput.tokenize('This is not the good answer'), conditions: [] },
          ],
        },
      ],
    });

    const result = await renderer.execute('fr', [{ intentid: 1, score: 0.99 }], {});
    expect(result.score).to.equal(0.99);
    expect(result.renderResponse).to.equal('Ceci est une reponse');
  });

  it('Should execute answers - lang filtering but no renderable response', async () => {
    const renderer = new SimpleOutputRenderer({
      outputs: [
        {
          intentid: 1,
          answers: [
            {
              lang: 'fr',
              tokenizedOutput: tokenizerOutput.tokenize('Ceci est une reponse'),
              conditions: [{ type: 'UnaryExpression', operator: 'not', LrightOperand: true }],
            },
            { lang: 'en', tokenizedOutput: tokenizerOutput.tokenize('This is not the good answer'), conditions: [] },
          ],
        },
      ],
    });

    const result = await renderer.execute('fr', [{ intentid: 1, score: 0.99 }], {});
    expect(result).to.equal(undefined);
  });

  const goodAnwser = 'This is the good answer';
  const alsoMultiAnwser = 'This is also a good answer in multiple';

  const settings = {
    outputs: [
      {
        intentid: 1,
        answers: [
          {
            lang: 'en',
            tokenizedOutput: tokenizerOutput.tokenize('This is not the good answer'),
            conditions: [{ type: 'UnaryExpression', operator: 'not', LrightOperand: true }],
          },
          { lang: 'en', tokenizedOutput: tokenizerOutput.tokenize(goodAnwser), conditions: [] },
          {
            lang: 'en',
            tokenizedOutput: tokenizerOutput.tokenize(alsoMultiAnwser),
            conditions: [],
          },
        ],
      },
    ],
  };

  it('Should execute answers - output type single', async () => {
    settings.outputs[0].outputType = 'single';
    const renderer = new SimpleOutputRenderer(settings);

    const result = await renderer.execute('en', [{ intentid: 1, score: 0.99 }], {});
    expect(result.score).to.equal(0.99);
    expect(result.renderResponse).to.equal(goodAnwser);
  });

  it('Should execute answers - output type multiple', async () => {
    settings.outputs[0].outputType = 'multiple';
    const renderer = new SimpleOutputRenderer(settings);

    const result = await renderer.execute('en', [{ intentid: 1, score: 0.99 }], {});
    expect(result.score).to.equal(0.99);
    expect(result.renderResponse).to.equal(goodAnwser + alsoMultiAnwser); // TODO NEED TO CHANGE [This is the good answer, This is also a good answer in multiple]
  });

  it('Should execute answers - random', async () => {
    settings.outputs[0].outputType = 'random';
    const renderer = new SimpleOutputRenderer(settings);

    const result = await renderer.execute('en', [{ intentid: 1, score: 0.99 }], {});
    expect(result.score).to.equal(0.99);
    expect([goodAnwser, alsoMultiAnwser]).to.include(result.renderResponse);
  });

  it('Should execute answers - preRenderCallable', async () => {
    const getName = () => ({ name: 'slim shady' });
    const renderer = new SimpleOutputRenderer({
      outputs: [
        {
          intentid: 1,
          answers: [
            {
              lang: 'fr',
              tokenizedOutput: tokenizerOutput.tokenize('Ceci est une reponse {{name}}'),
              callables: [{ func: getName }],
              conditions: [],
            },
            { lang: 'en', tokenizedOutput: tokenizerOutput.tokenize('This is not the good answer'), conditions: [] },
          ],
        },
      ],
    });

    const result = await renderer.execute('fr', [{ intentid: 1, score: 0.99 }], {});
    expect(result.score).to.equal(0.99);
    expect(result.renderResponse).to.include('Ceci est une reponse slim shady');
  });

  it('Should execute answers - preConditionsCallable & preRenderCallable', async () => {
    const preConditionsCallable = () => ({ number: 1 });
    const incrementNumberCallable = context => ({ number: context.number + 1 });
    const renderer = new SimpleOutputRenderer({
      outputs: [
        {
          intentid: 1,
          answers: [
            {
              lang: 'fr',
              tokenizedOutput: tokenizerOutput.tokenize('Ceci est une reponse {{number}}'),
              preCallables: [preConditionsCallable],
              callables: [{ func: incrementNumberCallable }],
              conditions: [
                {
                  type: 'LeftRightExpression',
                  operator: 'eq',
                  leftOperand: { type: 'VARIABLE', value: 'number' },
                  rightOperand: 1,
                },
              ],
            },
            { lang: 'en', tokenizedOutput: tokenizerOutput.tokenize('This is not the good answer'), conditions: [] },
          ],
        },
      ],
    });

    const result = await renderer.execute('fr', [{ intentid: 1, score: 0.99 }], {});
    expect(result.score).to.equal(0.99);
    expect(result.renderResponse).to.include('Ceci est une reponse 2');
  });

  it('Should execute answers - async/await web service call', async () => {
    const preConditionsCallable = async () => {
      const res = await fetch('https://jsonplaceholder.typicode.com/posts/1');
      const jsonRes = await res.json();
      const { body } = jsonRes;
      return { body };
    };
    const renderer = new SimpleOutputRenderer({
      outputs: [
        {
          intentid: 1,
          answers: [
            {
              lang: 'fr',
              tokenizedOutput: tokenizerOutput.tokenize('{{body}}'),
              preCallables: [{ func: preConditionsCallable }],
            },
          ],
        },
      ],
    });

    const result = await renderer.execute('fr', [{ intentid: 1, score: 0.99 }], {});
    expect(result.score).to.equal(0.99);
    expect(result.renderResponse).to.equal(
      'quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto',
    );
  });

  it('Should execute answers - async/await callableManager', async () => {
    const callablesManager = async callable => {
      const body = callable.name;
      return { body };
    };
    const renderer = new SimpleOutputRenderer({
      settings: {
        callablesManager,
      },
      outputs: [
        {
          intentid: 1,
          answers: [
            {
              lang: 'fr',
              tokenizedOutput: tokenizerOutput.tokenize('{{body}}'),
              preCallables: [{ name: 'function' }],
            },
          ],
        },
      ],
    });

    const result = await renderer.execute('fr', [{ intentid: 1, score: 0.99 }], {});
    expect(result.score).to.equal(0.99);
    expect(result.renderResponse).to.equal('function');
  });

  it('Should execute answers - faulty callableManager', async () => {
    const renderer = new SimpleOutputRenderer({
      outputs: [
        {
          intentid: 1,
          answers: [
            {
              lang: 'fr',
              tokenizedOutput: tokenizerOutput.tokenize('{{body}}'),
              preCallables: [{ name: 'function' }],
            },
          ],
        },
      ],
    });

    return renderer.execute('fr', [{ intentid: 1, score: 0.99 }], {}).catch(err => {
      expect(err).to.have.property('message', 'AICE executeCallable - no callablesManager defined');
    });
  });

  it('Should execute answers - return context', async () => {
    const renderer = new SimpleOutputRenderer({
      outputs: [
        {
          intentid: 1,
          answers: [{ lang: 'fr', tokenizedOutput: tokenizerOutput.tokenize('Code<<code="state">>') }],
        },
      ],
    });
    const result = await renderer.execute('fr', [{ intentid: 1, score: 0.99 }], {});
    expect(result.context.code).to.equal('state');
    expect(result.renderResponse).to.equal('Code');
  });
  it('Should execute answers - intent reference', async () => {
    const renderer = new SimpleOutputRenderer({
      outputs: [
        {
          intentid: 1,
          answers: [{ lang: 'fr', tokenizedOutput: tokenizerOutput.tokenize('{{code="state"}}') }],
        },
        {
          intentid: 2,
          answers: [
            {
              lang: 'fr',
              callables: [{ name: 1, isReference: true, value: 'reference1' }],
              tokenizedOutput: tokenizerOutput.tokenize('Code {{reference1}}'),
            },
          ],
        },
      ],
    });
    let result = await renderer.execute('fr', [{ intentid: 1, score: 0.99 }], {});
    expect(result.context.code).to.equal('state');
    result = await renderer.execute('fr', [{ intentid: 2, score: 0.99 }], {});
    expect(result.renderResponse).to.equal('Code state');
  });
});
