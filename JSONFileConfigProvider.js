var ConfigProvider = require('./ConfigProvider');
var fs = require('fs');

function customize(baseProviderConstructor) {
	function JSONFileConfigProvider(filename) {
		var provider = new baseProviderConstructor();
		fs.readFile(filename, { encoding: 'utf8' }, function populateConfig(err, data) {
			if(err) {
				console.error(err);
				provider.getEmitter().emit('error', err);
				return;
			}
			var config = JSON.parse(data);
			provider.setConfig(config);
		});
		return provider.getEmitter();
	}
	return JSONFileConfigProvider;
}

module.exports = customize(ConfigProvider);
module.exports.customize = customize;
