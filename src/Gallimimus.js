const { HtmlBuilder } = require("./builders/HtmlBuilder");
const { ForeachResolver } = require("./builders/resolvers/ForeachResolver");
const { IfElseResolver } = require("./builders/resolvers/IfElseResolver");
const { BindResolver } = require("./builders/resolvers/BindResolver");
const { ActionsResolver } = require("./builders/resolvers/ActionsResolver");
const { ComponentsResolver } = require("./builders/resolvers/ComponentsResolver");
const onChange = require("on-change");

class Gallimimus {
	constructor() {
		this._componentsResolver = new ComponentsResolver(["data-bind", "data-action", "data-if", "data-else", "data-foreach", "data-root"]);
		this._foreachResolver = new ForeachResolver(["data-bind", "data-action", "data-if", "data-else", "data-foreach"]);
		this._ifElseResolver = new IfElseResolver();
		this._bindResolver = new BindResolver();
		this._actionsResolver = new ActionsResolver();

		this._reloadNeeded = false;
		this._builder = null;
	}

	load(appRootId, document, model) {
		let self = this;
		const INPUT_EVENTS = ["input"];
		const ACTION_EVENTS = ["click", "change"];

		let root = document.getElementById(appRootId);
		let rootClone = root.cloneNode(true);

		// eslint-disable-next-line no-unused-vars
		let watchedModel = onChange(model, function (path, value, previousValue, name) {
			console.log(path);
			self._bindResolver.modelChanged(watchedModel, path);
			if (typeof value !== "string") {
				self._reloadNeeded = true;
			}
		});

		if (watchedModel.init) {
			watchedModel.init();
		}
		this._reloadNeeded = false;


		this._builder = new HtmlBuilder(watchedModel, rootClone)
			.withDirectiveResolver(this._componentsResolver)
			.withDirectiveResolver(this._foreachResolver)
			.withDirectiveResolver(this._ifElseResolver)
			.withDirectiveResolver(this._bindResolver)
			.withDirectiveResolver(this._actionsResolver);

		INPUT_EVENTS.forEach(eventName => document.addEventListener(eventName, (e) => this._bindResolver.userInput(e)));
		ACTION_EVENTS.forEach(eventName => document.addEventListener(eventName, (e) => this._actionsResolver.userAction(e)));

		setInterval(() => {
			if (this._reloadNeeded) {
				this._reloadNeeded = false;
				this.reload(appRootId, document, model);
			}
		}, 100);
		this.reload(appRootId, document);
	}

	registerComponent(name, component) {
		this._componentsResolver.registerComponent(name, component);
	}

	reload(appRootId, document) {
		console.log("(Re-)Building");
		let node = this._builder.buildDocument();

		let root = document.getElementById(appRootId);
		root.parentElement.insertBefore(node, root);
		root.parentElement.removeChild(root);
	}
}

module.exports.Gallimimus = Gallimimus;