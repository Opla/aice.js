/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import chai from 'chai';
import { Comparator } from '../../src/utils';
import {
  EnumEntity,
  NamedEntityTokenizer,
  NERManager,
  SystemEntities,
  InputExpressionTokenizer,
} from '../../src/streamTransformers';

const { expect } = chai;

const LANG = 'fr';

describe('Entities Comparator', () => {
  const ner = new NERManager();
  ner.addNamedEntity(
    new EnumEntity({
      name: 'size',
      scope: 'global',
      enumeration: [
        { key: 'S', values: ['small'] },
        { key: 'M', values: ['medium'] },
        { key: 'L', values: ['large'] },
      ],
    }),
  );
  const tokenizerUtterance = new NamedEntityTokenizer(ner);
  const tokenizerInput = new InputExpressionTokenizer();
  const simpleComparator = new Comparator();

  SystemEntities.getSystemEntities().forEach(e => {
    ner.addNamedEntity(e);
  });

  it("Compare '{{@email}}' to 'john@doe.com' should be true", () => {
    const input = '{{@email}}';
    const utterance = 'john@doe.com';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(LANG, utterance);

    const result = simpleComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.context.email).to.equal(utterance);
  });

  it("Compare '{{^}}{{@email}}{{^}}' to 'john@doe.com' should be true", () => {
    const input = '{{^}}{{@email}}{{^}}';
    const utterance = 'john@doe.com';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(LANG, utterance);

    const result = simpleComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
    expect(result.context.email).to.equal(utterance);
    expect(Object.entries(result.context).length).to.equal(3); // anyornothing email anyornothing_1
  });

  it("Compare '{{^}}{{@email}}' to 'hello' should be false", () => {
    const input = '{{^}}{{@email}}';
    const utterance = 'hello';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(LANG, utterance);

    const result = simpleComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(false);
  });

  it("Compare '{{^}} {{@email}} {{@phonenumber}}' to 'test@opla.ai' should be false", () => {
    const input = '{{^}} {{@email}} {{@phonenumber}}';
    const utterance = 'test@opla.ai';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(LANG, utterance);

    const result = simpleComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(false);
  });

  it('Compare should sub enum entity', () => {
    const input = '{{@size_s}} {{@size_m}} {{@size_l}}';
    const utterance = 'small medium large';

    const sentenceI = tokenizerInput.tokenize(input);
    const sentenceU = tokenizerUtterance.tokenize(LANG, utterance);

    const result = simpleComparator.compare(sentenceI, sentenceU);
    expect(result.match).to.equal(true);
  });
});
