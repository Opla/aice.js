/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default class TestsManager {
  constructor(utils) {
    this.utils = utils;
  }

  // eslint-disable-next-line class-methods-use-this
  getUser(actors, username) {
    return actors.filter(a => (a.name === username ? a : null))[0];
  }

  // eslint-disable-next-line class-methods-use-this
  matchContext(context, refContext) {
    let match = true;
    if (context && refContext) {
      Object.keys(refContext).forEach(name => {
        if (context[name] !== refContext[name]) {
          match = false;
        }
      });
    }
    if (!context && refContext && Object.keys(refContext).length > 0) {
      match = false;
    }
    return match;
  }

  async test(agentName, testset, scenarioName, storyName) {
    const aManager = this.utils.getAgentsManager();
    const agent = aManager.getAgent(agentName);
    if (!agent) {
      throw new Error("Can't find an agent for this test");
    }
    const results = {};
    // eslint-disable-next-line guard-for-in
    for (const scenario of testset.scenarios) {
      if (!scenarioName || scenario.name === scenarioName) {
        results[scenario.name] = {};
        // eslint-disable-next-line guard-for-in
        for (const story of scenario.stories) {
          let ok = false;
          let error;
          let count = 0;
          if (story.name === storyName || !storyName) {
            results[scenario.name][story.name] = {};
            const { actors, name: conversationId } = story;
            let response = null;
            let context = {};
            aManager.setContext(agentName, conversationId, story.context);
            // eslint-disable-next-line guard-for-in
            for (const message of story.dialogs) {
              const user = this.getUser(actors, message.from);
              if (!user) {
                error = `Not valid user from "${message.from}"`;
                break;
              } else if (user.type === 'human' && !response) {
                // eslint-disable-next-line no-await-in-loop
                response = await aManager.evaluate(agentName, conversationId, message.say);
                // eslint-disable-next-line no-await-in-loop
                context = await aManager.getContext(agentName, conversationId);
                ok = true;
              } else if (user.type === 'robot' && response && this.matchContext(context, message.context)) {
                if (response.message.text === message.say) {
                  response = null;
                  ok = true;
                } else {
                  error = `Not matching "${message.say}" "${response.message.text}"`;
                  ok = false;
                  break;
                }
              } else {
                error = `Unexpected flow "${message.say}"`;
                break;
              }
              count += 1;
            }
            if (!ok) {
              results[scenario.name][story.name].result = `Error : ${error}`;
            } else {
              results[scenario.name][story.name].result = 'ok';
            }
            results[scenario.name][story.name].count = count;
          }
        }
      }
    }
    return results;
  }
}
