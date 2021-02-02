const AtlassianConnector = require('./imports').ConnectorClass;

class VendorAtlassianConnector extends AtlassianConnector {
  /*
   * Create a JIRA specific client; make sure '@atlassian/jira' is included in the
   * 'fusebit_additional_imports' configuration variable.
   */
  async createJiraClient(fusebitContext, userContext) {
    const JIRA = require('@atlassian/jira');
    const jira = new JIRA();
    jira.authenticate(this.getAuthenticateConfig(fusebitContext, userContext));

    return jira;
  }
}

module.exports.VendorAtlassianConnector = VendorAtlassianConnector;
