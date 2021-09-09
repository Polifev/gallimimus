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
					this._bind(element, binding.bindTo, model, binding.path);
				}
			});

			element.removeAttribute("data-bind");
		});
	}

	userInput(e) {
		this._activeListeners.forEach(l => l(e));
	}

	modelChanged(model, path, oldValue, newValue) {
		this._passiveListeners.forEach(l => l(model, path));
		return false;
	}

	_parse(attribute) {
		try {
			attribute = attribute.replace(/'/g, "\"");
			let parsed = JSON.parse(attribute);
			let bindings = Array.isArray(parsed) ? parsed : [parsed];
			bindings.map(binding => {
				binding.mode = binding.mode || "oneway";
				binding.bindTo = binding.bindTo || "innerHTML";
				binding.args = binding.args || [];
				return binding;
			});
			return bindings;
		} catch (e) {
			throw new Error(`Invalid format: ${attribute}`);
		}
	}

	_apply(element, model, binding) {
		element[binding.bindTo] = findProperty(model, binding.path);

		this._passiveListeners.push((m, p) => {
			if (p === binding.path || binding.args.includes(p)) {
				element[binding.bindTo] = findProperty(m, binding.path);
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