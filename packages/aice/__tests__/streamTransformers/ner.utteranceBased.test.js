/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import chai from 'chai';
import { NERManager, EnumEntity, SystemEntities } from '../../src/streamTransformers';

const { expect } = chai;
const { EmailRegExpEntity, UrlRegExpEntity, EmojiRegExpEntity, PhoneNumberRegExpEntity } = SystemEntities;

const LANG = 'fr';

describe('EmailRegExpEntity', () => {
  it('Should find a single match for entity email', () => {
    const utterance = 'Mon mail est harry@example.fr si cela vous convient';
    const result = EmailRegExpEntity.extract(LANG, utterance);
    expect(result[0]).to.deep.include({ match: 'harry@example.fr' });
  });
  it('Should find multiple if sentences contains more than one email', () => {
    const utterance = 'Mon mail est harry@example.fr, mais celui de mon collègue est lloyd@example2.de';
    const result = EmailRegExpEntity.extract(LANG, utterance);
    expect(result[0]).to.deep.include({ match: 'harry@example.fr' });
    expect(result[1]).to.deep.include({ match: 'lloyd@example2.de' });
  });
  it('Should find nothing if no mail is in the utterance - with a twist', () => {
    const utterance = 'Mon mail est harry@opla';
    const result = EmailRegExpEntity.extract(LANG, utterance);
    expect(result).to.deep.equal([]);
  });
});

describe('EnumEntity', () => {
  const enumEntity = new EnumEntity({
    id: '@size',
    name: 'size',
    scope: 'global',
    enumeration: [
      { key: 'S', values: ['small'] },
      { key: 'M', values: ['medium'] },
      { key: 'L', values: ['large', 'grande'] },
      { key: 'E', values: ['énorme'] },
    ],
  });

  it('Should find a single match for entity enum custom', () => {
    const utterance = 'Je veux un tee-shirt de taille medium';
    const result = enumEntity.extract(LANG, utterance);
    expect(result[0]).to.deep.include({ match: 'medium' });
  });
  it('Should find a multiple match for entity enum custom', () => {
    const utterance = 'Je veux un tee-shirt de taille medium et un en grande taille';
    const result = enumEntity.extract(LANG, utterance);
    expect(result[0]).to.deep.include({ match: 'medium' });
    expect(result[1]).to.deep.include({ match: 'grande' });
  });
  it('Should find nothing if no enum element is in the utterance', () => {
    const utterance = 'Je veux un tee-shirt de taille moyenne et un en taille giga';
    const result = enumEntity.extract(LANG, utterance);
    expect(result).to.deep.equal([]);
  });
  it('Should find match with accents in the utterance', () => {
    const utterance = 'Je veux un tee-shirt de taille moyenne et un en taille enorme';
    const result = enumEntity.extract(LANG, utterance);
    expect(result[0]).to.deep.include({ resolution: 'énorme' });
  });
});

describe('PhoneNumberRegExpEntity', () => {
  it('Should find a single match for entity phone number with french phonenumber classic', () => {
    const utterance = 'Mon tel est 0102030405';
    const result = PhoneNumberRegExpEntity.extract(LANG, utterance);
    expect(result[0]).to.deep.include({ match: '0102030405' });
  });
  it('Should find a multiple match for entity phonenumber with different format in french', () => {
    const utterance = 'Mon tel perso est 0102030405, et mon pro +33102030405';
    const result = PhoneNumberRegExpEntity.extract(LANG, utterance);
    expect(result[0]).to.deep.include({ match: '0102030405' });
    expect(result[1]).to.deep.include({ match: '+33102030405' });
  });

  it('Should find a multiple match for entity phonenumber with tricks  in french', () => {
    const utterance =
      'tel 1 : 0102030405 tel 2: +33102030405 tel 3: +23546523 tel 4: 1010101010 tel5: 5566778899 tel 6: 0504030201';
    const result = PhoneNumberRegExpEntity.extract(LANG, utterance);
    expect(result[0]).to.deep.include({ match: '0102030405' });
    expect(result[1]).to.deep.include({ match: '+33102030405' });
    expect(result[2]).to.deep.include({ match: '0504030201' });
  });

  it('Should find nothing if no phonenumber is in the utterance in french', () => {
    const utterance = 'Je veux rien, laisse moi tranquille 01 02 03 04';
    const result = PhoneNumberRegExpEntity.extract(LANG, utterance);
    expect(result).to.deep.equal([]);
  });
});

describe('EmojiEntity', () => {
  it('Should find a single match for entity emoji', () => {
    const utterance = "J'aimerais avoir un 😾";
    const result = EmojiRegExpEntity.extract(LANG, utterance);
    expect(result[0]).to.deep.include({ match: '😾' });
  });
  it('Should find a multiple match for entity emoji', () => {
    const utterance = 'Je veux un 😾 et un 👻';
    const result = EmojiRegExpEntity.extract(LANG, utterance);
    expect(result[0]).to.deep.include({ match: '😾' });
    expect(result[1]).to.deep.include({ match: '👻' });
  });
  it('Should find nothing if no emoji is in the utterance', () => {
    const utterance = 'Je veux rien, laisse moi tranquille';
    const result = EmojiRegExpEntity.extract(LANG, utterance);
    expect(result).to.deep.equal([]);
  });
});

describe('URLRegExpEntity', () => {
  it('Should find a single match for entity email', () => {
    const utterance = 'Mon site est https://www.harry.com voilà';
    const entities = UrlRegExpEntity.extract(LANG, utterance);
    expect(entities[0]).to.deep.include({ match: 'https://www.harry.com' });
  });
  it('Should find multiple if sentences contains more than one url', () => {
    const utterance = 'Mon site est https://www.harry.com et le sien www.lloyd.xxx';
    const entities = UrlRegExpEntity.extract(LANG, utterance);
    expect(entities[0]).to.deep.include({ match: 'https://www.harry.com' });
    expect(entities[1]).to.deep.include({ match: 'www.lloyd.xxx' });
  });
  it('Should find nothing if no url is in the utterance - with a twist', () => {
    const utterance = "Il n'y a pas de match dans cette phrase: http://lloyd";
    const ner = new NERManager();
    ner.addNamedEntity(UrlRegExpEntity);
    const entities = ner.findEntitiesFromUtterance(LANG, utterance);
    expect(entities).to.deep.equal([]);
  });
});

describe('NERManager', () => {
  it('Should find a match for both email and url', () => {
    const utterance = "C'est un test avec un mail HarRy@eXamPle.fr et une url https://lloyd.corp merci bien";
    const ner = new NERManager();
    ner.addNamedEntity(EmailRegExpEntity);
    ner.addNamedEntity(UrlRegExpEntity);
    const entities = ner.findEntitiesFromUtterance(LANG, utterance);
    expect(entities[0]).to.deep.include({ match: 'HarRy@eXamPle.fr', resolution: 'harry@example.fr' });
    expect(entities[1]).to.deep.include({ match: 'https://lloyd.corp' });
  });

  it('Should get normalized utterance for email and url', () => {
    const utterance = "C'est un test avec un mail harry@example.fr et une url https://lloyd.corp merci bien";
    const ner = new NERManager();
    ner.addNamedEntity(UrlRegExpEntity);
    ner.addNamedEntity(EmailRegExpEntity);
    const results = ner.normalizeEntityUtterance(LANG, utterance);
    expect(results).to.equal("C'est un test avec un mail @email et une url @url merci bien");
  });

  it('Should get normalized utterance for url and email', () => {
    const utterance = "C'est un test avec un url https://lloyd.corp et un mail harry@example.fr";
    const ner = new NERManager();
    ner.addNamedEntity(UrlRegExpEntity);
    ner.addNamedEntity(EmailRegExpEntity);
    const results = ner.normalizeEntityUtterance(LANG, utterance);
    expect(results).to.equal("C'est un test avec un url @url et un mail @email");
  });

  it('Should get normalized utterance for many entities', () => {
    const utterance =
      "C'est un test 😾 avec un mail harry@example.fr et une url https://lloyd.corp merci bien. Je crois que Harry Boss est parti voici son numéro 0651382265. Appelle le rapidement. https://underthelimits.fr est un superbe site ! Mon chat a 9 ans dans une semaine.";
    const ner = new NERManager();
    ner.addNamedEntity(UrlRegExpEntity);
    ner.addNamedEntity(EmailRegExpEntity);
    ner.addNamedEntity(EmojiRegExpEntity);
    const results = ner.normalizeEntityUtterance(LANG, utterance);
    expect(results).to.equal(
      "C'est un test @emoji avec un mail @email et une url @url merci bien. Je crois que Harry Boss est parti voici son numéro 0651382265. Appelle le rapidement. @url est un superbe site ! Mon chat a 9 ans dans une semaine.",
    );
  });

  it('Should not find a match for entity email - SystemEntity Not Added', () => {
    const utterance = 'Mon mail est harry@example.fr si cela vous convient';
    const ner = new NERManager();
    const entities = ner.findEntitiesFromUtterance(LANG, utterance);
    expect(entities).to.deep.equal([]);
  });

  it('Should only find whitelisted entity email', () => {
    const utterance = "C'est un test avec un mail harry@example.fr et une url https://lloyd.corp merci bien";
    const ner = new NERManager();
    ner.addNamedEntity(UrlRegExpEntity);
    ner.addNamedEntity(EmailRegExpEntity);
    const results = ner.normalizeEntityUtterance(LANG, utterance, [EmailRegExpEntity]);
    expect(results).to.equal("C'est un test avec un mail @email et une url https://lloyd.corp merci bien");
  });
});
