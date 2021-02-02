/*
This is the installation logic of the Lifecycle Manager. 
*/

const Fs = require('fs');
const Path = require('path');

const Sdk = require('@fusebit/add-on-sdk');

const getTemplateFiles = (fileNames) =>
  fileNames.reduce((a, c) => {
    a[c] = Fs.readFileSync(__dirname + `/template/${c}`, { encoding: 'utf8' });
    return a;
  }, {});

const connectorName = require('/var/task/app/imports').ConnectorName;

module.exports = async (ctx) => {
  const configuration = {
    debug: '1',
    ...ctx.body.configuration,
  };

  // Create the Connector
  await Sdk.createFunction(
    ctx,
    {
      configurationSerialized: `# Connector configuration settings
${Object.keys(configuration)
  .sort()
  .map((k) => `${k}=${configuration[k]}`)
  .join('\n')}
`,
      nodejs: {
        files: {
          ...getTemplateFiles(['index.js', `Vendor${connectorName}Connector.js`]),
          ...require('/var/task/app/imports').ExtraTemplateFiles,
          'package.json': {
            engines: {
              node: '10',
            },
            dependencies: {
              // Use the same version of connector as in this package.
              // However, skip the dependency entirely if this is a test run, since the npm
              // module may not yet have been published.
              ...require('/var/task/app/imports').Dependencies,
              // The following are declared as peerDependencies of the connector
              // and the versions must match those in top level package.json
              superagent: '6.1.0',
            },
          },
        },
      },
      metadata: {
        fusebit: {
          editor: {
            navigationPanel: {
              hideFiles: [],
            },
          },
        },
        ...ctx.body.metadata,
      },
      security: {
        functionPermissions: {
          allow: [
            {
              action: 'storage:*',
              resource: `/account/${ctx.accountId}/subscription/${ctx.subscriptionId}/storage/boundary/${ctx.body.boundaryId}/function/${ctx.body.functionId}/`,
            },
            {
              action: 'function:*',
              resource: `/account/${ctx.accountId}/subscription/${ctx.subscriptionId}/`,
            },
          ],
        },
        authentication: 'optional',
      },
    },
    ctx.fusebit.functionAccessToken
  );

  return { status: 200, body: { status: 200 } };
};
