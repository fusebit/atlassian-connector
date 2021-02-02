const Superagent = require('superagent');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const Sdk = require('@fusebit/add-on-sdk');
const { OAuthConnector } = require('@fusebit/oauth-connector');

const httpError = (res, status, message) => {
  res.status(status);
  res.send({
    status,
    statusCode: status,
    message,
  });
};

class Connector extends OAuthConnector {
  constructor() {
    super();
  }

  /**
   * Utility handler to get the current user based on the vendorUserId and, optionally, vendorId encoded in
   * the request parameters.
   */
  lookupUser() {
    const lookup = async (req, res, next) => {
      req.params.userContext = await this.getUser(req.fusebit, req.params.vendorUserId, req.params.vendorId);
      next();
    };
    return lookup;
  }

  /**
   * Create the user profile used for this tokenContext.
   * @param {*} tokenContext An object representing the result of the getAccessToken call. It contains refresh_token.
   */
  async getUserProfile(tokenContext) {
    return {
      id: uuidv4(),
    };
  }
}

exports.Connector = Connector;
