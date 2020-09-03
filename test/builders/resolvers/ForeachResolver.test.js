const assert = require("assert");
const { JSDOM } = require("jsdom");
const { ForeachResolver } = require("../../../src/builders/resolvers/ForeachResolver");

describe("ForeachResolver", () => {
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
				<ul id="users-list">
					<li data-foreach="users" data-bind="$elt.firstname"></li>
				</ul>
				<div id="detailed-users">
					<div data-foreach="users">
						nicknames:
						<ul>
							<li data-foreach="$elt.nicknames" class="nickname"></li>
						</ul>
					</div>
				</div>
				<div id="first-div" data-if="foo"></div>
				<div id="second-div" data-else="foo"></div>
			</div>
        </body>
        </html>
        `);
		global.window = dom.window;
		global.document = dom.window.document;
	});

	it("can replicate element", () => {
		let model = {
			users: [
				{ firstname: "Pol", lastname: "Lefèvre", nicknames: [] },
				{ firstname: "John", lastname: "Doe", nicknames: [] }
			]
		};
		let resolver = new ForeachResolver(["data-if", "data-else", "data-foreach", "data-bind", "data-action"]);
		resolver.resolve(global.document.getElementById("app"), model);
		assert.strictEqual(global.document.getElementById("users-list").childElementCount, 2);
	});

	it("deletes element if 0 items", () => {
		let model = {
			users: []
		};
		let resolver = new ForeachResolver(["data-if", "data-else", "data-foreach", "data-bind", "data-action"]);
		resolver.resolve(global.document.getElementById("app"), model);
		assert.strictEqual(global.document.getElementById("users-list").childElementCount, 0);
	});

	it("injects element reference within $elt special paths", () => {
		let model = {
			users: [
				{ firstname: "Pol", lastname: "Lefèvre", nicknames: [] }
			]
		};
		let resolver = new ForeachResolver(["data-if", "data-else", "data-foreach", "data-bind", "data-action"]);
		resolver.resolve(global.document.getElementById("app"), model);

		assert.strictEqual(global.document.querySelector("[data-bind]").getAttribute("data-bind"), "users.0.firstname");
	});

	it("supports nested foreach", () => {
		let model = {
			users: [
				{
					firstname: "Pol",
					lastname: "Lefèvre",
					nicknames: [
						"Polo",
						"Popol",
						"Poli"
					]
				},
				{
					firstname: "Jean",
					lastname: "Jadot",
					nicknames: [
						"JJ",
						"Jan"
					]
				}
			]
		};
		let resolver = new ForeachResolver(["data-if", "data-else", "data-foreach", "data-bind", "data-action"]);
		resolver.resolve(global.document.getElementById("app"), model);

		assert.equal(global.document.getElementsByClassName("nickname").length, 5);
	});
});