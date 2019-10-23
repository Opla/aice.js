/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import RegExpEntity from './RegExpEntity';

const SYSTEM_SCOPE = 'system';

const EmailRegExpEntity = new RegExpEntity({
  id: '@email',
  scope: SYSTEM_SCOPE,
  name: 'email',
  regex: /\b(\w[-._\w]*\w@\w[-._\w]*\w\.\w{2,3})\b/gi,
  resolve: v => v.toLowerCase(),
});
const UrlRegExpEntity = new RegExpEntity({
  id: '@url',
  scope: SYSTEM_SCOPE,
  name: 'url',
  regex: /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi,
});
const EmojiRegExpEntity = new RegExpEntity({
  id: '@emoji',
  scope: SYSTEM_SCOPE,
  name: 'emoji',
  regex: /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi,
});
// TODO Add lang to Entity
const PhoneNumberRegExpEntity = new RegExpEntity({
  id: '@phonenumber',
  scope: SYSTEM_SCOPE,
  name: 'phonenumber',
  regex: /(?:(?:\+|00)33[\s.-]{0,3}(?:\(0\)[\s.-]{0,3})?|0)[1-9](?:(?:[\s.-]?\d{2}){4}|\d{2}(?:[\s.-]?\d{3}){2})/gi,
});

export default class SystemEntities {
  static getSystemEntities() {
    return [EmailRegExpEntity, UrlRegExpEntity, EmojiRegExpEntity, PhoneNumberRegExpEntity];
  }
}
SystemEntities.EmailRegExpEntity = EmailRegExpEntity;
SystemEntities.UrlRegExpEntity = UrlRegExpEntity;
SystemEntities.EmojiRegExpEntity = EmojiRegExpEntity;
SystemEntities.PhoneNumberRegExpEntity = PhoneNumberRegExpEntity;

export { EmailRegExpEntity, UrlRegExpEntity, EmojiRegExpEntity, PhoneNumberRegExpEntity };
