const assert = require("assert");
const { JSDOM } = require("jsdom");
const { BindResolver } = require("../../../src/builders/resolvers/BindResolver");

describe("BindResolver", () => {
	beforeEach(() => {
		let dom = new JSDOM(`
        <!DOCTYPE>
        <html lang="en">
        <head>
            <title>test page</title>
            <meta charset="utf-8"/>
        </head>
        <body>
			<div id="app">
				<span id="span" data-bind="{'path':'foo'}"></span>
				<input id="input1" data-bind="{'path':'foo','mode':'twoways','bindTo':'value'}" />
				<input id="input2" data-bind="{'path':'foo','mode':'onewaytosource','bindTo':'value'}" />
				<input id="input3" data-bind="{'path':'foo','bindTo':'value'}" />
				<span id="computed" data-bind="{'path':'foo', 'args':['bar']}"></span>
				<span data-bind="[{'path':'foo'},{'path':'bar','bindTo':'id'}]"></span>
			</div>
        </body>
        </html>
        `);
		global.window = dom.window;
		global.document = dom.window.document;
	});

	it("inits the value in the bound attribute only if bindmode permit it", () => {
		let model = {
			foo: "Hello world",
			bar: "oops"
		};
		let resolver = new BindResolver();
		resolver.resolve(global.document.getElementById("app"), model);
		assert.equal(global.document.getElementById("span").innerHTML, model.foo);
		assert.equal(global.document.getElementById("input1").value, model.foo);
		assert.equal(global.document.getElementById("input2").value, "");
	});

	it("updates the value in the bound attribute only if bindmode permit it", () => {
		let model = {
			foo: "Hello world",
			bar: "oops"
		};
		let resolver = new BindResolver();
		resolver.resolve(global.document.getElementById("app"), model);

		model.foo = "Hello again";
		resolver.modelChanged(model, "foo");

		assert.equal(global.document.getElementById("span").innerHTML, model.foo);
		assert.equal(global.document.getElementById("input1").value, model.foo);
		assert.equal(global.document.getElementById("input2").value, "");
	});

	it("updates the model with the bound attribute in twoways mode", () => {
		let model = {
			foo: "Hello world",
			bar: "oops"
		};
		let resolver = new BindResolver();
		resolver.resolve(global.document.getElementById("app"), model);

		let input = global.document.getElementById("input1");
		input.value = "Hello again";
		global.document.addEventListener("input", e => resolver.userInput(e));

		let evt = global.document.createEvent("Event");
		evt.initEvent("input", true, false);
		input.dispatchEvent(evt);

		assert.equal(model.foo, input.value);
	});

	it("updates the model with the bound attribute in onewaytosource mode", () => {
		let model = {
			foo: "Hello world",
			bar: "oops"
		};
		let resolver = new BindResolver();
		resolver.resolve(global.document.getElementById("app"), model);

		let input = global.document.getElementById("input2");
		input.value = "Hello again";
		global.document.addEventListener("input", e => resolver.userInput(e));

		let evt = global.document.createEvent("Event");
		evt.initEvent("input", true, false);
		input.dispatchEvent(evt);

		assert.equal(model.foo, input.value);
	});

	it("doesn't Update the model with the bound attribute in oneway mode", () => {
		let model = {
			foo: "Hello world",
			bar: "oops"
		};
		let resolver = new BindResolver();
		resolver.resolve(global.document.getElementById("app"), model);

		let input = global.document.getElementById("input3");
		input.value = "Hello again";
		global.document.addEventListener("input", e => resolver.userInput(e));

		let evt = global.document.createEvent("Event");
		evt.initEvent("input", true, false);
		input.dispatchEvent(evt);

		assert.equal(model.foo, "Hello world");
	});

	it("updates computed fields based on their components", () => {
		let model = {
			bar: "Hello world",
			get foo() {
				return this.bar.toUpperCase();
			}
		};

		let resolver = new BindResolver();
		resolver.resolve(global.document.getElementById("app"), model);

		let span = global.document.getElementById("computed");
		assert.equal(span.innerHTML, model.foo);

		model.bar = "Hello again";
		resolver.modelChanged(model, "bar");
		assert.equal(span.innerHTML, model.foo);
	});

	it("can update multiple bindings", () => {
		let model = {
			foo: "Hello world",
			bar: "1456"
		};

		let resolver = new BindResolver();
		resolver.resolve(global.document.getElementById("app"), model);

		let span = global.document.getElementById(model.bar);
		assert.notEqual(span, null);
		assert.equal(span.innerHTML, model.foo);

	});
});