/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import chai from 'chai';
import buildServices from '../src/services';

const { expect } = chai;

describe('AIce #services', () => {
  it('No services', async () => {
    const services = buildServices();
    expect(services).to.have.property('logger');
    expect(services).to.have.property('tracker');
  });
  it('Simple logger', async () => {
    const services = buildServices({ logger: { enabled: true } });
    expect(services).to.have.property('logger');
    expect(services).to.have.property('tracker');
    services.tracker.addIssue();
    services.tracker.getIssues();
  });
  it('Full logger', async () => {
    const services = buildServices({ logger: { info: true, warn: true, debug: true, trace: true, error: true } });
    expect(services).to.have.property('logger');
    expect(services).to.have.property('tracker');
  });
  it('logger.info', async () => {
    let variable;
    const csl = {
      log: v => {
        variable = v;
      },
    };
    const services = buildServices({ logger: { info: true } }, csl);
    services.logger.info('value');
    services.logger.warn('valueb');
    expect(variable).to.equal('value');
  });
  it('Instance logger', async () => {
    const services = buildServices({ logger: { instance: {} } });
    expect(services).to.have.property('logger');
    expect(services).to.have.property('tracker');
  });
  it('Dummy tracker', async () => {
    const services = buildServices({});
    let res = services.tracker.addIssue('value');
    expect(res).to.equal('value');
    res = services.tracker.getIssues();
    expect(res.length).to.equal(0);
    services.tracker.clear();
  });
  it('Enabled tracker', async () => {
    const services = buildServices({ tracker: { enabled: true } });
    let res = services.tracker.addIssue({ type: 'type', message: 'message' });
    expect(res.type).to.equal('type');
    expect(res.message).to.equal('message');
    res = services.tracker.getIssues();
    expect(res.length).to.equal(1);
    res = services.tracker.getIssues('notype');
    expect(res.length).to.equal(0);
    services.tracker.clear();
    res = services.tracker.getIssues();
    expect(res.length).to.equal(0);
  });
});
