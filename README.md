# Fusebit Atlassian Connector

This is the Fusebit Atlassian Connector, a simple way to to implement a multi-tenant, bi-directional integration between your application and Atlassian, on top of the [Fusebit](https://fusebit.io) platform.

## Getting started

Assuming you are a subscriber of [Fusebit](https://fusebit.io), you would start by using the `fuse` CLI to deploy a Fusebit Atlassian Connector Manager to your subscription:

```
git clone git@github.com:fusebit/atlassian-connector.git
cd atlassian-connector
fuse function deploy --boundary managers atlassian-connector-manager -d ./fusebit
```

Soon enough you will be writing code of your integration logic. Get in touch at [Fusebit](https://fusebit.io) for further instructions or to learn more.

## Organization

- `lib/connector` contains the core Fusebit Atlassian Connector logic that manages authentication to Atlassian.
- `lib/manager` contains the Fusebit Atlassian Connector Manager logic which supports the install/uninstall/configure operations for the connector.
- `lib/manager/template` contains a template of a Fusebit Function that exposes the Fusebit Atlassian Connector interface. As a developer, you will be spending most of your time focusing on adding your integration logic to [VendorAtlassianConnector.js](https://github.com/fusebit/atlassian-connector/blob/main/lib/manager/template/VendorAtlassianConnector.js).
- `fusebit` contains a template of a Fusebit Function that exposes the Fusebit Atlassian Connector Manager interface.

## Running tests

Here are a few things you need to know before running tests:

- You must have access to a [Fusebit](https://fusebit.io) subscription.
- You must have the [Fusebit CLI](https://fusebit.io/docs/reference/fusebit-cli/) installed.
- You must have a Fusebit CLI profile configured with an account ID and subscription ID, and sufficient permissions to manage all functions and all storage on that subscription.
- The test will create and remove functions in randomly named boundary in the subscription.
- The test will create and remove storage objects in randomly named storage ID in the subscription.

To run the tests, set the `FUSE_PROFILE` environment variable to the Fusebit CLI profile name to use:

```
FUSE_PROFILE={profile-name} npm test
```

In case of a failure, you can get useful, verbose diagnostic information with:

```
debug=1 FUSE_PROFILE={profile-name} npm test
```

## Example code

### Create a Jira client
Modify the lib/manager/template/package.json to include "@atlassian/jira", and then use this function to
create a client:

```
const JIRA = require('@atlassian/jira');

async createJiraClient(fusebitContext, userContext) {
  if (userContext.vendorToken.mode === 'basic') {
		const jira = new JIRA({baseUrl: `${userContext.vendorToken.servername}/rest`);
		jira.authenticate({
      type: 'basic',
      username: userContext.vendorToken.username,
      password: userContext.vendorToken.password
    });
    return jira;
  }

  // Create a OAuth backed Jira client
  const tokenContext = await this.ensureAccessToken(fusebitContext, userContext);
  const jira = new JIRA();
  jira.authenticate({ type: 'token', token: tokenContext.access_token });

  return jira;
}
```

## Release notes

### 1.1.0

- Upgrade to oauth-connector 1.3.0.

### 1.0.0

- Initial implementation.
