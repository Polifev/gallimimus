const { findProperty } = require("../../Util");
const { AbstractDirectiveResolver } = require("./AbstractDirectiveResolver");

const ELEMENT_MARKER = "$elt";

class ForeachResolver extends AbstractDirectiveResolver {

	/**
	 * Constructor
	 */
	constructor() {
		super();
		this._customAttributes = ["data-bind", "data-action", "data-if", "data-else", "data-foreach", "data-class"];
	}

	resolve(node, model) {
		let elements = node.querySelectorAll("[data-foreach]");
		if (elements.length > 0) {
			elements.forEach(element => {
				let dataForeachAttribute = element.getAttribute("data-foreach");
				let binding = this._parse(dataForeachAttribute);
				if (!binding.path.includes(ELEMENT_MARKER)) {
					this._duplicateElement(element, model, binding.path);
				}
			});
			this.resolve(node, model);
		}
	}

	_duplicateElement(element, model, dataForeachAttribute) {
		let list = findProperty(model, dataForeachAttribute);

		let parent = element.parentElement;
		let fragment = element.cloneNode(true);
		fragment.removeAttribute("data-foreach");


		for (let i = 0; i < list.length; i++) {
			let clone = fragment.cloneNode(true);
			parent.insertBefore(clone, element);
			this._customAttributes.forEach(attribute => {
				if (attribute === "data-foreach") {
					this._inject(attribute, clone, dataForeachAttribute, i);
				} else {
					this._inject(attribute, parent, dataForeachAttribute, i);
				}
			});

		}
		parent.removeChild(element);
	}

	_parse(attribute) {
		try {
			attribute = attribute.replace(/'/g, "\"");
			return JSON.parse(attribute);
		} catch (e) {
			throw new Error(`Invalid format: ${attribute}`);
		}
	}

	_inject(attributeName, parent, path, index) {
		parent.querySelectorAll(`[${attributeName}]`)
			.forEach(child => {
				let attr = child.getAttribute(attributeName);
				let parsed = JSON.parse(attr.replace(/'/g, "\""));
				parsed = Array.isArray(parsed) ? parsed : [parsed];

				parsed.map(props => {
					if (props.path) {
						props.path = this._resolvePath(props.path, path, index);
					}
					if (props.args) {
						props.args = props.args.map(path => this._resolvePath(path, path, index));
					}
					return props;
				});
				if (parsed.length == 1) {
					parsed = parsed[0];
				}
				child.setAttribute(attributeName, JSON.stringify(parsed).replace(/"/g, "'"));
			});
	}

	_resolvePath(path, dataForeachAttribute, index) {
		let markerIndex = path.indexOf(ELEMENT_MARKER);
		if (markerIndex >= 0) {
			path = path.substring(markerIndex + ELEMENT_MARKER.length);
			path = `${dataForeachAttribute}.${index}${path}`;
		}
		return path;
	}
}

module.exports.ForeachResolver = ForeachResolver;