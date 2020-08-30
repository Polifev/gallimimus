const assert = require("assert");
const { JSDOM } = require("jsdom");
const { ActionsResolver } = require("../../../src/builders/resolvers/ActionsResolver");

describe("ActionsResolver", () => {
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
				<button id="btn" data-action="foo"></button>
				<input id="input" data-action="foo,change" />
			</div>
        </body>
        </html>
        `);
		global.window = dom.window;
		global.document = dom.window.document;
	});

	it("binds click event by default from document to a model function)", () => {
		let callCount = 0;
		let model = {
			foo() {
				callCount++;
			}
		};

		let resolver = new ActionsResolver();
		resolver.resolve(document.getElementById("app"), model);
		document.addEventListener("click", e => resolver.userAction(e));

		let evt = document.createEvent("MouseEvents");
		evt.initEvent("click", true, false);
		document.getElementById("btn").dispatchEvent(evt);

		assert.equal(callCount, 1);
	});

	it("binds specific event from document to a model function", () => {
		let callCount = 0;
		let model = {
			foo() {
				callCount++;
			}
		};

		let resolver = new ActionsResolver();
		resolver.resolve(document.getElementById("app"), model);
		document.addEventListener("click", e => resolver.userAction(e));
		document.addEventListener("change", e => resolver.userAction(e));

		let evt = document.createEvent("Event");
		evt.initEvent("change", true, false);
		document.getElementById("input").dispatchEvent(evt);

		assert.equal(callCount, 1);
	});

	it("lets model access \"this\" property", () => {
		let r = 0;
		let model = {
			answer: 42,
			foo() {
				r = this.answer;
			}
		};

		let resolver = new ActionsResolver();
		resolver.resolve(document.getElementById("app"), model);
		document.addEventListener("click", e => resolver.userAction(e));
		document.addEventListener("change", e => resolver.userAction(e));

		let evt = document.createEvent("Event");
		evt.initEvent("change", true, false);
		document.getElementById("input").dispatchEvent(evt);

		assert.equal(r, 42);
	});
});