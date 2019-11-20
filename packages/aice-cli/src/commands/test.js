/**
 * Copyright (c) 2015-present, CWB SAS
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import path from 'path';
import Command from './Command';

class Test extends Command {
  constructor(cli) {
    super(cli, 'test', 'test [filename] [testset]', 'Test a chatbot using a testset.');
  }

  formatDataImported(result) {
    let output = `${this.cli.chalk.blue('result')} all data:\n`;
    let i = 0;
    result.forEach(d => {
      i += 1;
      output += i < result.length ? '├─ ' : '└─ ';
      output += `${path.basename(d.url)} `;
      output += d.isValid ? this.cli.chalk.green('✓') : this.cli.chalk.red('☓');
      output += this.cli.chalk.dim(` [${d.schema.name} v${d.schema.version || '1'}]`);
      output += i < result.length ? '\n' : '';
    });
    return output;
  }

  async execute(argv) {
    super.execute(argv);
    if (this.cli.aiceUtils) {
      let agentData;
      let testsetData;
      try {
        const result = await this.cli.aiceUtils.importData(argv.filename);
        this.cli.log(
          `${this.cli.chalk.dim('[1/4]')} 📦 ${this.cli.chalk.green('success')} Data from "${argv.filename}" imported`,
        );
        this.cli.log(this.formatDataImported(result));
        this.cli.log('');
        result.forEach(d => {
          if (d.schema && d.schema.name === 'opennlx') {
            agentData = d.content;
          } else if (d.schema && d.schema.name === 'aice-testset') {
            testsetData = d.content;
          }
        });
      } catch (e) {
        this.cli.error(`${this.cli.chalk.dim('[1/4]')} 📦 Data loading error : `, e.message);
      }
      if (testsetData && agentData) {
        const agentsManager = this.cli.aiceUtils.getAgentsManager();
        let agent;
        try {
          agent = await agentsManager.createAgent(agentData);
          this.cli.log(
            `${this.cli.chalk.dim('[2/4]')} 🤖 ${this.cli.chalk.green('success')} Agent "${agent.name}" created`,
          );
        } catch (e) {
          this.cli.error(`${this.cli.chalk.dim('[2/4]')} 🤖 Agent creation error : `, e.message);
        }
        this.cli.log('');
        let training = false;
        if (agent) {
          try {
            await agentsManager.train({ name: agent.name });
            this.cli.log(
              `${this.cli.chalk.dim('[3/4]')} 💪 ${this.cli.chalk.green('success')} Agent "${agent.name}" trained`,
            );
            training = true;
          } catch (e) {
            this.cli.error(`${this.cli.chalk.dim('[3/4]')} 💪 Training error : `, e.message);
          }
          this.cli.log('');
        }
        if (training) {
          try {
            this.cli.log(`${this.cli.chalk.dim('[4/4] 💬 -------')} Tests "${testsetData.name}"`);
            const result = await this.cli.aiceUtils.test(agent.name, testsetData);
            let passing = 0;
            let failing = 0;
            Object.keys(result).forEach(scenario => {
              this.cli.log(scenario);
              Object.keys(result[scenario]).forEach(story => {
                const res = result[scenario][story];
                let output = '  ';
                if (res.result === 'ok') {
                  passing += 1;
                  output += this.cli.chalk.green('✓');
                  output += this.cli.chalk.dim(` ${story}`);
                } else {
                  failing += 1;
                  output += this.cli.chalk.red(`${failing})`);
                  output += this.cli.chalk.red(` ${story} ${res.result}`);
                }
                this.cli.log(output);
              });
              this.cli.log('');
            });
            if (!failing) {
              this.cli.log(this.cli.chalk.green(`${passing} passing`));
            } else {
              this.cli.log(this.cli.chalk.green(`${passing} passing`));
              this.cli.log(this.cli.chalk.red(`${failing} failing`));
            }
            this.cli.log('');
          } catch (e) {
            this.cli.error(`${this.cli.chalk.dim('[4/4]')} 💬 Tests error : `, e.message);
          }
        }
      } else {
        this.cli.log('No data found to test');
      }
    } else {
      this.cli.error('Error : no AIce-utils configured');
    }
    this.cli.done();
  }
}

export default cli => new Test(cli);
