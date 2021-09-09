const { HtmlBuilder } = require("./builders/HtmlBuilder");
const { ForeachResolver } = require("./builders/resolvers/ForeachResolver");
const { IfElseResolver } = require("./builders/resolvers/IfElseResolver");
const { BindResolver } = require("./builders/resolvers/BindResolver");
const { ActionsResolver } = require("./builders/resolvers/ActionsResolver");
const { ComponentsResolver } = require("./builders/resolvers/ComponentsResolver");
const { Component } = require("./Component");
const { ClassResolver } = require("./builders/resolvers/ClassResolver");
const ACTION_EVENTS = require("./EventsList");
const INPUT_EVENTS = ["input"];
const { ModelTrap } = require("./ModelTrap");

class Gallimimus {
	constructor() {
		this._componentsResolver = new ComponentsResolver(["data-bind", "data-action", "data-if", "data-else", "data-foreach", "data-root", "data-class"]);
		this._foreachResolver = new ForeachResolver();
		this._ifElseResolver = new IfElseResolver();
		this._bindResolver = new BindResolver();
		this._actionsResolver = new ActionsResolver();
		this._classResolver = new ClassResolver();

		this.resolvers = [
			this._componentsResolver,
			this._foreachResolver,
			this._ifElseResolver,
			this._bindResolver,
			this._actionsResolver,
			this._classResolver
		];

		this._reloadNeeded = false;
		this._builder = null;
	}

	load(appRootId, document, model) {
		let self = this;

		let root = document.getElementById(appRootId);
		let rootClone = root.cloneNode(true);

		let modelTrap = new ModelTrap("");
		let modelProxy = new Proxy(model, modelTrap);
		modelTrap.onPropertyChanged = (path, oldValue, newValue) => {
			for (let i = 0; i < self.resolvers.length; i++) {
				self._reloadNeeded |= self.resolvers[i].modelChanged(modelProxy, path, oldValue, newValue);
			}
		};
		if (modelProxy.init) {
			modelProxy.init();
		}
		this._reloadNeeded = false;

		this._builder = new HtmlBuilder(modelProxy, rootClone)
			.withDirectiveResolver(this._componentsResolver)
			.withDirectiveResolver(this._foreachResolver)
			.withDirectiveResolver(this._ifElseResolver)
			.withDirectiveResolver(this._bindResolver)
			.withDirectiveResolver(this._actionsResolver)
			.withDirectiveResolver(this._classResolver);

		INPUT_EVENTS.forEach(eventName => document.addEventListener(eventName, (e) => this._bindResolver.userInput(e)));
		ACTION_EVENTS.forEach(eventName => document.addEventListener(eventName, (e) => this._actionsResolver.userAction(e)));

		setInterval(() => {
			if (this._reloadNeeded) {
				this._reloadNeeded = false;
				this.reload(appRootId, document, model);
			}
		}, 100);
		this.reload(appRootId, document);
		return modelProxy;
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

// Exports
module.exports.Gallimimus = Gallimimus;
module.exports.Component = Component;
