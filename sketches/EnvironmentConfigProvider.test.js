var EnvironmentConfigProvider = require('../index').EnvironmentConfigProvider;
var emitter = new EnvironmentConfigProvider();

emitter.on('config', console.log.bind(console, 'config:'));
emitter.on('config.http.port', console.log.bind(console, 'config.http.port:'));
