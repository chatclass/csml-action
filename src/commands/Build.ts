import auth, { ICredentials } from '../helpers/auth';
import BotHelpers from '../helpers/bot';
import request from '../modules/request';
import { Command } from './Command';

export default class Build extends Command {
  constructor() {
    super();
  }
  async run() {
    const { body } = await request.post('/bot/build').set(this.credentials);
    console.log(`Built bot version ${body.id}`);
  }
}
