var ConfigProvider = require('./ConfigProvider');
var fs = require('fs');
var yaml = require('js-yaml');

function customize(baseProviderConstructor) {
	function YAMLFileConfigProvider(filename) {
		var provider = new baseProviderConstructor();
		fs.readFile(filename, { encoding: 'utf8' }, function populateConfig(readError, fileContents) {
			try {
				if (readError) {
					throw readError;
				}
				var config = yaml.safeLoad(fileContents);
				provider.setConfig(config);
			}
			catch (error) {
				provider.getEmitter().emit('error', error);
			}
		});
		return provider.getEmitter();
	}
	return YAMLFileConfigProvider;
}

module.exports = customize(ConfigProvider);
module.exports.customize = customize;
