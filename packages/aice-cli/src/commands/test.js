/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Command from './Command';

class Test extends Command {
  constructor(cli) {
    super(cli, 'test', 'test [filename] [testset]', 'Test a chatbot using a testset.');
  }

  async execute(argv) {
    super.execute(argv);
    if (this.cli.aiceUtils) {
      let result = await this.cli.aiceUtils.importData(argv.filename);
      this.cli.log('result', result);
      let agentData;
      let testsetData;
      result.forEach(d => {
        if (d.schema && d.schema.name === 'opennlx') {
          agentData = d.content;
        } else if (d.schema && d.schema.name === 'aice-testset') {
          testsetData = d.content;
        }
      });
      if (testsetData && agentData) {
        const agentsManager = this.cli.aiceUtils.getAgentsManager();
        let agent;
        try {
          agent = await agentsManager.createAgent(agentData);
          this.cli.log('Agent created', agent.name);
        } catch (e) {
          this.cli.log('Agent creation error : ', e.message);
        }
        let training = false;
        if (agent) {
          try {
            await agentsManager.train({ name: agent.name });
            this.cli.log('Agent trained');
            training = true;
          } catch (e) {
            this.cli.log('Training error : ', e.message);
          }
        }
        if (training) {
          result = await this.cli.aiceUtils.test(agent.name, testsetData);
          this.cli.log('result', result);
        }
      } else {
        this.cli.log('No data found to test');
      }
    } else {
      this.cli.log('result : no AIce-utils configured');
    }
    this.cli.log('✨ Done in 0s.');
  }
}

export default cli => new Test(cli);
