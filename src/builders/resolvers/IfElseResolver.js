const { findProperty } = require("../../Util");
const { AbstractDirectiveResolver } = require("./AbstractDirectiveResolver");

class IfElseResolver extends AbstractDirectiveResolver {
	resolve(node, model) {
		let elements = node.querySelectorAll("[data-if]");
		elements.forEach(element => {
			let attribute = element.getAttribute("data-if");
			let binding = this._parse(attribute);
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