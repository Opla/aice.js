/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const buildServices = ({ logger: _l = {}, tracker: _t = {} } = {}, csl = console) => {
  let logger = _l.instance;
  if (!logger) {
    // setup  a simple logger
    logger = {};
    const dummy = () => {};
    const log = (...args) => csl.log(...args);
    if (_l.enabled) {
      logger.info = log;
      logger.warn = log;
      logger.debug = log;
      logger.trace = log;
    } else {
      logger.info = _l.info ? log : dummy;
      logger.warn = _l.warn ? log : dummy;
      logger.debug = _l.debug ? log : dummy;
      logger.trace = _l.trace ? log : dummy;
      logger.error = _l.error ? log : dummy;
    }
  }
  let tracker = _t.instance;
  if (!tracker && _t.enabled) {
    // setup a simple tracker
    tracker = {
      issues: [],
    };
    tracker.addIssue = ({ type, message, ...extra }) => {
      const issue = { type, message, ...extra };
      tracker.issues.push(issue);
      return issue;
    };
    tracker.getIssues = type => (type ? tracker.issues.filter(issue => issue.type === type) : [...tracker.issues]);
    tracker.clear = () => {
      tracker.issues = [];
    };
  } else {
    tracker = {
      addIssue: v => v,
      getIssues: () => [],
      clear: () => {},
    };
  }
  return { logger, tracker };
};

export default buildServices;
