import BotHelpers from '../helpers/bot';
import { Command } from './Command';

export default class Validate extends Command {
  constructor() {
    super();
  }

  async run() {
    const bot = BotHelpers.readManifest(this.projectPath);
    const res = await BotHelpers.validateBot(bot, this.credentials);
    if (res.valid) return console.log('Bot is valid CSML!');
    console.error('\nThere are errors in your bot:');
    let errorsMessage: string[] = [];
    res.errors.forEach((e: any) => {
      const message = `Flow ${e.flow}, step ${e.step}, line ${e.line}, col ${e.col}: ${e.message}`;
      console.error(message);
      errorsMessage.push(message);
    });
    throw { message: errorsMessage.join(' ') };
  }
}
