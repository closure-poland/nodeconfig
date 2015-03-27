var ConfigProvider = require('../ConfigProvider');
var assert = require('assert');
var when = require('when');

describe('ConfigProvider', function() {
	describe('#setConfig', function() {
		it('should emit the entire config object passed to it', function() {
			var provider = new ConfigProvider();
			return when.promise(function(resolve, reject) {
				provider.getEmitter().on('config', function(config){
					try{
						assert.equal(config.someOption, 'someValue');
						resolve();
					}
					catch(error){
						reject(error);
					}
				});
				provider.setConfig({ someOption: 'someValue' });
			});
		});
		it.skip('should allow registering handlers that are triggered once per sub-node', function(){
			var provider = new ConfigProvider();
			provider.getEmitter().on('config.websites.*', function(websiteConfig, websiteName){
				console.log('* %s:', websiteName, websiteConfig);
			});
			provider.getEmitter().on('config.buzzwords:list-start', function(listInfo){
				console.log('* global keywords count: %d', listInfo.length);
			});
			provider.getEmitter().on('config.buzzwords.*', function(keyword){
				console.log('* keyword:', keyword);
			});
			provider.setConfig({
				websites: {
					froggle: {
						owner: 'Larry Rage'
					},
					racebook: {
						owner: 'Marek Cukiereg'
					}
				},
				buzzwords: [
					'meta',
					'business',
					'general',
					'news'
				]
			});
			
			//TODO: Remove this dummy timeout and make this an actual test case!
			return when.resolve().delay(5);
		});
	});
});