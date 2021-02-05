const { VendorAtlassianConnector } = require('./VendorAtlassianConnector');
const createAtlassianConnector = require('./imports').createConnectorClass;

module.exports = createAtlassianConnector(new VendorAtlassianConnector());
