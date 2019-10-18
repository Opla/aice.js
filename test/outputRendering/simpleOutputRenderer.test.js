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
  it('Should process empty intents', async () => {
    const renderer = new SimpleOutputRenderer({});

    const result = await renderer.process('fr', [], {});
    expect(result).to.equal(undefined);
  });

  it('Should process answers - lang filtering', async () => {
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

    const result = await renderer.process('fr', [{ intentid: 1, score: 0.99 }], {});
    expect(result.score).to.equal(0.99);
    expect(result.renderResponse).to.equal('Ceci est une reponse');
  });

  it('Should process answers - lang filtering but no renderable response', async () => {
    const renderer = new SimpleOutputRenderer({
      outputs: [
        {
          intentid: 1,
          answers: [
            {
              lang: 'fr',
              tokenizedOutput: tokenizerOutput.tokenize('Ceci est une reponse'),
              conditions: [{ type: 'UnaryExpression', operande: 'not', LRvalue: true }],
            },
            { lang: 'en', tokenizedOutput: tokenizerOutput.tokenize('This is not the good answer'), conditions: [] },
          ],
        },
      ],
    });

    const result = await renderer.process('fr', [{ intentid: 1, score: 0.99 }], {});
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
            conditions: [{ type: 'UnaryExpression', operande: 'not', LRvalue: true }],
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

  it('Should process answers - output type single', async () => {
    settings.outputs[0].outputType = 'single';
    const renderer = new SimpleOutputRenderer(settings);

    const result = await renderer.process('en', [{ intentid: 1, score: 0.99 }], {});
    expect(result.score).to.equal(0.99);
    expect(result.renderResponse).to.equal(goodAnwser);
  });

  it('Should process answers - output type multiple', async () => {
    settings.outputs[0].outputType = 'multiple';
    const renderer = new SimpleOutputRenderer(settings);

    const result = await renderer.process('en', [{ intentid: 1, score: 0.99 }], {});
    expect(result.score).to.equal(0.99);
    expect(result.renderResponse).to.equal(goodAnwser + alsoMultiAnwser); // TODO NEED TO CHANGE [This is the good answer, This is also a good answer in multiple]
  });

  it('Should process answers - random', async () => {
    settings.outputs[0].outputType = 'random';
    const renderer = new SimpleOutputRenderer(settings);

    const result = await renderer.process('en', [{ intentid: 1, score: 0.99 }], {});
    expect(result.score).to.equal(0.99);
    expect([goodAnwser, alsoMultiAnwser]).to.include(result.renderResponse);
  });

  it('Should process answers - preRenderCallable', async () => {
    const getName = () => ({ name: 'slim shady' });
    const renderer = new SimpleOutputRenderer({
      outputs: [
        {
          intentid: 1,
          answers: [
            {
              lang: 'fr',
              tokenizedOutput: tokenizerOutput.tokenize('Ceci est une reponse {{name}}'),
              preRenderCallable: getName,
              conditions: [],
            },
            { lang: 'en', tokenizedOutput: tokenizerOutput.tokenize('This is not the good answer'), conditions: [] },
          ],
        },
      ],
    });

    const result = await renderer.process('fr', [{ intentid: 1, score: 0.99 }], {});
    expect(result.score).to.equal(0.99);
    expect(result.renderResponse).to.include('Ceci est une reponse slim shady');
  });

  it('Should process answers - preConditionsCallable & preRenderCallable', async () => {
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
              preConditionsCallable,
              preRenderCallable: incrementNumberCallable,
              conditions: [
                {
                  type: 'LeftRightExpression',
                  operande: 'eq',
                  Lvalue: { type: 'VARIABLE', value: 'number' },
                  Rvalue: 1,
                },
              ],
            },
            { lang: 'en', tokenizedOutput: tokenizerOutput.tokenize('This is not the good answer'), conditions: [] },
          ],
        },
      ],
    });

    const result = await renderer.process('fr', [{ intentid: 1, score: 0.99 }], {});
    expect(result.score).to.equal(0.99);
    expect(result.renderResponse).to.include('Ceci est une reponse 2');
  });

  it('Should process answers - async/await web service call', async () => {
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
              preConditionsCallable,
            },
          ],
        },
      ],
    });

    const result = await renderer.process('fr', [{ intentid: 1, score: 0.99 }], {});
    expect(result.score).to.equal(0.99);
    expect(result.renderResponse).to.equal(
      'quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto',
    );
  });

  it('Should process answers - return context', async () => {
    const renderer = new SimpleOutputRenderer({
      outputs: [
        {
          intentid: 1,
          answers: [{ lang: 'fr', tokenizedOutput: tokenizerOutput.tokenize('Code<<code="state">>') }],
        },
      ],
    });
    const result = await renderer.process('fr', [{ intentid: 1, score: 0.99 }], {});
    expect(result.context.code).to.equal('state');
    expect(result.renderResponse).to.equal('Code');
  });
});
