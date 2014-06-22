var ConfigProvider = require('./ConfigProvider');
var putValue = require('./utils').putValue;

var pathSeparator = '.';
var typeSeparator = ':';

function restoreValueFromString(variableName, variableValue){
	var separatorIndex = variableValue.indexOf(typeSeparator);
	if(separatorIndex < 0){
		throw new Error('Malformed environment variable (' + variableName + ') - no type specification (should be "type:value")');
	}
	var targetType = variableValue.substr(0, separatorIndex);
	var rawValue = variableValue.substr(separatorIndex + 1);
	switch(targetType){
		case 'string':
			return String(rawValue);
		case 'boolean':
			return (rawValue === 'true') ? true : false;
		case 'number':
			return Number(rawValue);
		case 'null':
			return null;
		default:
			throw new Error('Malformed environment variable (' + variableName + ') - type specification invalid (' + targetType + ')');
	}
}

function customize(baseProviderConstructor){
	function EnvironmentConfigProvider(){
		var provider = new baseProviderConstructor();
		setImmediate(function(){
			// Read the environment variables and process into a config tree.
			var environmentVariables = process.env;
			var config = Object.keys(environmentVariables).filter(function configVariablesOnly(variableName){
				return (/^config\./.test(variableName));
			}).reduce(function buildConfigObject(configObject, variableName){
				var variableValue = environmentVariables[variableName];
				var targetValue = restoreValueFromString(variableName, variableValue);
				putValue(configObject, variableName, targetValue, pathSeparator, 1);
				return configObject;
			}, {});
			provider.setConfig(config);
		});
		return provider.getEmitter();
	}
	return EnvironmentConfigProvider;
}

function tagValue(variableValue){
	var sourceType = typeof(variableValue);
	switch(sourceType){
		case 'string':
			return 'string' + typeSeparator + variableValue;
		case 'boolean':
			return 'boolean' + typeSeparator + (variableValue ? 'true' : 'false');
		case 'number':
			return 'number' + typeSeparator + String(variableValue);
		case 'object':
			if(variableValue === null){
				return 'null' + typeSeparator + 'null';
			}
			else{
				throw new Error('Only null objects are supported as config leaf values!');
			}
		default:
			throw new Error('Unsupported variable type, can not prepare for exporting (via EnvironmentConfigProvider)!');
	}
}

module.exports = customize(ConfigProvider);
module.exports.customize = customize;
module.exports.tagValue = tagValue;
