const { findProperty } = require("../../Util");
const { AbstractDirectiveResolver } = require("./AbstractDirectiveResolver");

class IfElseResolver extends AbstractDirectiveResolver {
	
	constructor(){
		super();
		this._watchedProperties = [];
	}

	resolve(node, model) {
		let elements = node.querySelectorAll("[data-if]");
		elements.forEach(element => {
			let attribute = element.getAttribute("data-if");
			let binding = this._parse(attribute);
			
			if(!this._watchedProperties.includes(binding.path)){
				this._watchedProperties.push(binding.path);
			}

			let prop = findProperty(model, binding.path);
			if (!IfElseResolver.evaluateProp(prop)) {
				element.parentElement.removeChild(element);
			}
			element.removeAttribute("data-if");
		});

		elements = node.querySelectorAll("[data-else]");
		elements.forEach(element => {
			let attribute = element.getAttribute("data-else");
			let binding = this._parse(attribute);
			let prop = findProperty(model, binding.path);
			if (IfElseResolver.evaluateProp(prop)) {
				element.parentElement.removeChild(element);
			}
			element.removeAttribute("data-else");
		});
	}

	// eslint-disable-next-line no-unused-vars
	modelChanged(model, propertyName, oldValue, newValue) {
		let mustRebuild = this._watchedProperties.reduce((acc, path) => {
			acc |= path.startsWith(propertyName);
		}, false);
		return mustRebuild;
	}

	_parse(attribute){
		try{
            attribute = attribute.replace(/'/g, "\"");
            let parsed = JSON.parse(attribute);
            return parsed;
        } catch(e){
            throw new Error(`Invalid format: ${attribute}`);
        }
	}

	static evaluateProp(prop) {
		return !(prop === 0 || prop === false || prop === null || (Array.isArray(prop) && prop.length === 0) || prop === "" || prop === "false");
	}
}

module.exports.IfElseResolver = IfElseResolver;