const assert = require("assert");
const { JSDOM } = require("jsdom");
const { IfElseResolver } = require("../../../src/builders/resolvers/IfElseResolver");

describe("IfElseResolver", () => {
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
				<div id="first-div" data-if="{'path':'foo'}"></div>
				<div id="second-div" data-else="{'path':'foo'}"></div>
			</div>
        </body>
        </html>
        `);
		global.window = dom.window;
		global.document = dom.window.document;
	});

	describe("If", () => {
		it("deletes content tagged with \"data-if\" if the property is false", () => {
			let model = {
				foo: false
			};
			let resolver = new IfElseResolver();
			resolver.resolve(global.document.getElementById("app"), model);

			assert.strictEqual(global.document.getElementById("first-div"), null);
		});

		it("deletes content tagged with \"data-if\" if the property is equivalent to false (null)", () => {
			let model = {
				foo: null
			};
			let resolver = new IfElseResolver();
			resolver.resolve(global.document.getElementById("app"), model);

			assert.strictEqual(global.document.getElementById("first-div"), null);
		});

		it("deletes content tagged with \"data-if\" if the property is equivalent to false ([])", () => {
			let model = {
				foo: []
			};
			let resolver = new IfElseResolver();
			resolver.resolve(global.document.getElementById("app"), model);

			assert.strictEqual(global.document.getElementById("first-div"), null);
		});

		it("deletes content tagged with \"data-if\" if the property is equivalent to false (\"\")", () => {
			let model = {
				foo: ""
			};
			let resolver = new IfElseResolver();
			resolver.resolve(global.document.getElementById("app"), model);

			assert.strictEqual(global.document.getElementById("first-div"), null);
		});

		it("throws an error if the evaluated property is undefined", () => {
			let model = {
			};
			let resolver = new IfElseResolver();
			assert.throws(() => resolver.resolve(global.document.getElementById("app"), model), Error, "The path lead to an undefined value in the given object.");
		});

		it("keeps content tagged with \"data-if\" if the property is true", () => {
			let model = {
				foo: true
			};
			let resolver = new IfElseResolver();
			resolver.resolve(global.document.getElementById("app"), model);

			assert.notStrictEqual(global.document.getElementById("first-div"), null);
		});

		it("removes the \"data-if\" tag after evaluation", () => {
			let model = {
				foo: true
			};
			let resolver = new IfElseResolver();
			resolver.resolve(global.document.getElementById("app"), model);

			assert.strictEqual(global.document.getElementById("first-div").getAttribute("data-if"), null);
		});
	});

	describe("Else", () => {
		it("keeps content tagged with \"data-else\" if the property is false", () => {
			let model = {
				foo: false
			};
			let resolver = new IfElseResolver();
			resolver.resolve(global.document.getElementById("app"), model);

			assert.notStrictEqual(global.document.getElementById("second-div"), null);
		});

		it("keeps content tagged with \"data-else\" if the property is equivalent to false (null)", () => {
			let model = {
				foo: null
			};
			let resolver = new IfElseResolver();
			resolver.resolve(global.document.getElementById("app"), model);

			assert.notStrictEqual(global.document.getElementById("second-div"), null);
		});

		it("keeps content tagged with \"data-else\" if the property is equivalent to false ([])", () => {
			let model = {
				foo: []
			};
			let resolver = new IfElseResolver();
			resolver.resolve(global.document.getElementById("app"), model);

			assert.notStrictEqual(global.document.getElementById("second-div"), null);
		});

		it("keeps content tagged with \"data-else\" if the property is equivalent to false (\"\")", () => {
			let model = {
				foo: ""
			};
			let resolver = new IfElseResolver();
			resolver.resolve(global.document.getElementById("app"), model);

			assert.notStrictEqual(global.document.getElementById("second-div"), null);
		});

		it("throws an error if the evaluated property is undefined", () => {
			let model = {
			};
			let resolver = new IfElseResolver();
			assert.throws(() => resolver.resolve(global.document.getElementById("app"), model), Error, "The path lead to an undefined value in the given object.");
		});

		it("deletes content tagged with \"data-else\" if the property is true", () => {
			let model = {
				foo: true
			};
			let resolver = new IfElseResolver();
			resolver.resolve(global.document.getElementById("app"), model);

			assert.strictEqual(global.document.getElementById("second-div"), null);
		});

		it("removes the \"data-else\" tag after evaluation", () => {
			let model = {
				foo: false
			};
			let resolver = new IfElseResolver();
			resolver.resolve(global.document.getElementById("app"), model);

			assert.strictEqual(global.document.getElementById("second-div").getAttribute("data-else"), null);
		});
	});
});