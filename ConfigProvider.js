var util = require('util');
var EventEmitter = require('events').EventEmitter;
var flattenNodes = require('./utils').flattenNodes;

var separator = '.';

function customize(baseEmitterConstructor){
	if(typeof(baseEmitterConstructor.prototype.emit) !== 'function'){
		throw new Error('The passed base emitter prototype does not have an "emit" method!');
	}
	
	function ConfigProvider(){
		var actualEmitter = new baseEmitterConstructor();
		var currentConfig = null;
		var configEventName = 'config';
		
		this.emitConfig = function emitConfig(config, emitter){
			// Get a key=>value list of all config nodes.
			var allSubNodes = flattenNodes(config);
			// Since the main (top-level) config object is not included in the list, we need to handle it explicitly. We choose to do it first.
			emitter.emit(configEventName, config);
			// Also emit all sub-nodes (including tree leaves) in "namespaced" events.
			Object.keys(allSubNodes).forEach(function emitConfigSubNode(subNodeName){
				emitter.emit(configEventName + separator + subNodeName, allSubNodes[subNodeName]);
			});
		};
		
		this.setConfig = function setConfig(newConfig){
			// Update our stored config. NOTE: This is unused at the moment.
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
				var temporaryEmitter = new baseEmitterConstructor();
				temporaryEmitter.on(eventName, listener);
				emitConfig(currentConfig, temporaryEmitter);
				delete temporaryEmitter;
			}
		});
	}
	return ConfigProvider;
}

module.exports = customize(EventEmitter);
module.exports.customize = customize;