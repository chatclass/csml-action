const core = require('@actions/core');


export const appConfig = {
	projectPath: core.getInput('csml-folder-path'),
	apiKey: core.getInput('api-key'),
	apiSecret: core.getInput('api-secret'),
	studio: {
		endpoint: core.getInput('endpoint')
	}
}