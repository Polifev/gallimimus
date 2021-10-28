/**
 * A class that can build an html node based on a html-like template,
 * and a model that will be passed to a chain of directives resolvers
 */
class HtmlBuilder {
	/**
	 * Constructor
	 * @param {*} model A plain object that will hold data to be shown
	 * @param {HTMLElement} htmlTemplate The element that holds the template
	 * The HtmlTemplate is stored and will never be modified.
	 */
	constructor(model, htmlTemplate) {
		this._model = model;
		this._htmlTemplate = htmlTemplate;
		this._rootNode = undefined;
		this._directivesResolvers = [];
	}

	/**
	 * Add a directive resolver at the end of the document processing
	 * chain
	 * @param {AbstractDirectiveResolver} resolver An object that will handle a part of the document
	 * processing.
	 */
	withDirectiveResolver(resolver) {
		this._directivesResolvers.push(resolver);
		return this;
	}

	/**
	 * Construct an html document from the template and data using the given
	 * directive resolvers.
	 */
	buildDocument(document, appRootId) {
		let root = document.getElementById(appRootId);
		let focusedElement = document.activeElement;
		let focusedElementPath = childPath(focusedElement, this._rootNode);

		this._rootNode = this._htmlTemplate.cloneNode(true);
		this._directivesResolvers.forEach(r => {
			r.resolve(this._rootNode, this._model);
		});

		root.parentElement.insertBefore(this._rootNode, root);
		root.parentElement.removeChild(root);
		
		if(focusedElementPath !== null){
			getElementByPath(this._rootNode, focusedElementPath).focus();
		}
		
		return this._rootNode;
	}
}

function childPath(node, rootNode){
	let result;
	if(node.parentElement == null){
		result = null;
	}
	else if(node == rootNode){
		result = [];
	} else {
		let path = childPath(node.parentElement, rootNode);
		if(path == null){
			result = null;
		} else {
			path.push(childIndex(node));
			result = path;
		}
	}
	return result;
}

function childIndex(node){
	let ch = node.parentElement.children;
	for(let i = 0; i < ch.length; i++){
		if(ch[i] === node){
			return i;
		}
	}
}

function getElementByPath(root, path){
	let current = root;
	path.forEach(index => {
		current = current.children[index];
	});
	return current;
}

module.exports.HtmlBuilder = HtmlBuilder;