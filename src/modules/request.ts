import { appConfig } from '../config/appConfig';
const request = require('superagent');
const prefix = require('superagent-prefix');

export default request
  .agent()
  .use(prefix(appConfig.studio.endpoint))
  .accept('application/json')
  .set('Content-Type', 'application/json')
  .on('error', (err: any) => {
    const message = err.response.text;
    throw new Error(message);
  });
