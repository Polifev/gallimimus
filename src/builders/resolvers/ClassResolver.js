const { AbstractDirectiveResolver } = require("./AbstractDirectiveResolver");
const { findProperty } = require("../../Util");

const ClassMode = {
	TEXT: "text",
	TOGGLE: "toggle"
};

class ClassResolver extends AbstractDirectiveResolver {
	constructor() {
		super();
		this._activeListeners = [];
		this._passiveListeners = [];
	}

	resolve(node, model) {
		this._activeListeners = [];
		this._passiveListeners = [];

		let elements = node.querySelectorAll("[data-class]");
		elements.forEach(element => {
			let attribute = element.getAttribute("data-class");
			let bindings = this._parse(attribute);

			bindings.forEach(binding => {
				this._apply(element, model, binding);
			});

			element.removeAttribute("data-class");
		});
	}

	modelChanged(model, path) {
		this._passiveListeners.forEach(l => l(model, path));
		return false;
	}

	_parse(attribute) {
		try {
			attribute = attribute.replace(/'/g, "\"");
			let parsed = JSON.parse(attribute);
			let bindings = Array.isArray(parsed) ? parsed : [parsed];
			bindings.map(binding => {
				binding.mode = binding.mode || "text";
				binding.args = binding.args || [];
				binding.removeOldClass = function () { };
				return binding;
			});
			return bindings;
		} catch (e) {
			throw new Error(`Invalid format: ${attribute}`);
		}

		/*
		let result = [];
		let bindingStrings = attribute.split(";");
		bindingStrings.forEach(bindingString => {
			let parts = bindingString.split(",");
			let binding = {
				path: parts[0],
				mode: parts[1] || ClassMode.TEXT,
				className: parts[2] || "",
				computeParts: [],
				removeOldClass: function () { }
			};
			let start = binding.mode == ClassMode.TEXT ? 2 : 3;
			for (let i = start; i < parts.length; i++) {
				binding.args.push(parts[i]);
			}
			result.push(binding);
		});
		return result;
		*/
	}

	_apply(element, model, binding) {
		if (binding.mode === ClassMode.TOGGLE) {
			element.classList.toggle(binding.class, findProperty(model, binding.path));
		} else if (binding.mode === ClassMode.TEXT) {
			binding.removeOldClass();
			let className = findProperty(model, binding.path);
			if (className !== "") {
				binding.removeOldClass = () => element.classList.remove(className);
				element.classList.add(className);
			}
		}

		this._passiveListeners.push((m, p) => {
			if (p === binding.path || binding.args.includes(p)) {
				if (binding.mode === ClassMode.TOGGLE) {
					element.classList.toggle(binding.class, findProperty(model, binding.path));
				} else if (binding.mode === ClassMode.TEXT) {
					binding.removeOldClass();
					let className = findProperty(model, binding.path);
					if (className !== "") {
						binding.removeOldClass = () => element.classList.remove(className);
						element.classList.add(className);
					}
				}
			}
		});
	}
}

module.exports.ClassResolver = ClassResolver;