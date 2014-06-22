# NodeConfig #
NodeConfig is a library which provides the programmer with a means to inject configuration parameters into their program. It can serve as an alternative to loading and parsing config files.


# Usage - configured application #
NodeConfig is an event-based configuration injector. All ConfigProvider objects are EventEmitters. This means that your application waits for a config to appear before starting its services, like so:

```js
// Assume thar "provider" is an object - more about it below.
provider.once('config', function initializeApplication(configObject){
  server.listen(configObject.http.port);
});
```

Notice how the example above uses 'once'. That is because the application only supports a one-time initialization - it would be an error to call .listen() on the same server object twice in a row.
Were we to implement dynamic configuration refreshing for an HTTP server, it might look like the snippet below:

```js
var listening = false;
function startListening(port){
	if(listening){
		server.close();
	}
    server.listen(port);
	listening = true;
}

provider.on('config', function updateConfig(newConfig){
    startListening(newConfig.http.port);
});
```

Moreover, we can only listen to interesting keys of the config - instead of using 'config' as the event name, we can write:
```js
provider.on('config.http.port', function configurePort(newPort){
    startListening(newPort);
});
```


# Usage - configuration passing #
OK, so we've written an application which accepts configuration parameters from some "provider" object. But how do we get one to use, in the first place? By constructing one of the provided (ahem) providers, of course!

## Configuration providers ##
*(Note: right now, only one config provider is available. Stay tuned for more - patches are welcome!)*

### EnvironmentConfigProvider ###
Initialization:
```js
var NodeConfig = require('nodeconfig');
var provider = new NodeConfig.EnvironmentConfigProvider();
```
Config passing:
```sh
env 'config.http.port=number:1337' 'config.http.banner=string:Hello, world!' node YourServer.js
```
*(Or you can use Node's child_process to spawn another Node instance and pass the config variables)*


# Development roadmap #
One of the first features to implement next will be alternative configuration providers (including some that actually support configuration refreshing) and working test cases for the ConfigurationProvider's EventEmitter interface.

A code refactoring would also probably be useful along the way, so that config tree splitting on dots and mass-publishing happens in another layer. This is not trivial, since, at some point, I would like to add config deduplication (i.e. only emitting changed keys).