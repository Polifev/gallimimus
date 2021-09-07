const assert = require("assert");
const { JSDOM } = require("jsdom");
const { Gallimimus } = require("../src/Gallimimus");

describe("Gallimimus", () => {
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

    it("returns a proxy of the model passed", () => {
        let model = {
            foo: false
        };

        let gallimimus = new Gallimimus();
        let watchedModel = gallimimus.load("app", global.document, model);
        
        // Assert that the return value is not null, has the same fields as the model but is different from it
        assert.ok(watchedModel);
        assert.notEqual(model, watchedModel);
        assert.deepEqual(model, watchedModel);
    });
});