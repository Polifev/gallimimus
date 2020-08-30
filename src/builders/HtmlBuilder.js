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
	buildDocument() {
		let node = this._htmlTemplate.cloneNode(true);
		this._directivesResolvers.forEach(r => {
			r.resolve(node, this._model);
		});
		return node;
	}
}

module.exports.HtmlBuilder = HtmlBuilder;