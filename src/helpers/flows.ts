const fs = require('fs');
const path = require('path');

const flow = {
  /**
   * Read flows
   *
   * @param {*} dir
   */
  readFlows(dir) {
    try {
      const flows = [];
      fs.readdirSync(dir).forEach((name) => {
        if (!name.endsWith('.csml')) return;
        flows.push({
          name: name.substring(0, name.length - 5),
          content: fs.readFileSync(path.join(dir, name)).toString(),
        });
      });
      return flows;
    } catch (err) {
      throw new Error(`Impossible to read flow at path ${path}`);
    }
  },
};

export default flow;
