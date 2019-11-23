/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const codes = {
  INTENT_DUPLICATE_INPUT: 0,
  AGENT_EXPECT_ANY: 1,
  INTENT_NO_OUTPUT: 2,
  EVALUATE_NO_CONDITION: 3,
};

const refs = {
  INTENT_DUPLICATE_INPUT: 'INTENT_DUPLICATE_INPUT',
  AGENT_EXPECT_ANY: 'AGENT_EXPECT_ANY',
  INTENT_NO_OUTPUT: 'INTENT_NO_OUTPUT',
  EVALUATE_NO_CONDITION: 'EVALUATE_NO_CONDITION',
};

const issues = {
  INTENT_DUPLICATE_INPUT: {
    template: {
      type: 'warning',
      code: codes.DUPLICATE_INPUT,
      message: 'Input conflict',
    },
    build: (template, p) => ({
      ...template,
      description: `Same input "${p[0]}" between ${p[1]}[${p[2]}] and ${p[3]}[${p[4]}]`,
    }),
  },
  AGENT_EXPECT_ANY: {
    template: {
      type: 'warning',
      code: codes.AGENT_EXPECT_ANY,
      message: 'No any intent found',
    },
    build: template => ({
      ...template,
      description: `An agent need an intent with an input containing an any or a anyorNothing entry`,
    }),
  },
  INTENT_NO_OUTPUT: {
    template: {
      type: 'error',
      code: codes.INTENT_NO_OUTPUT,
      message: 'No output linked',
    },
    build: (template, p) => ({
      ...template,
      description: `This intent "${p}" doesn't have any output`,
    }),
  },
  EVALUATE_NO_CONDITION: {
    template: {
      type: 'error',
      code: codes.EVALUATE_NO_CONDITION,
      message: 'No condition matched',
    },
    build: (template, p) => ({
      ...template,
      description: `Conditions in this output ${p[0]}[${p[1]}] doesn't match`,
    }),
  },
};

const issuesFactory = {
  codes,
  create: (ref, parameters) => issues[ref].build(issues[ref].template, parameters),
  ...refs,
};

export default issuesFactory;
