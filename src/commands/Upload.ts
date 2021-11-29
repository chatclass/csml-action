import BotHelpers from '../helpers/bot';
import request from '../modules/request';
import { Command } from './Command';

export default class Upload extends Command {
  constructor() {
    super();
  }

  //todo: implementar Promise.all
  async run() {
    const localBot = BotHelpers.readManifest(this.projectPath);
    const studioBot = await BotHelpers.getFromStudio(this.credentials);
    const localFlows = localBot.flows;
    const { credentials } = this;

    console.log('Uploading bot...');
    // make sure that the new default_flow is uploaded first
    // if that flow does not already exist, it must be created first
    const defFlow = localBot.flows.find(
      (f: any) => f.name === localBot.default_flow
    );
    let defFlowStudio = studioBot.flows.find(
      (f: any) => f.name === defFlow.name
    );
    if (!defFlowStudio) {
      console.log('Uploading default flow...');
      defFlowStudio = await request
        .post('/bot/flows')
        .set(credentials)
        .send(defFlow);
    }
    // bot default_flow must use correct reference to flow ID, not name
    localBot.default_flow = defFlowStudio.id;

    // remove distant flows that don't exist anymore
    console.log('Removing discarded flows...');
    for (const flow of studioBot) {
      if (localFlows.find((lf: any) => lf.name === flow.name)) continue;
      await request.del(`/bot/flows/${flow.id}`).set(credentials);
    }

    // create new flows that were added locally
    console.log('Creating new flows...');
    for (const flow of localFlows) {
      if (defFlow.name === flow.name) continue;
      if (studioBot.flows.find((sf: any) => sf.name === flow.name)) continue;
      await request.post('/bot/flows').set(credentials).send(flow);
      console.log(`Sent ${flow.name}`);
    }

    // update flows that exist in both places
    console.log('Updating old flows...');
    for (const flow of localFlows) {
      const f = studioBot.flows.find((sf: any) => sf.name === flow.name);
      if (!f) continue;
      await request.put(`/bot/flows/${f.id}`).set(credentials).send(flow);
    }

    console.log('Bot successfully uploaded!');
  }
}
