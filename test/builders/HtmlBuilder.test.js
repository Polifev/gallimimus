const assert = require("assert");
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
            <div id="app"></div>
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
        let builder = new HtmlBuilder({}, document.getElementById("app").cloneNode(true));
        builder.withDirectiveResolver(resolver);

        assert.equal(resolved, false);
        builder.buildDocument();
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

        let builder = new HtmlBuilder({}, document.getElementById("app").cloneNode(true));
        builder.withDirectiveResolver(firstResolver);
        builder.withDirectiveResolver(secondResolver);
        builder.withDirectiveResolver(thirdResolver);

        assert.equal(resolveOrder.length, 0);
        builder.buildDocument();
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
        let node = document.getElementById("app").cloneNode(true);
        let builder = new HtmlBuilder({}, node);
        builder.withDirectiveResolver(new MockResolver());

        assert.equal(node.innerHTML, "");
        let newNode = builder.buildDocument();
        assert.equal(node.innerHTML, "");
        assert.equal(newNode.innerHTML, "<span id=\"undesirable\">Hello</span>");
    });
});