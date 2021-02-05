const { Connector } = require('./Connector');
const { createOAuthConnector } = require('@fusebit/oauth-connector');

exports.AtlassianConnector = Connector;
exports.createAtlassianConnector = createOAuthConnector;
