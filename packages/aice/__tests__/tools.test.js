/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import chai from 'chai';
import { AICE, Tools } from '../src';

const { expect } = chai;

describe('AICE Tools', () => {
  it('evaluateFromContext no context', async () => {
    const res = Tools.evaluateFromContext('dummy');
    expect(res).to.equal('dummy');
  });
  it('evaluateFromContext empty context', async () => {
    const res = AICE.evaluateFromContext('{{var}}', {});
    expect(res).to.equal('undefined');
  });
  it('evaluateFromContext var in context', async () => {
    const res = Tools.evaluateFromContext('{{var}}', { var: 'value' }, true);
    expect(res).to.equal('value');
  });
  it('evaluateFromContext mandatory with no var in context', async () => {
    const res = () => AICE.evaluateFromContext('{{var}}', {}, true);
    expect(res).to.throw(Error, 'Tools - evaluateFromContext mandatory variable(s) not in context');
  });
});
