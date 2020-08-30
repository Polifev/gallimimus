const { findProperty } = require("../../Util");
const { AbstractDirectiveResolver } = require("./AbstractDirectiveResolver");

const ELEMENT_MARKER = "$elt";

class ForeachResolver extends AbstractDirectiveResolver {

	/**
	 * Constructor
	 * @param {string[]} customAttributes A list of the custom attributes used in the template
	 */
	constructor(customAttributes) {
		super();
		this._customAttributes = customAttributes;
	}

	resolve(node, model) {
		let elements = node.querySelectorAll("[data-foreach]");
		if (elements.length > 0) {
			elements.forEach(element => {
				let dataForeachAttribute = element.getAttribute("data-foreach");
				if (!dataForeachAttribute.includes(ELEMENT_MARKER)) {
					this._duplicateElement(element, model, dataForeachAttribute);
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

	_inject(attributeName, parent, dataForeachAttribute, index) {
		parent.querySelectorAll(`[${attributeName}]`)
			.forEach(child => {
				let attr = child.getAttribute(attributeName);
				let markerIndex = attr.indexOf(ELEMENT_MARKER);
				if (markerIndex >= 0) {
					attr = attr.substring(markerIndex + ELEMENT_MARKER.length);
					attr = `${dataForeachAttribute}.${index}${attr}`;
					child.setAttribute(attributeName, attr);
				}
			});
	}
}

module.exports.ForeachResolver = ForeachResolver;