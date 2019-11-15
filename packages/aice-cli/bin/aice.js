#!/usr/bin/env node
/* eslint-disable global-require */
/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// These file need to be executable
// chmod +x aice.js
let fm;
try {
  fm = require('aice-nfm/commonjs').default;
} catch (e) {
  console.log('error', e);
}
const cli = require('../dist/commonjs/cli').default;

const version = process.versions.node;
const major = parseInt(version.split('.')[0], 10);

/* istanbul ignore next */
if (major < 8) {
  // eslint-disable-next-line no-console
  console.error(`Node version ${version} is not supported, please use Node.js 8.0 or higher.`);
  process.exit(1);
}

// Grab arguments
const [, , ...args] = process.argv;
cli(args, console, process.exit, fm);
