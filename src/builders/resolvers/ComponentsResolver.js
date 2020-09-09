const { AbstractDirectiveResolver } = require("./AbstractDirectiveResolver");

class ComponentsResolver extends AbstractDirectiveResolver {

	/**
	 * Constructor
	 * @param {*} componentsLibrary A map that contains all the registered
	 * components that can be injected.
	 */
	constructor() {
		super();
		this._componentsLibrary = {};
		this._customAttributes = ["data-component","data-bind", "data-action", "data-if", "data-else", "data-foreach", "data-class"];
	}

	registerComponent(name, component) {
		this._componentsLibrary[name] = component;
	}

	resolve(node, model) {
		let elements = node.querySelectorAll("[data-component]");
		if (elements.length > 0) {
			elements.forEach(templateElement => {
				let component = this._parse(templateElement.getAttribute("data-component"));
				this._deployComponent(templateElement, component.name, component.path);
			});
			this.resolve(node, model);
		}
	}

	_deployComponent(templateElement, componentName, dataRoot) {
		templateElement.innerHTML = this._componentsLibrary[componentName].template;
		let element = templateElement.firstChild;

		if (dataRoot !== null && dataRoot !== "") {
			this._customAttributes.forEach(attribute => {
				this._inject(attribute, element, dataRoot);
			});
		}

		this._customAttributes.forEach(attributeName => {
			this._copyAttributes(attributeName, templateElement, element);
		});

		templateElement.parentElement.insertBefore(element, templateElement);
		templateElement.parentElement.removeChild(templateElement);
		element.removeAttribute("data-component");
	}

	_copyAttributes(attributeName, templateElement, element) {
		let attr = templateElement.getAttribute(attributeName);
		if (attr != null) {
			element.setAttribute(attributeName, attr);
		}
	}

	_parse(attribute) {
		try {
			let result = JSON.parse(attribute.replace(/'/g, "\""));
			result.path = result.path || "";
			return result;
		} catch (e) {
			throw new Error(`Invalid format: ${attribute}`);
		}
	}

	_inject(attributeName, parent, dataRoot) {
		let elts = [];
		parent.querySelectorAll(`[${attributeName}]`).forEach(child => elts.push(child));
		if(parent.hasAttribute(attributeName)){
			elts.push(parent);
		}
			
		elts.forEach(child => {
			let attr = child.getAttribute(attributeName);
			let parsed = JSON.parse(attr.replace(/'/g, "\""));
			parsed = Array.isArray(parsed) ? parsed : [parsed];

			parsed.map(props => {
				if (props.path) {
					props.path = this._resolvePath(props.path, dataRoot);
				}
				if (props.args) {
					props.args = props.args.map(path => this._resolvePath(path, dataRoot));
				}
				return props;
			});
			if (parsed.length == 1) {
				parsed = parsed[0];
			}
			child.setAttribute(attributeName, JSON.stringify(parsed).replace(/"/g, "'"));
		});
	}

	_resolvePath(path, dataRoot){
		if(path === "")
			return dataRoot;
		else
			return `${dataRoot}.${path}`;
	}
}

module.exports.ComponentsResolver = ComponentsResolver;