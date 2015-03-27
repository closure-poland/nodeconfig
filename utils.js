module.exports.putValue = function putValue(object, pathString, value, separator, stripLevel){
	if(!separator){
		separator = '.';
	}
	if(!stripLevel || isNaN(stripLevel)){
		stripLevel = 0;
	}
	// Traverse a path into the object and set a value.
	var pathComponents = pathString.split(separator).slice(stripLevel);
	var currentNode = object;
	for(var i = 0; i < (pathComponents.length - 1); ++i){
		var componentName = pathComponents[i];
		if(!currentNode[componentName])
		{
			currentNode[componentName] = {};
		}
		currentNode = currentNode[componentName];
	}
	// Now, currentNode points to the destination object. We simply set its property to our desired value.
	var lastComponentName = pathComponents[pathComponents.length - 1];
	currentNode[lastComponentName] = value;
};

module.exports.flattenNodes = function flattenNodes(configObject, leavesOnly){
	if(typeof(configObject) !== 'object' || configObject === null){
		return {};
	}
	
	function ConfigNode(path, value){
		if(!(this instanceof ConfigNode)){
			return new ConfigNode(path, value);
		}
		this.path = path;
		this.value = value;
	}
	
	var nodes = [];
	function indexNode(path, node){
		// First, index the node under its respective path that we've used to reach it:
		nodes.push(ConfigNode(path, node));
		// Then, process its contents, if any:
		if(typeof(node) === 'object' && node !== null){
			// Devise some special handling for Arrays. Even though Object.keys() currently only returns the numerical properties in Node.js, this should not be taken for granted.
			//  Additionally, a convenience "wrapper" is prepended and appended to surround the entire list in a "config block", as below:
			if(Array.isArray(node)){
				// Prepare the "before node". This is an informational node that marks the beginning of a list.
				var beforePath = path.concat([ ':list-start' ]);
				nodes.push(ConfigNode(beforePath, {
					length: node.length
				}));
				node.forEach(function traverseConfigObjectList(subNode, index){
					indexNode(path.concat([ index ]), subNode);
				});
				// Prepare the "after node", marking the end of the config object list.
				var afterPath = path.concat([ ':list-end' ]);
			}
			else{
				Object.keys(node).forEach(function traverseSubObjects(subNodeName){
					indexNode(path.concat([ subNodeName ]), node[subNodeName]);
				});
			}
		}
	}
	
	indexNode([], configObject);
	return nodes;
};
