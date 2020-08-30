const { findProperty } = require("../../Util");
const { AbstractDirectiveResolver } = require("./AbstractDirectiveResolver");

class IfElseResolver extends AbstractDirectiveResolver {
	resolve(node, model) {
		let elements = node.querySelectorAll("[data-if]");
		elements.forEach(element => {
			let dataAttribute = element.getAttribute("data-if");
			let prop = findProperty(model, dataAttribute);
			if (!IfElseResolver.evaluateProp(prop)) {
				element.parentElement.removeChild(element);
			}
			element.removeAttribute("data-if");
		});

		elements = node.querySelectorAll("[data-else]");
		elements.forEach(element => {
			let dataAttribute = element.getAttribute("data-else");
			let prop = findProperty(model, dataAttribute);
			if (IfElseResolver.evaluateProp(prop)) {
				element.parentElement.removeChild(element);
			}
			element.removeAttribute("data-else");
		});
	}

	static evaluateProp(prop) {
		return !(prop === 0 || prop === false || prop === null || (Array.isArray(prop) && prop.length === 0) || prop === "" || prop === "false");
	}
}

module.exports.IfElseResolver = IfElseResolver;