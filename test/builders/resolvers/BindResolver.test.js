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
				<span id="span" data-bind="foo"></span>
				<input id="input1" data-bind="foo,twoways,value" />
				<input id="input2" data-bind="foo,onewaytosource,value" />
				<input id="input3" data-bind="foo,oneway,value" />
			</div>
        </body>
        </html>
        `);
		global.window = dom.window;
		global.document = dom.window.document;
	});

	it("inits the value in the bound attribute only if bindmode permit it", () => {
		let model = {
			foo: "Hello world"
		};
		let resolver = new BindResolver();
		resolver.resolve(document.getElementById("app"), model);
		assert.equal(document.getElementById("span").innerHTML, model.foo);
		assert.equal(document.getElementById("input1").value, model.foo);
		assert.equal(document.getElementById("input2").value, "");
	});

	it("updates the value in the bound attribute only if bindmode permit it", () => {
		let model = {
			foo: "Hello world"
		};
		let resolver = new BindResolver();
		resolver.resolve(document.getElementById("app"), model);

		model.foo = "Hello again";
		resolver.modelChanged(model, "foo");

		assert.equal(document.getElementById("span").innerHTML, model.foo);
		assert.equal(document.getElementById("input1").value, model.foo);
		assert.equal(document.getElementById("input2").value, "");
	});

	it("updates the model with the bound attribute in twoways mode", () => {
		let model = {
			foo: "Hello world"
		};
		let resolver = new BindResolver();
		resolver.resolve(document.getElementById("app"), model);

		let input = document.getElementById("input1");
		input.value = "Hello again";
		document.addEventListener("input", e => resolver.userInput(e));

		let evt = document.createEvent("Event");
		evt.initEvent("input", true, false);
		input.dispatchEvent(evt);

		assert.equal(model.foo, input.value);
	});

	it("updates the model with the bound attribute in onewaytosource mode", () => {
		let model = {
			foo: "Hello world"
		};
		let resolver = new BindResolver();
		resolver.resolve(document.getElementById("app"), model);

		let input = document.getElementById("input2");
		input.value = "Hello again";
		document.addEventListener("input", e => resolver.userInput(e));

		let evt = document.createEvent("Event");
		evt.initEvent("input", true, false);
		input.dispatchEvent(evt);

		assert.equal(model.foo, input.value);
	});

	it("doesn't Update the model with the bound attribute in oneway mode", () => {
		let model = {
			foo: "Hello world"
		};
		let resolver = new BindResolver();
		resolver.resolve(document.getElementById("app"), model);

		let input = document.getElementById("input3");
		input.value = "Hello again";
		document.addEventListener("input", e => resolver.userInput(e));

		let evt = document.createEvent("Event");
		evt.initEvent("input", true, false);
		input.dispatchEvent(evt);

		assert.equal(model.foo, "Hello world");
	});
});