class AbstractDirectiveResolver {
	constructor() {
		if (this.constructor === AbstractDirectiveResolver) {
			throw new TypeError("Abstract class \"AbstractDirectiveResolver\" cannot be instantiated.");
		}
	}

	/**
	 * Apply a process on html template
	 * @param {HTMLElement} node The template on which the process
	 * will be applied.
	 * @param {*} model The data that will be used in the process 
	 */
	// eslint-disable-next-line no-unused-vars
	resolve(node, model) {
		throw new Error("\"resolve\" is not implemented");
	}

	/**
	 * Asks if gallimimus should rebuild the document according to the model's modifications
	 * @param {*} model The model
	 * @param {String} propertyName The path to the property that changed
	 * @param {*} oldValue The old value of the property
	 * @param {*} newValue The new value of the property
	 */
	// eslint-disable-next-line no-unused-vars
	modelChanged(model, propertyName, oldValue, newValue) {
		return false;
	}
}

module.exports.AbstractDirectiveResolver = AbstractDirectiveResolver;