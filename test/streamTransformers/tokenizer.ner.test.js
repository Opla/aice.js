/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import chai from 'chai';
import { NamedEntityTokenizer, NERManager, SystemEntities } from '../../src/streamTransformers';
import { DoubleLinkedList } from '../../src/streamTransformers/models';

const { expect } = chai;

const { EmailRegExpEntity, UrlRegExpEntity } = SystemEntities;

const LANG = 'en';

describe('NER Tokenizer', () => {
  const ner = new NERManager();
  ner.addNamedEntity(UrlRegExpEntity);
  ner.addNamedEntity(EmailRegExpEntity);
  const nerTokenizer = new NamedEntityTokenizer(ner);

  it('Should tokenize (with NER pipe) - One Token', () => {
    const textToTokenize = 'jeff@opla.ai';
    const tokenized = nerTokenizer.tokenize(LANG, textToTokenize);

    expect(tokenized.get(0).value.ner.match).to.equal('jeff@opla.ai');
  });

  it('Should tokenize (with NER pipe) - Multiple Token', () => {
    const textToTokenize = 'My email is jeff@opla.ai';
    const tokenized = nerTokenizer.tokenize(LANG, textToTokenize);

    expect(tokenized.get(3).value.ner.match).to.equal('jeff@opla.ai');
  });

  it('Should tokenize (with NER pipe) - Multiple Token Entities', () => {
    const textToTokenize = 'My email adresse is opla@opla.ai and I love my website www.opla.fr';
    const tokenized = nerTokenizer.tokenize(LANG, textToTokenize);

    const emailToken = tokenized.get(4);
    expect(emailToken.value.ner.match).to.equal('opla@opla.ai');
    expect(emailToken.value.ner.type).to.equal('regex');
    expect(emailToken.value.ner.name).to.equal('email');

    const websiteToken = tokenized.get(10);
    expect(websiteToken.value.ner.match).to.equal('www.opla.fr');
    expect(websiteToken.value.ner.type).to.equal('regex');
    expect(websiteToken.value.ner.name).to.equal('url');
  });

  it('Should tokenize (with NER pipe) - Multiple Token (text after entity)', () => {
    const textToTokenize = 'My email adresse is opla@opla.ai and{I love you';
    const tokenized = nerTokenizer.tokenize(LANG, textToTokenize);

    const emailToken = tokenized.get(4);
    expect(emailToken.value.ner.match).to.equal('opla@opla.ai');
    expect(emailToken.value.ner.type).to.equal('regex');
    expect(emailToken.value.ner.name).to.equal('email');
  });

  it('NamedEntityTokenizer - Should throw error required constructor parameters', () => {
    expect(() => new NamedEntityTokenizer()).to.throw(
      'Invalid NamedEntityTokenizer constructor - NamedEntityRecognizer is required',
    );
  });

  it('Should tokenize (with NER pipe) using normalize=false', () => {
    const textToTokenize = 'jeff@opla.ai ok';
    const tokenized = nerTokenizer.tokenize(LANG, textToTokenize, new DoubleLinkedList(), false);

    expect(tokenized.get(0).value.ner.match).to.equal('jeff@opla.ai');
  });
});
