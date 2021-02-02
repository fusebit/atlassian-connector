const Superagent = require('superagent');

const { OAuthConnector } = require('@fusebit/oauth-connector');

class Connector extends OAuthConnector {
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
   *
   * Requires the 'read:me' scope on the token request.
   *
   * @param {*} tokenContext An object representing the result of the getAccessToken call. It contains refresh_token.
   */
  async getUserProfile(tokenContext) {
    const userProfile = await this.getAtlassianProfile(tokenContext.access_token);
    return {
      id: userProfile.account_id,
      atlassianProfile: userProfile,
    };
  }

  async getAtlassianProfile(accessToken) {
    const result = await Superagent.get('https://api.atlassian.com/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json');
    return result.body;
  }

  async getAuthenticateConfig(fusebitContext, userContext) {
    const tokenContext = await this.ensureAccessToken(fusebitContext, userContext);

    return { type: 'token', token: tokenContext.access_token };
  }
}

exports.Connector = Connector;
