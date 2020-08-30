class AbstractDirectiveResolver{
    constructor(){
        if (this.constructor === AbstractDirectiveResolver) {
            throw new TypeError("Abstract class \"AbstractDirectiveResolver\" cannot be instantiated.");
        }
    }

    /**
     * Apply a process on html template
     * @param {HTMLElement} node The template on which the process
     * will be applied.
     * @param {*} model The data that will be used in the process 
     */
    // eslint-disable-next-line no-unused-vars
    resolve(node, model){
        throw new Error("\"resolve\" is not implemented");
    }
}

module.exports.AbstractDirectiveResolver = AbstractDirectiveResolver;