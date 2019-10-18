/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import chai from 'chai';
import { Renderer } from '../../src/utils';
import { OutputExpressionTokenizer } from '../../src/streamTransformers';

const { expect } = chai;

const tokenizerOutput = new OutputExpressionTokenizer();
describe('Renderer - render', () => {
  it('Should render basic text', () => {
    const output = 'I need to be rendered';

    const tokenizeO = tokenizerOutput.tokenize(output);

    const result = Renderer.render(tokenizeO, {});
    expect(result).to.equal(output);
  });

  it('Should render text with openNLX expression OUTPUT', () => {
    const output = 'I need to be rendered a variable {{variable}}';

    const tokenizeO = tokenizerOutput.tokenize(output);

    const result = Renderer.render(tokenizeO, { variable: 'bob' });
    expect(result).to.equal('I need to be rendered a variable bob');
  });

  it('Should render text with openNLX expression OUTPUT affectation', () => {
    const output = 'I need to be rendered a variable {{variable=other}}';
    const context = { variable: 'bob', other: 'boby' };
    const tokenizeO = tokenizerOutput.tokenize(output);

    const result = Renderer.render(tokenizeO, context);
    expect(result).to.equal('I need to be rendered a variable boby');
    expect(context.variable).to.equal('boby');
  });

  it('Should render text with openNLX expression CODE', () => {
    const output = 'I need to be rendered a variable<<variable="toto">>';
    const context = { variable: 'bob' };
    const tokenizeO = tokenizerOutput.tokenize(output);

    const result = Renderer.render(tokenizeO, context);
    expect(result).to.equal('I need to be rendered a variable');
    expect(context.variable).to.equal('toto');
  });

  it('Should throw an error if no expression type', () => {
    const output = 'I need to be rendered a variable';
    const tokenizeO = tokenizerOutput.tokenize(output);
    // Add unknown expression
    tokenizeO.append({ expression: {} });

    expect(() => Renderer.render(tokenizeO, {})).to.throw('Invalid OutputRendering Render - Unknown expression');
  });
});

describe('Renderer - isRenderable', () => {
  it('Should return true for basic text', () => {
    const output = 'I need to be rendered';
    const tokenizeO = tokenizerOutput.tokenize(output);

    const result = Renderer.isRenderable(tokenizeO, {});
    expect(result).to.equal(true);
  });

  it('Should not be renderable, variable not in context', () => {
    const output = 'I need to render a variable {{variable}}';
    const tokenizeO = tokenizerOutput.tokenize(output);

    const result = Renderer.isRenderable(tokenizeO, {});
    expect(result).to.equal(false);
  });

  it('Should be renderable, variable in context', () => {
    const output = 'I need to render a variable {{variable}}';
    const tokenizeO = tokenizerOutput.tokenize(output);

    const result = Renderer.isRenderable(tokenizeO, { variable: 'something' });
    expect(result).to.equal(true);
  });

  it('Should be renderable, variable setted during rendering', () => {
    const output = 'I need to render a variable {{variable="test"}}';
    const tokenizeO = tokenizerOutput.tokenize(output);

    const result = Renderer.isRenderable(tokenizeO, {});
    expect(result).to.equal(true);
  });

  it('Should be renderable, variable setted during rendering', () => {
    const output = 'I need to render a variable {{variable="test"}}';
    const tokenizeO = tokenizerOutput.tokenize(output);

    const result = Renderer.isRenderable(tokenizeO, {});
    expect(result).to.equal(true);
  });

  it('Should be renderable, variable setted during rendering', () => {
    const output = 'I need to render a variable <<variable="test">>';
    const tokenizeO = tokenizerOutput.tokenize(output);

    const result = Renderer.isRenderable(tokenizeO, {});
    expect(result).to.equal(true);
  });

  it('Should throw error unknown', () => {
    const output = 'I need to render a variable';
    const tokenizeO = tokenizerOutput.tokenize(output);
    // Add unknown expression
    tokenizeO.append({ expression: {} });

    expect(() => Renderer.isRenderable(tokenizeO, {})).to.throw(
      'Invalid OutputRendering isRenderable - Unknown expression',
    );
  });
});
