/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default class TestsManager {
  constructor(services) {
    this.services = services;
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

  // eslint-disable-next-line class-methods-use-this
  findSubStory(stories, name) {
    return stories.find(story => story.name === name || story.id === name);
  }

  async runStory(conversationId, agentName, dialogs, actors, storyContext) {
    const aManager = this.services.getAgentsManager();
    let ok = false;
    let error;
    let count = 0;
    const output = {};
    // const { actors, name: conversationId } = story;
    let response = null;
    let issues;
    let context = {};
    aManager.setContext(agentName, conversationId, storyContext);
    // eslint-disable-next-line guard-for-in
    for (const message of dialogs) {
      const user = this.getUser(actors, message.from);
      if (!user) {
        error = `Not valid user from "${message.from}"`;
        break;
      } else if (user.type === 'human' && !response) {
        issues = null;
        // eslint-disable-next-line no-await-in-loop
        response = await aManager.evaluate(agentName, conversationId, message.say);
        // eslint-disable-next-line no-await-in-loop
        context = await aManager.getContext(agentName, conversationId);
        ok = true;
      } else if (user.type === 'robot' && response && this.matchContext(context, message.context)) {
        issues = response.issues;
        const textA = response.message.text ? response.message.text.trim() : undefined;
        const textB = message.say.trim();
        if (textA === textB) {
          response = null;
          ok = true;
        } else {
          error = `Not matching "${textB}" "${textA}"`;
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
      output.result = `Error : ${error}`;
    } else {
      output.result = 'ok';
    }
    output.count = count;
    /* istanbul ignore next */
    if (issues) {
      output.issues = [...issues];
    }
    return output;
  }

  async runAllStory(story, conversationId, _result, agentName, stories, depth = 0) {
    const result = _result;
    const { actors, dialogs, context: storyContext } = story;
    if (!story.disabled && dialogs.length) {
      // eslint-disable-next-line no-await-in-loop
      result[conversationId] = await this.runStory(conversationId, agentName, dialogs, actors, storyContext);
    }
    if (story.next) {
      for (const subStoryName of story.next) {
        const subStory = this.findSubStory(stories, subStoryName);
        if (!subStory) {
          throw new Error(`Can't find this substory : ${subStoryName}`);
        }
        // Merge 2 dialogs
        const d = [...dialogs, ...subStory.dialogs];
        const name = `${conversationId} => ${subStoryName}`;
        // eslint-disable-next-line no-await-in-loop
        await this.runAllStory(
          { ...subStory, dialogs: d, context: storyContext },
          name,
          result,
          agentName,
          stories,
          depth + 1,
        );
      }
    }
  }

  async test(agentName, testset, scenarioName, storyName) {
    const aManager = this.services.getAgentsManager();
    const agent = aManager.getAgent(agentName);
    if (!agent) {
      throw new Error("Can't find an agent for this test");
    }
    const results = {};
    for (const scenario of testset.scenarios) {
      if (!scenarioName || scenario.name === scenarioName) {
        results[scenario.name] = {};
        for (const story of scenario.stories) {
          if (!story.subStory && (story.name === storyName || !storyName)) {
            // eslint-disable-next-line no-await-in-loop
            await this.runAllStory(story, story.name, results[scenario.name], agentName, scenario.stories);
          }
        }
      }
    }
    return results;
  }
}
