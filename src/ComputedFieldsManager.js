const { findProperty, setProperty } = require("./Util");

class ComputedFieldsManager {
	constructor() {
		this._tree = {};
	}

	register(computedPath, computeFunction, argumentsPath) {
		argumentsPath.forEach(path => {
			if (this._tree[path] === undefined) {
				this._tree[path] = [];
			}
			this._tree[path].push(
				(model) => setProperty(
					model,
					computedPath,
					computeFunction(argumentsPath.map(arg => findProperty(model, arg))))
			);
		});
	}

	modelFullUpdate(model) {
		Object.keys(this._tree).forEach(path => {
			this.modelPartialUpdate(model, path);
		});
	}

	modelPartialUpdate(model, path) {
		let functions = this._tree[path];
		if (functions !== undefined) {
			functions.forEach(func => func(model));
		}
	}
}

module.exports.ComputedFieldsManager = ComputedFieldsManager;