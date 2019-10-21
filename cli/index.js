#!/usr/bin/env node
/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// These file need to be executable
// chmod +x index.js

// Grab arguments
const [, , ...args] = process.argv;

// eslint-disable-next-line no-console
console.log(`AICE ${args}`);
