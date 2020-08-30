const { AbstractDirectiveResolver } = require("./AbstractDirectiveResolver");

export class ComponentsResolver extends AbstractDirectiveResolver {

	/**
	 * Constructor
	 * @param {*} componentsLibrary A map that contains all the registered
	 * components that can be injected.
	 */
	constructor(customAttributes) {
		super();
		this._componentsLibrary = {};
		this._customAttributes = customAttributes;
	}

	registerComponent(name, component) {
		this._componentsLibrary[name] = component;
	}

	resolve(node, model) {
		let elements = node.querySelectorAll("[data-component]");
		if (elements.length > 0) {
			elements.forEach(templateElement => {
				let componentName = templateElement.getAttribute("data-component");
				let dataRoot = templateElement.getAttribute("data-root");
				this._deployComponent(templateElement, componentName, dataRoot);
			});
			this.resolve(node, model);
		}
	}

	_deployComponent(templateElement, componentName, dataRoot) {
		templateElement.innerHTML = this._componentsLibrary[componentName].template;
		let element = templateElement.firstChild;
		this._customAttributes.forEach(attributeName => {
			this._copyAttributes(attributeName, templateElement, element);
		});
		templateElement.parentElement.insertBefore(element, templateElement);
		templateElement.parentElement.removeChild(templateElement);

		if (dataRoot !== null && dataRoot !== "") {
			this._customAttributes.forEach(attribute => {
				this._inject(attribute, element, dataRoot);
			});
		}
	}

	_copyAttributes(attributeName, templateElement, element) {
		let attr = templateElement.getAttribute(attributeName);

		console.log(attributeName);
		console.log(attr);

		if (attr != null) {
			element.setAttribute(attributeName, attr);
		}
	}

	_inject(attributeName, parent, dataForeachAttribute) {
		parent.querySelectorAll(`[${attributeName}]`)
			.forEach(child => {
				let attr = child.getAttribute(attributeName);
				attr = `${dataForeachAttribute}.${attr}`;
				child.setAttribute(attributeName, attr);
			});
	}
}

module.exports.ComponentsResolver = ComponentsResolver;