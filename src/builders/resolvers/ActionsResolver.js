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
            let binding = this._parse(attribute);
            this._bind(element, binding.event, model, binding.path);
            element.removeAttribute("data-action");
        });
    }

    userAction(e) {
        this._actions.forEach(action => action(e));
    }

    _parse(attributeValue) {
        let parts = attributeValue.split(",");
        return {
            path: parts[0],
            event: parts[1] || "click",
        };
    }

    _bind(element, event, model, path) {
        let action = (e) => {
            if (e.target === element && e.type === event) {
                // If point index === -1, all is good too
                let pointIndex = path.lastIndexOf(".");
                let parentPath = path.substring(0, pointIndex);
                let functionName = path.substring(pointIndex + 1);
                let parent = findProperty(model, parentPath);
                parent[functionName]();
            }
        };
        this._actions.push(action);
    }
}

module.exports.ActionsResolver = ActionsResolver;
