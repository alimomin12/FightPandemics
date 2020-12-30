const axios = require("axios");
const qs = require("querystring");
const { generateUUID } = require("../../utils");

class Social {
  constructor(type, clientId, secretKey, authUrlBase, tokenUrl) {
    if (new.target === Social) {
      throw new TypeError("Social class is abstract, cannot construct.");
    }

    this.type = type; // social type
    this.clientId = clientId; // client ID
    this.secretKey = secretKey; // secret Key
    this.authUrlBase = authUrlBase; // authentication dialog URL base
    this.tokenUrl = tokenUrl; // social endpoint to get accessToken

    if (this.getUserLink === undefined) {
      throw new TypeError("must override method getUserLink");
    }
  }

  buildOauthUrl(scopes, redirectUrl) {
    const stringifiedParams = qs.stringify({
      client_id: this.clientId,
      redirect_uri: redirectUrl,
      response_type: "code",
      scope: scopes,
      state: generateUUID({ range: 32 }),
    });
    return `${this.authUrlBase}?${stringifiedParams}`;
  }

  async authenticate(codeStr, stateStr, redirectUrl) {
    const { data } = await axios({
      headers: { Accept: "application/json" },
      method: "post",
      params: {
        client_id: this.clientId,
        client_secret: this.secretKey,
        code: codeStr,
        redirect_uri: redirectUrl,
        state: stateStr,
      },
      url: this.tokenUrl,
    });
    return data.access_token;
  }
}

module.exports = { Social };