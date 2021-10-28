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
				<button id="btn" data-action="{'path':'foo'}">Ok</button>
				<input id="input" data-action="{'path':'foo','event':'change'}" />
				<input id="dblBindInput" data-action="[{'path':'foo','event':'click'},{'path':'bar','event':'change'}]" />
				<input id="dblBindInputSame" data-action="[{'path':'foo','event':'click'},{'path':'foo','event':'change'}]" />
				<button id="dblActionButton" data-action="[{'path':'foo'},{'path':'bar'}]">Yo</button>
				<button id="argsButton" data-action="{'path':'foo','event':'click','args':['x','z']}">Yo</button>
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
		resolver.resolve(global.document.getElementById("app"), model);
		global.document.addEventListener("click", e => resolver.userAction(e));

		let evt = global.document.createEvent("MouseEvents");
		evt.initEvent("click", true, false);
		global.document.getElementById("btn").dispatchEvent(evt);

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
		resolver.resolve(global.document.getElementById("app"), model);
		global.document.addEventListener("click", e => resolver.userAction(e));
		global.document.addEventListener("change", e => resolver.userAction(e));

		let evt = global.document.createEvent("Event");
		evt.initEvent("change", true, false);
		global.document.getElementById("input").dispatchEvent(evt);

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
		resolver.resolve(global.document.getElementById("app"), model);
		global.document.addEventListener("click", e => resolver.userAction(e));
		global.document.addEventListener("change", e => resolver.userAction(e));

		let evt = global.document.createEvent("Event");
		evt.initEvent("change", true, false);
		global.document.getElementById("input").dispatchEvent(evt);

		assert.equal(r, 42);
	});

	it("can have multiple binding for different actions", () => {
		let fooCount = 0;
		let barCount = 0;
		let model = {
			foo() {
				fooCount++;
			},
			bar() {
				barCount++;
			}
		};

		let resolver = new ActionsResolver();
		resolver.resolve(global.document.getElementById("app"), model);
		global.document.addEventListener("click", e => resolver.userAction(e));
		global.document.addEventListener("change", e => resolver.userAction(e));

		let evt1 = global.document.createEvent("MouseEvent");
		evt1.initEvent("click", true, false);
		global.document.getElementById("dblBindInput").dispatchEvent(evt1);
		assert.equal(fooCount, 1);
		assert.equal(barCount, 0);
		let evt2 = global.document.createEvent("Event");
		evt2.initEvent("change", true, false);
		global.document.getElementById("dblBindInput").dispatchEvent(evt2);
		assert.equal(fooCount, 1);
		assert.equal(barCount, 1);
	});

	it("can have multiple binding for the same action", () => {
		let fooCount = 0;
		let model = {
			foo() {
				fooCount++;
			}
		};

		let resolver = new ActionsResolver();
		resolver.resolve(global.document.getElementById("app"), model);
		global.document.addEventListener("click", e => resolver.userAction(e));
		global.document.addEventListener("change", e => resolver.userAction(e));

		let evt1 = global.document.createEvent("MouseEvent");
		evt1.initEvent("click", true, false);
		global.document.getElementById("dblBindInputSame").dispatchEvent(evt1);
		assert.equal(fooCount, 1);
		let evt2 = global.document.createEvent("Event");
		evt2.initEvent("change", true, false);
		global.document.getElementById("dblBindInputSame").dispatchEvent(evt2);
		assert.equal(fooCount, 2);
	});

	it("can have the same binding for two different actions", () => {
		let fooCount = 0;
		let barCount = 0;
		let model = {
			foo() {
				fooCount++;
			},
			bar() {
				barCount++;
			}
		};

		let resolver = new ActionsResolver();
		resolver.resolve(global.document.getElementById("app"), model);
		global.document.addEventListener("click", e => resolver.userAction(e));
		global.document.addEventListener("change", e => resolver.userAction(e));

		let evt1 = global.document.createEvent("MouseEvent");
		evt1.initEvent("click", true, false);
		global.document.getElementById("dblActionButton").dispatchEvent(evt1);
		assert.equal(fooCount, 1);
		assert.equal(barCount, 1);
	});

	it("can make use of arguments", () => {
		let r = 0;
		let model = {
			x: 7,
			z: 12,
			foo(a, b) {
				r = a + b;
			}
		};

		let resolver = new ActionsResolver();
		resolver.resolve(global.document.getElementById("app"), model);
		global.document.addEventListener("click", e => resolver.userAction(e));
		global.document.addEventListener("change", e => resolver.userAction(e));

		let evt1 = global.document.createEvent("MouseEvent");
		evt1.initEvent("click", true, false);
		global.document.getElementById("argsButton").dispatchEvent(evt1);
		assert.equal(r, 19);
	});

	it("can make use of complex arguments", () => {
		let r = 0;
		let model = {
			x: [7, 2, 8],
			z: { add: 3, multiply: 2 },
			foo(list, obj) {
				r = list.map(n => n * obj.multiply + obj.add);
			}
		};

		let resolver = new ActionsResolver();
		resolver.resolve(global.document.getElementById("app"), model);
		global.document.addEventListener("click", e => resolver.userAction(e));
		global.document.addEventListener("change", e => resolver.userAction(e));

		let evt1 = global.document.createEvent("MouseEvent");
		evt1.initEvent("click", true, false);
		global.document.getElementById("argsButton").dispatchEvent(evt1);
		assert.deepEqual(r, [17, 7, 19]);
	});

	it("get event args as last argument of callback", () => {
		let target = 0;
		let model = {
			x: [7, 2, 8],
			z: { add: 3, multiply: 2 },
			foo(e) {
				target = e.target;
			}
		};

		let resolver = new ActionsResolver();
		resolver.resolve(global.document.getElementById("app"), model);
		global.document.addEventListener("click", e => resolver.userAction(e));
		global.document.addEventListener("change", e => resolver.userAction(e));

		let evt1 = global.document.createEvent("MouseEvent");
		evt1.initEvent("click", true, false);
		let btnElement = global.document.getElementById("btn");
		btnElement.dispatchEvent(evt1);
		assert.equal(target, btnElement);
	});
});