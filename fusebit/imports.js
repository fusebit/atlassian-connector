const fs = require('fs');

const { getPackageFiles } = require('./utility');

const name = 'Atlassian';

let basePath;
let extraTemplateFiles = {
  'imports.js': fs.readFileSync(__dirname + '/imports.js', { encoding: 'utf8' }),
  'utility.js': fs.readFileSync(__dirname + '/utility.js', { encoding: 'utf8' }),
};

const libPath = __dirname + '/lib';

if (fs.existsSync(libPath) && fs.lstatSync(libPath).isDirectory()) {
  basePath = '.';
  extraTemplateFiles = {
    ...extraTemplateFiles,
    ...getPackageFiles(libPath, __dirname + '/'),
  };
} else {
  basePath = `@fusebit/${name.toLowerCase()}-connector`;
}

exports.ConnectorName = name;
exports.ConnectorClass = require(`${basePath}/lib/connector`)[`${name}Connector`];
exports.createConnectorClass = require(`${basePath}/lib/connector`)[`create${name}Connector`];
exports.Dependencies = require('./package.json').dependencies;
exports.Manager = require(`${basePath}/lib/manager`);
exports.ExtraTemplateFiles = extraTemplateFiles;
