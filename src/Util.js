/**
 * Get a property from a javascript object providing its path in
 * the given object.
 * @param {*} obj The object within the path will be resolved
 * @param {string} path A dot-separated path of properties (ex: user.address.roadname, users.18.firstname)
 * @returns {*} The value at given path in the given object.
 */
function findProperty(obj, path) {
	let pointIndex = path.indexOf(".");
	if (pointIndex !== -1) {
		let propName = path.substring(0, pointIndex);
		let subObj = obj[propName];
		if (subObj === undefined) {
			throw new Error("The path lead to an undefined value in the given object.");
		}
		return findProperty(subObj, path.substring(pointIndex + 1));
	} else {
		if(path === ""){
			return obj;
		}

		let field = obj[path];
		if (field === undefined) {
			throw new Error("The path lead to an undefined value in the given object.");
		}
		return field;
	}
}

/**
 * Set a property in a javascript object providing its path in the given
 * object. If the value isn't set before, an error will be thrown.
 * @param {*} obj The object within the path will be resolved
 * @param {string} path A dot-separated path of properties (ex: user.address.roadname, users.18.firstname)
 * @param {*} value The new value to be set in the object.
 */
function setProperty(obj, path, value){
	let pointIndex = path.lastIndexOf(".");
	if(pointIndex !== -1){
		let parentPath = path.substring(0, pointIndex);
		let valuePath = path.substring(pointIndex + 1);
		let parentObject = findProperty(obj, parentPath);
		if(parentObject[valuePath] === undefined){
			throw new Error("The path lead to an undefined value in the given object.");
		}
		parentObject[valuePath] = value;
	} else{
		if(obj[path] === undefined){
			throw new Error("The path lead to an undefined value in the given object.");
		}
		obj[path] = value;
	}
}

module.exports.findProperty = findProperty;
module.exports.setProperty = setProperty;