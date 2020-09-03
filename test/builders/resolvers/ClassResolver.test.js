const assert = require("assert");
const { JSDOM } = require("jsdom");
const { ClassResolver } = require("../../../src/builders/resolvers/ClassResolver");

describe("ClassResolver", () => {
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
			<p id="toggleClass" data-class="foo,toggle,myClass"></p>
			<p id="textClass" data-class="foo"></p>
			<p id="multipleTextClass" data-class="foo;bar"></p>
			<p id="multipleToggleClass" data-class="foo,toggle,myFirstClass;bar,toggle,mySecondClass"></p>
			<p id="computedTextClass" data-class="bar,text,foo"></p>
			<p id="computedToggleClass" data-class="bar,toggle,myClass,foo"></p>
		</div>
	</body>
	</html>
	`);
		global.window = dom.window;
		global.document = dom.window.document;
	});

	it("can bind class property in toggle mode", () => {
		let model = {
			foo: false,
			bar: ""
		};

		let resolver = new ClassResolver();
		resolver.resolve(global.document.getElementById("app"), model);

		let p = global.document.getElementById("toggleClass");

		assert.equal(p.classList.contains("myClass"), false);
		model.foo = true;
		resolver.modelChanged(model, "foo");
		assert.equal(p.classList.contains("myClass"), true);
	});

	it("can bind class property in text mode", () => {
		let model = {
			foo: "myClass",
			bar: ""
		};

		let resolver = new ClassResolver();
		resolver.resolve(global.document.getElementById("app"), model);

		let p = global.document.getElementById("textClass");

		assert.equal(p.classList.contains("myClass"), true);
		model.foo = "myOtherClass";
		resolver.modelChanged(model, "foo");
		assert.equal(p.classList.contains("myClass"), false);
		assert.equal(p.classList.contains("myOtherClass"), true);

		model.foo = "";
		resolver.modelChanged(model, "foo");
		assert.equal(p.classList.contains("myClass"), false);
		assert.equal(p.classList.contains("myOtherClass"), false);
		assert.equal(p.classList.contains(""), false);
	});

	it("can bind multiple text classes", () => {
		let model = {
			foo: "myFirstClass",
			bar: "mySecondClass"
		};

		let resolver = new ClassResolver();
		resolver.resolve(global.document.getElementById("app"), model);

		let p = global.document.getElementById("multipleTextClass");
		assert.equal(p.classList.contains("myFirstClass"), true);
		assert.equal(p.classList.contains("mySecondClass"), true);

		model.foo = "myOtherClass";
		resolver.modelChanged(model, "foo");

		assert.equal(p.classList.contains("myFirstClass"), false);
		assert.equal(p.classList.contains("myOtherClass"), true);
		assert.equal(p.classList.contains("mySecondClass"), true);
	});

	it("can bind multiple toggle classes", () => {
		let model = {
			foo: false,
			bar: false
		};

		let resolver = new ClassResolver();
		resolver.resolve(global.document.getElementById("app"), model);

		let p = global.document.getElementById("multipleToggleClass");
		assert.equal(p.classList.contains("myFirstClass"), false);
		assert.equal(p.classList.contains("mySecondClass"), false);

		model.foo = true;
		resolver.modelChanged(model, "foo");
		assert.equal(p.classList.contains("myFirstClass"), true);
		assert.equal(p.classList.contains("mySecondClass"), false);

		model.bar = true;
		resolver.modelChanged(model, "bar");
		assert.equal(p.classList.contains("myFirstClass"), true);
		assert.equal(p.classList.contains("mySecondClass"), true);
	});

	it("can bind text class to computed", () => {
		let model = {
			foo: "directory",
			get bar() { return this.foo.substring(0, 3); }
		};

		let resolver = new ClassResolver();
		resolver.resolve(global.document.getElementById("app"), model);

		let p = global.document.getElementById("computedTextClass");
		assert.equal(p.classList.contains("dir"), true);

		model.foo = "file";
		resolver.modelChanged(model, "foo");
		assert.equal(p.classList.contains("dir"), false);
		assert.equal(p.classList.contains("fil"), true);
	});

	it("can bind toggle class to computed", () => {
		let model = {
			foo: false,
			get bar() { return !this.foo; }
		};

		let resolver = new ClassResolver();
		resolver.resolve(global.document.getElementById("app"), model);

		let p = global.document.getElementById("computedToggleClass");
		assert.equal(p.classList.contains("myClass"), true);

		model.foo = true;
		resolver.modelChanged(model, "foo");
		assert.equal(p.classList.contains("myClass"), false);
	});
});