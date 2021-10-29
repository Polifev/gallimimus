const assert = require("assert");
const { cp } = require("fs");
const { JSDOM } = require("jsdom");
const { HtmlBuilder } = require("../../src/builders/HtmlBuilder");
const { AbstractDirectiveResolver } = require("../../src/builders/resolvers/AbstractDirectiveResolver");

describe("HtmlBuilder", () => {
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
                <h1>My App</h1>
                <input type="text" id="focused" />
            </div>
        </body>
        </html>
        `);
        global.window = dom.window;
        global.document = dom.window.document;
    });

    it("calls its resolvers on build", () => {
        let resolved = false;
        class MockResolver extends AbstractDirectiveResolver {
            // eslint-disable-next-line no-unused-vars
            resolve(node, model) {
                resolved = true;
            }
        }
        let resolver = new MockResolver();
        let builder = new HtmlBuilder({}, global.document.getElementById("app").cloneNode(true));
        builder.withDirectiveResolver(resolver);

        assert.equal(resolved, false);
        builder.buildDocument(global.document, "app");
        assert.equal(resolved, true);
    });

    it("calls its resolvers in their declaration order", () => {
        let resolveOrder = [];
        class MockResolver extends AbstractDirectiveResolver {
            constructor(name) {
                super();
                this.name = name;
            }
            // eslint-disable-next-line no-unused-vars
            resolve(node, model) {
                resolveOrder.push(this.name);
            }
        }

        let firstResolver = new MockResolver("first");
        let secondResolver = new MockResolver("second");
        let thirdResolver = new MockResolver("third");

        let builder = new HtmlBuilder({}, global.document.getElementById("app").cloneNode(true));
        builder.withDirectiveResolver(firstResolver);
        builder.withDirectiveResolver(secondResolver);
        builder.withDirectiveResolver(thirdResolver);

        assert.equal(resolveOrder.length, 0);
        builder.buildDocument(global.document, "app");
        assert.equal(resolveOrder[0], "first");
        assert.equal(resolveOrder[1], "second");
        assert.equal(resolveOrder[2], "third");
    });

    it("doesn't alter the template element", () => {
        class MockResolver extends AbstractDirectiveResolver {
            // eslint-disable-next-line no-unused-vars
            resolve(node, model) {
                node.innerHTML = "<span id=\"undesirable\">Hello</span>";
            }
        }
        let node = global.document.getElementById("app").cloneNode(true);
        let builder = new HtmlBuilder({}, node);
        builder.withDirectiveResolver(new MockResolver());

        let newNode = builder.buildDocument(global.document, "app");
        assert.doesNotMatch(node.innerHTML, /undesirable/);
        assert.match(newNode.innerHTML, /undesirable/);
    });

    it("recover focused element on rebuild", () => {
        class MockResolver extends AbstractDirectiveResolver {
            // eslint-disable-next-line no-unused-vars
            resolve(node, model) {
                // do nothing
            }
        }
        let node = global.document.getElementById("app").cloneNode(true);
        let resolver = new MockResolver();
        let builder = new HtmlBuilder({}, node);
        builder.withDirectiveResolver(resolver);

        // Build app document
        builder.buildDocument(global.document, "app");

        // Focus one input field
        global.document.getElementById("focused").focus();

        // Rebuild the document
        builder.buildDocument(global.document, "app");

        // The input field should still be selected
        assert.equal(global.document.activeElement, global.document.getElementById("focused"));
    });
});