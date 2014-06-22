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
	var nodes = {};
	function _indexNodes(prefix, node){
		var subNode;
		for(var subNodeName in node){
			subNode = node[subNodeName];
			// Check whether this is a node containing other values or a leaf:
			if(typeof(subNode) === 'object' && subNode !== null){
				_indexNodes(prefix + subNodeName + '.', subNode);
				if(!leavesOnly){
					nodes[prefix + subNodeName] = subNode;
				}
			}
			else{
				nodes[prefix + subNodeName] = subNode;
			}
		}
	}
	_indexNodes('', configObject);
	return nodes;
};
