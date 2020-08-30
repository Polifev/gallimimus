const { AbstractDirectiveResolver } = require("./AbstractDirectiveResolver");
const { findProperty, setProperty } = require("../../Util");

const BindMode = {
	ONE_WAY: "oneway",
	TWO_WAYS: "twoways",
	ONE_WAY_TO_SOURCE: "onewaytosource"
};

class BindResolver extends AbstractDirectiveResolver {
	constructor() {
		super();
		this._activeListeners = [];
		this._passiveListeners = [];
	}

	resolve(node, model) {
		this._activeListeners = [];
		this._passiveListeners = [];

		let elements = node.querySelectorAll("[data-bind]");
		elements.forEach(element => {
			let attribute = element.getAttribute("data-bind");
			let binding = this._parse(attribute);

			if (binding.mode === BindMode.ONE_WAY || binding.mode === BindMode.TWO_WAYS) {
				this._apply(element, binding.target, model, binding.path);
			}
			if (binding.mode === BindMode.ONE_WAY_TO_SOURCE || binding.mode === BindMode.TWO_WAYS) {
				this._bind(element, binding.target, model, binding.path);
			}
			element.removeAttribute("data-bind");
		});
	}

	userInput(e) {
		this._activeListeners.forEach(l => l(e));
	}

	modelChanged(model, path) {
		this._passiveListeners.forEach(l => l(model, path));
	}

	_parse(attribute) {
		let parts = attribute.split(",");
		return {
			path: parts[0],
			mode: parts[1] || BindMode.ONE_WAY,
			target: parts[2] || "innerHTML"
		};
	}

	_apply(element, target, model, path) {
		element[target] = findProperty(model, path);

		this._passiveListeners.push((m, p) => {
			if (p === path) {
				element[target] = findProperty(m, p);
			}
		});
	}

	_bind(element, target, model, path) {
		this._activeListeners.push((e) => {
			if (e.target === element) {
				setProperty(model, path, this._read(e.target, target));
			}
		});
	}

	_read(element, target) {
		return element[target];
	}
}

module.exports.BindResolver = BindResolver;