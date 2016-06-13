var ConfigProvider = require('./ConfigProvider');
var fs = require('fs');

function customize(baseProviderConstructor) {
	function JSONFileConfigProvider(filename) {
		var provider = new baseProviderConstructor();
		fs.readFile(filename, { encoding: 'utf8' }, function populateConfig(readError, data) {
			try{
				if (readError) {
					throw readError;
				}
				var config = JSON.parse(data);
				provider.setConfig(config);
			}
			catch(error) {
				provider.getEmitter().emit('error', error);
			}
		});
		return provider.getEmitter();
	}
	return JSONFileConfigProvider;
}

module.exports = customize(ConfigProvider);
module.exports.customize = customize;
