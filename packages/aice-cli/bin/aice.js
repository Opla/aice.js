#!/usr/bin/env node
/* eslint-disable global-require */
/* istanbul ignore file */

/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// These file need to be executable
// chmod +x aice.js

(async () => {
  let d;
  let fm;
  let cli;
  let aiceUtils;
  let aice;

  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    try {
      d = await import('../../aice-nfm/dist');
      fm = d.default;
      d = await import('../../aice-utils/dist');
      aiceUtils = d.default;
      d = await import('../dist/cli');
      cli = d.default;
      d = await import('../../aice/dist');
      aice = d.AICE;
    } catch (e) {
      //
    }
  } else {
    try {
      d = require('aice-nfm/commonjs');
      fm = d.default;
      d = require('aice-utils/commonjs');
      aiceUtils = d.default;
      d = require('aice/commonjs');
      aice = d.AICE;
      const path = require('path');
      // eslint-disable-next-line import/no-unresolved
      d = require(path.join(__dirname, '../commonjs/cli'));
      cli = d.default;
    } catch (e) {
      //
      console.log(e);
    }
  }

  const version = process.versions.node;
  const major = parseInt(version.split('.')[0], 10);

  if (major < 12) {
    // eslint-disable-next-line no-console
    console.error(`Node version ${version} is not supported, please use Node.js 12.0 or higher.`);
    process.exit(1);
  }

  if (cli) {
    // Grab arguments
    const [, , ...args] = process.argv;
    cli(args, console, process.exit, { FileManager: fm, aiceUtils, aice });
  } else {
    console.log(`AIce can't be started`);
  }
})();
