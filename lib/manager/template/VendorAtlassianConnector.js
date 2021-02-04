const AtlassianConnector = require('./imports').ConnectorClass;

class VendorAtlassianConnector extends AtlassianConnector {
  async createClient(fusebitContext, userContext) {
    const tokenContext = await this.ensureAccessToken(fusebitContext, userContext);

    /* Create a JIRA specific client; replace with whatever Atlassian service is desired. */
    const JIRA = require('@atlassian/jira');
    const jira = new JIRA();
    jira.authenticate({ type: 'token', token: tokenContext.access_token });

    return jira;
  }
}

module.exports.VendorAtlassianConnector = VendorAtlassianConnector;
