const assert = require("assert");
const { JSDOM } = require("jsdom");
const { ComponentsResolver } = require("../../../src/builders/resolvers/ComponentsResolver");
const { Component } = require("../../../src/Component");


describe("ComponentsResolver", () => {
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
				<div data-component="{'name':'myComponent','path':'component'}"></div>
			</div>
        </body>
        </html>
        `);
		global.window = dom.window;
		global.document = dom.window.document;
	});

	it("can be deployed", () => {
		let model = {
			component:{}
		};
        let resolver = new ComponentsResolver();
        let component = new Component("<span class=\"myComp\"></span>");
        resolver.registerComponent("myComponent", component);
		resolver.resolve(global.document.getElementById("app"), model);
		assert.strictEqual(global.document.getElementsByClassName("myComp").length, 1);
    });

    it("can be nested", () => {
		let model = {
			component:{
                subComponent:{

                }
            }
		};
        let resolver = new ComponentsResolver();
        let component = new Component(`<div class="myComp">
        <div data-component="{'name':'mySubComponent','path':'subComponent'}"></div>
        </div>`);
        let subComponent = new Component("<span class=\"mySubComp\"></span>");

        resolver.registerComponent("myComponent", component);
        resolver.registerComponent("mySubComponent", subComponent);

        resolver.resolve(global.document.getElementById("app"), model);
        assert.strictEqual(global.document.getElementsByClassName("myComp").length, 1);
        assert.strictEqual(global.document.getElementsByClassName("mySubComp").length, 1);
    });

    it("update self properties with path", () => {
		let model = {
			component:{
                subComponent:{
                    firstname: "Pol"
                }
            }
		};
        let resolver = new ComponentsResolver();
        let component = new Component(`<div class="myComp">
        <div data-component="{'name':'mySubComponent','path':'subComponent'}"></div>
        </div>`);
        let subComponent = new Component("<span class=\"mySubComp\" data-bind=\"{'path':'firstname'}\"></span>");

        resolver.registerComponent("myComponent", component);
        resolver.registerComponent("mySubComponent", subComponent);

        resolver.resolve(global.document.getElementById("app"), model);
        assert.strictEqual(global.document.getElementsByClassName("mySubComp").length, 1);
        assert.strictEqual(
            global.document.getElementsByClassName("mySubComp")[0].getAttribute("data-bind"),
            "{'path':'component.subComponent.firstname'}");
    });

    it("update children properties with path", () => {
		let model = {
			component:{
                subComponent:{
                    firstname: "Pol"
                }
            }
		};
        let resolver = new ComponentsResolver();
        let component = new Component(`<div class="myComp">
        <div data-component="{'name':'mySubComponent','path':'subComponent'}"></div>
        </div>`);
        let subComponent = new Component("<p class=\"mySubComp\">Hello <span class=\"mySpan\" data-bind=\"{'path':'firstname'}\"></span></p>");

        resolver.registerComponent("myComponent", component);
        resolver.registerComponent("mySubComponent", subComponent);

        resolver.resolve(global.document.getElementById("app"), model);
        assert.strictEqual(global.document.getElementsByClassName("mySubComp").length, 1);
        assert.strictEqual(
            global.document.getElementsByClassName("mySpan")[0].getAttribute("data-bind"),
            "{'path':'component.subComponent.firstname'}");
    });
});