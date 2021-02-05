const Superagent = require('superagent');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const url = require('url');

const Sdk = require('@fusebit/add-on-sdk');
const { OAuthConnector } = require('@fusebit/oauth-connector');

const authorizeView = require('fs').readFileSync(__dirname + '/authorize.html', {
  encoding: 'utf8',
});

class Connector extends OAuthConnector {
  async getAuthorizationPageHtml(fusebitContext, authorizationUrl) {
    return authorizeView
      .replace(/##vendorName##/g, fusebitContext.configuration.vendor_name)
      .replace(/##authorizationUrl##/g, authorizationUrl)
      .replace(
        /##basicAuthorizationUrl##/g,
        fusebitContext.configuration.fusebit_enable_basic_auth !== '0' ? `${fusebitContext.baseUrl}/callback` : ''
      )
      .replace(/##returnTo##/, JSON.stringify(fusebitContext.query.returnTo))
      .replace(/##state##/, fusebitContext.query.state ? JSON.stringify(fusebitContext.query.state) : 'null');
  }

  async getAccessToken(fusebitContext, authorizationCode, redirectUri) {
    if (!fusebitContext.query.mode || fusebitContext.query.mode != 'basic') {
      // Perform the normal OAuth based authentication flow
      return super.getAccessToken(fusebitContext, authorizationCode, redirectUri);
    }

    const params = JSON.parse(Buffer.from(authorizationCode, 'base64').toString('utf8'));

    // Extract out a cleaned version of the servername
    const servername = new url.URL(params.servername).origin;

    // Create a basic access token that never expires.
    return {
      expires_in: 100000000000,
      mode: 'basic',
      access_token: 'basic_auth_token',
      servername: servername,
      username: params.username,
      password: params.password,
    };
  }

  /**
   * Create the user profile used for this tokenContext.
   *
   * Requires the 'read:me' scope on the token request for cloud-based OAuth flows.
   *
   * @param {*} tokenContext An object representing the result of the getAccessToken call. It contains refresh_token.
   */
  async getUserProfile(tokenContext) {
    if (tokenContext.mode != 'basic') {
      // Get the profile from the cloud service, based on the access_token
      const userProfile = await this.getAtlassianProfile(tokenContext.access_token);
      return {
        id: userProfile.account_id,
        atlassianProfile: userProfile,
      };
    }

    // Create a hash based on the server+username to use as the id
    const profileId = crypto
      .createHash('sha256')
      .update(`${tokenContext.servername}@${tokenContext.username}`, 'utf8')
      .digest('hex');

    return { id: profileId };
  }

  async getAtlassianProfile(accessToken) {
    const result = await Superagent.get('https://api.atlassian.com/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json');
    return result.body;
  }
}

exports.Connector = Connector;
