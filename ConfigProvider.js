var util = require('util');
var EventEmitter2 = require('eventemitter2').EventEmitter2;
var flattenNodes = require('./utils').flattenNodes;

var separator = '.';

function customize(baseEmitterConstructor, delimiter){
	if(typeof(baseEmitterConstructor.prototype.emit) !== 'function'){
		throw new Error('The passed base emitter prototype does not have an "emit" method!');
	}
	
	function ConfigProvider(){
		var actualEmitter = new baseEmitterConstructor({
			wildcard: true,
			delimiter: delimiter,
			newListener: true
		});
		var currentConfig = null;
		var configEventPrefix = 'config';
		var self = this;
		
		this.emitConfig = function emitConfig(config, emitter){
			// Get a list of all config nodes, suitable for immediate delivery:
			var configNodes = flattenNodes(config);
			// Emit the config objects in the order received:
			configNodes.forEach(function emitConfigNode(node){
				// Emit an event named after the node path, prefixed by the config event name prefix:
				var eventName = [ configEventPrefix ].concat(node.path);
				emitter.emit(eventName, node.value, eventName.join(delimiter));
			});
		};
		
		this.setConfig = function setConfig(newConfig){
			// Update our stored config.
			currentConfig = newConfig;
			// Emit the new config.
			this.emitConfig(newConfig, actualEmitter);
		};
		
		this.getEmitter = function getEmitter(){
			return actualEmitter;
		};
		
		actualEmitter.on('newListener', function(eventName, listener){
			if(currentConfig){
				// Pass the config to the new listener only.
				var temporaryEmitter = new baseEmitterConstructor({
					wildcard: true,
					delimiter: delimiter,
					newListener: true
				});
				temporaryEmitter.on(eventName, listener);
				self.emitConfig(currentConfig, temporaryEmitter);
			}
		});
	}
	return ConfigProvider;
}

module.exports = customize(EventEmitter2, '.');
module.exports.customize = customize;