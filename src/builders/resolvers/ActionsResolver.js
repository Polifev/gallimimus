const { AbstractDirectiveResolver } = require("./AbstractDirectiveResolver");
const { findProperty } = require("../../Util");

class ActionsResolver extends AbstractDirectiveResolver {
    constructor() {
        super();
        this._actions = [];
    }

    resolve(node, model) {
        this._actions = [];

        let elements = node.querySelectorAll("[data-action]");
        elements.forEach(element => {
            let attribute = element.getAttribute("data-action");
            let bindings = this._parse(attribute);
            bindings.forEach(binding => {
                this._bind(element, model, binding);
            });

            element.removeAttribute("data-action");
        });
    }

    userAction(e) {
        this._actions.forEach(action => action(e));
    }

    _parse(attributeValue) {
        let result = [];
        let actionStrings = attributeValue.split(";");

        actionStrings.forEach(actionString => {
            let parts = actionString.split(",");
            let action = {
                path: parts[0],
                event: parts[1] || "click",
                arguments: []
            };
            for (let i = 2; i < parts.length; i++) {
                action.arguments.push(parts[i]);
            }
            result.push(action);
        });
        return result;
    }

    _bind(element, model, binding) {
        let action = (e) => {
            if (e.target === element && e.type === binding.event) {
                // If point index === -1, all is good too
                let pointIndex = binding.path.lastIndexOf(".");
                let parentPath = binding.path.substring(0, pointIndex);
                let functionName = binding.path.substring(pointIndex + 1);
                let parent = findProperty(model, parentPath);
                let functionArguments = binding.arguments.map(argumentPath => findProperty(model, argumentPath));
                parent[functionName].apply(parent, functionArguments);
            }
        };
        this._actions.push(action);
    }
}

module.exports.ActionsResolver = ActionsResolver;
