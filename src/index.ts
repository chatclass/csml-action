import Build from './commands/Build';
import Validate from './commands/Validate';
import * as core from '@actions/core';
import Upload from './commands/Upload';

(async () => {
  try {
    new Validate().run();
		new Upload().run()
    new Build().run();
  } catch (error: any) {
    core.setFailed(error.message);
  }
})();
