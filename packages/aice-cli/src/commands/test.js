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
    const { chalk } = this.cli;
    let output = '';
    const l = result.length;
    const errors = [];
    result.forEach((d, i) => {
      output += i < l - 1 ? '├─ ' : '└─ ';
      console.log('d', d);
      if (Array.isArray(d.url)) {
        output += '[';
        const ll = d.url.length;
        d.url.forEach((u, ii) => {
          output += `${path.basename(u)}`;
          output += ii < ll - 1 ? ', ' : '] ';
        });
      } else {
        output += `${path.basename(d.url)} `;
      }
      output += d.isValid ? chalk.green('✓') : chalk.red('☓');
      if (d.schema) {
        output += chalk.dim(` [${d.schema.name} v${d.schema.version || '1'}]`);
      } else {
        output += chalk.dim(' [no schema]');
      }
      if (d.error) {
        errors.push(d.error);
        output += chalk.red(` ${errors.length})`);
      }
      output += i < result.length ? '\n' : '';
    });
    if (errors.length) {
      output += '\n';
      errors.forEach((e, i) => {
        output += chalk.red(` ${i + 1}) `);
        if (typeof e === 'string') {
          output += chalk.dim(e);
        } else {
          try {
            // TODO better display of validation errors
            output += chalk.dim(JSON.stringify(e));
          } catch (err) {
            output += chalk.dim(e);
          }
        }
        output += i < result.length ? '\n' : '';
      });
    }
    return output;
  }

  async execute(argv) {
    super.execute(argv);
    const { chalk } = this.cli;
    if (this.cli.aiceUtils) {
      let agentData;
      let testsetData;
      let settings = {
        debug: true,
        rules: { no_AnyOrNothing: true },
        services: { logger: { enabled: true }, tracker: { enabled: true } },
      };
      try {
        this.cli.log(`${chalk.blue('processing')} Data from "${argv.filename}"`);
        const result = await this.cli.aiceUtils.importData(argv.filename);
        if (result.error) {
          throw new Error(result.error);
        }
        this.cli.log(this.formatDataImported(result));
        result.forEach(d => {
          if (d.schema && d.schema.name === 'opennlx') {
            agentData = d.content;
          } else if (d.schema && d.schema.name === 'aice-testset') {
            testsetData = d.content;
          } else if (d.schema && d.schema.name === 'aice-configuration') {
            settings = d.content.configuration;
          }
        });
      } catch (e) {
        this.cli.error(`${chalk.dim('[1/4]')} 📦 ${chalk.red(' error')}   Data import`);
        this.cli.error(chalk.dim(e.stack));
        this.cli.done();
        return;
      }
      if (testsetData && agentData) {
        this.cli.log(`${chalk.dim('[1/4]')} 📦 ${chalk.green(' success')} Data imported`);
        this.cli.log('');
        agentData.settings = this.cli.aiceUtils.initSettings(settings, true);
        const agentsManager = this.cli.aiceUtils.getAgentsManager();
        let agent;
        try {
          agent = await agentsManager.createAgent(agentData);
          this.cli.log(`${chalk.dim('[2/4]')} 🤖 ${chalk.green(' success')} Agent "${agent.name}" created`);
        } catch (e) {
          this.cli.error(`${chalk.dim('[2/4]')} 🤖 ${chalk.red(' error')} Agent creation`);
          this.cli.error(chalk.dim(e.stack));
          this.cli.done();
          return;
        }
        this.cli.log('');
        let training = false;
        if (agent) {
          try {
            await agentsManager.train({ name: agent.name });
            this.cli.log(`${chalk.dim('[3/4]')} 💪 ${chalk.green(' success')} Agent "${agent.name}" trained`);
            training = true;
          } catch (e) {
            this.cli.error(`${chalk.dim('[3/4]')} 💪 ${chalk.red(' error')} Agent "${agent.name}" training`);
            this.cli.error(chalk.dim(e.stack));
            this.cli.done();
            return;
          }
          this.cli.log('');
        }
        if (training) {
          try {
            this.cli.log(`${chalk.dim('[4/4] 💬  -------')} Tests "${testsetData.name}"`);
            const result = await this.cli.aiceUtils.test(agent.name, testsetData);
            let passing = 0;
            let failing = 0;
            const scs = Object.keys(result).sort();
            scs.forEach(scenario => {
              this.cli.log(scenario);
              Object.keys(result[scenario]).forEach(story => {
                const res = result[scenario][story];
                let output = '  ';
                if (res.result === 'ok') {
                  passing += 1;
                  output += chalk.green('✓');
                  output += chalk.dim(` ${story}`);
                } else {
                  failing += 1;
                  output += chalk.red(`${failing})`);
                  output += chalk.dim(`${story}`);
                  output += chalk.red(` [ ${res.result} ]`);
                }
                this.cli.log(output);
              });
              this.cli.log('');
            });
            if (!failing) {
              this.cli.log(chalk.green(`${passing} passing`));
            } else {
              this.cli.log(chalk.green(`${passing} passing`));
              this.cli.log(chalk.red(`${failing} failing`));
            }
            this.cli.log('');
          } catch (e) {
            this.cli.error(`${chalk.dim('[4/4]')} 💬 ${chalk.red(' error')} Tests `);
            this.cli.error(chalk.dim(e.stack));
          }
        }
      } else {
        this.cli.error(`${chalk.dim('[1/4]')} 📦 ${chalk.red(' error')}   Data are not enough for tests`);
      }
    } else {
      this.cli.error(`${chalk.red('error')}  AIce-utils not configured`);
    }
    this.cli.done();
  }
}

export default cli => new Test(cli);
