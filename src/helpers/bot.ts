import fs from 'fs';
import path from 'path';
import _pick from 'lodash.pick';
import _uniq from 'lodash.uniq';
import request from '../modules/request';

export default class BotHelpers {
  /**
   * Read local bot manifest
   *
   * @param {*} projectPath
   */
  static readManifest(projectPath: string) {
    try {
      const data = fs
        .readFileSync(path.join(projectPath, './bot.json'))
        .toString();
      const rawManifest = JSON.parse(data);
      const formatted = _pick(rawManifest, [
        'id',
        'name',
        'description',
        'default_flow',
        'airules',
        'flows',
      ]);

      // the bot must have an id
      formatted.id = formatted.name;

      const flowFiles = fs.readdirSync(path.join(projectPath, './flows'));

      // work on a copy of the raw flows as they will be modified
      const localFlowsHashmap = flowFiles.reduce(
        (acc: any, filename: string) => {
          // ignore invalid files
          const isCommands = filename.endsWith('.cmds.csml');
          const isContent = !isCommands && filename.endsWith('.csml');
          if (!isCommands && !isContent) return acc;

          const flowName = filename.split('.')[0];
          const content = fs
            .readFileSync(path.join(projectPath, './flows', filename))
            .toString();

          // each flow has a content and optional commands
          if (!acc[flowName]) {
            acc[flowName] = {
              id: flowName,
              name: flowName,
              commands: [],
            };
          }
          if (isContent) acc[flowName].content = content;
          else if (isCommands)
            acc[flowName].commands = _uniq(content.split('\n')).filter(
              (c) => !!c.trim()
            );
          return acc;
        },
        {}
      );

      formatted.airules = flowFiles
        .filter((filename) => filename.endsWith('.cmds.csml'))
        .reduce((acc: any, filename: string) => {
          const commands = fs
            .readFileSync(path.join(projectPath, './flows', filename))
            .toString()
            .split('\n')
            .map((l) => l.trim())
            // only keep lines that exist and that are not "/flowname"
            .filter((l) => l && `${l}.cmds.csml` !== `/${filename}`);
          const target = {
            flow_name: filename.split('.')[0],
          };
          // don't send commands for flows that don't have any
          if (commands.length) acc.push({ commands, target });
          return acc;
        }, []);

      // flows are an array of valid flow objects
      formatted.flows = Object.keys(localFlowsHashmap).map(
        (k) => localFlowsHashmap[k]
      );

      // default_flow must point to an existing flow
      const defFlow = formatted.flows.find(
        (lf: any) => lf.id === rawManifest.default_flow
      );
      if (!defFlow)
        throw new Error("Bot's default_flow does not exist in project");

      return formatted;
    } catch (err: any) {
      throw new Error(`Invalid bot manifest at ${projectPath}: ${err.message}`);
    }
  }

  /**
   * Write the content of data to the bot manifest
   *
   * @param {*} manifest
   * @param {string} dir - defaults to current folder
   */
  static writeManifest(manifest: any, dir: string) {
    const data = _pick(manifest, ['name', 'description', 'default_flow']);

    const defFlow = manifest.flows.find(
      (f: any) => f.id === manifest.default_flow
    );
    if (!defFlow)
      throw new Error('Invalid bot manifest: default flow does not exist');

    data.default_flow = defFlow.name;

    fs.writeFileSync(
      path.join(dir, './bot.json'),
      JSON.stringify(data, null, 2)
    );
    manifest.flows.forEach((f: any) => {
      fs.writeFileSync(path.join(dir, 'flows', `${f.name}.csml`), f.content);
      fs.writeFileSync(
        path.join(dir, 'flows', `${f.name}.cmds.csml`),
        _uniq(f.commands)
          .filter((i: any) => !!i.trim())
          .join('\n')
      );
    });
  }

  /**
   * Retrieve the bot from Studio
   *
   * @param {*} credentials
   */
  static async getFromStudio(credentials: any) {
    try {
      const { body } = await request.get('/bot').set(credentials);
      return body;
    } catch (err: any) {
      throw new Error(`Impossible to retrieve bot: ${err.message}`);
    }
  }

  /**
   * Update the bot on CSML Studio
   *
   * @param {*} bot
   * @param {*} credentials
   */
  static async updateStudioBot(bot: any, credentials: any) {
    try {
      const toUpdate = _pick(bot, ['default_flow', 'name']);
      await request.put('/bot').set(credentials).send(toUpdate);
    } catch (err: any) {
      throw new Error(`Impossible to update bot: ${err.message}`);
    }
  }

  /**
   * Send current bot for validation
   *
   * @param {*} filepath
   */
  static async validateBot(bot: any, credentials: any) {
    try {
      const { body } = await request
        .post('/bot/validate')
        .set(credentials)
        .send(bot);
      return body;
    } catch (err: any) {
      throw new Error(`Impossible to validate bot: ${err.message}`);
    }
  }
}
