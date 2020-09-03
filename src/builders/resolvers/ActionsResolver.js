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

    _parse(attribute){
        try{
            attribute = attribute.replace(/'/g, "\"");
            let parsed = JSON.parse(attribute);
            let bindings = Array.isArray(parsed) ? parsed : [parsed];
            bindings.map(binding => {
                binding.event = binding.event || "click";
                binding.args = binding.args || [];
                return binding;
            });
            return bindings;
        } catch(e){
            throw new Error(`Invalid format: ${attribute}`);
        }
    }

    _bind(element, model, binding) {
        let action = (e) => {
            if (e.target === element && e.type === binding.event) {
                // If point index === -1, all is good too
                let pointIndex = binding.path.lastIndexOf(".");
                let parentPath = binding.path.substring(0, pointIndex);
                let functionName = binding.path.substring(pointIndex + 1);
                let parent = findProperty(model, parentPath);
                let functionArguments = binding.args.map(argumentPath => findProperty(model, argumentPath));
                if(parent[functionName]) {
                        parent[functionName].apply(parent, functionArguments); 
                }
            }
        };
        this._actions.push(action);
    }
}

module.exports.ActionsResolver = ActionsResolver;
