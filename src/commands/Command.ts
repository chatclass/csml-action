import { appConfig } from '../config/appConfig';
import auth, { ICredentials } from '../helpers/auth';

export abstract class Command {
  protected credentials: ICredentials;
  protected projectPath: string;
  constructor() {
    this.credentials = auth();
    this.projectPath = appConfig.projectPath ?? '';
  }
}
