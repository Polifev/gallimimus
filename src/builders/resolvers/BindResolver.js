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
			let bindings = this._parse(attribute);

			bindings.forEach(binding => {
				if (binding.mode === BindMode.ONE_WAY || binding.mode === BindMode.TWO_WAYS) {
					this._apply(element, model, binding);
				}
				if (binding.mode === BindMode.ONE_WAY_TO_SOURCE || binding.mode === BindMode.TWO_WAYS) {
					this._bind(element, binding.target, model, binding.path);
				}
			});

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
		let result = [];
		let bindingStrings = attribute.split(";");
		bindingStrings.forEach(bindingString => {
			let parts = bindingString.split(",");
			let binding = {
				path: parts[0],
				mode: parts[1] || BindMode.ONE_WAY,
				target: parts[2] || "innerHTML",
				computeParts: []
			};
			for (let i = 3; i < parts.length; i++) {
				binding.computeParts.push(parts[i]);
			}
			result.push(binding);
		});
		return result;
	}

	_apply(element, model, binding) {
		element[binding.target] = findProperty(model, binding.path);

		this._passiveListeners.push((m, p) => {
			if (p === binding.path || binding.computeParts.includes(p)) {
				element[binding.target] = findProperty(m, binding.path);
			}
		});
	}

	_bind(element, targetProperty, model, path) {
		this._activeListeners.push((e) => {
			if (e.target === element) {
				setProperty(model, path, element[targetProperty]);
			}
		});
	}
}

module.exports.BindResolver = BindResolver;