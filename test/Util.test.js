const assert = require("assert");
const { findProperty, setProperty } = require("../src/Util");

describe("Util", () => {
	describe("findProperty", () => {
		it("can find an immediate property", () => {
			let user = {
				firstname: "Pol",
				lastname: "Lefèvre"
			};
			assert.equal(findProperty(user, "firstname"), user.firstname);
		});

		it("can find a property through an array", () => {
			let obj = {
				users: [
					{
						firstname: "Pol",
						lastname: "Lefèvre"
					},
					{
						firstname: "Jean",
						lastname: "Jadot"
					},
					{
						firstname: "Sacha",
						lastname: "Machiels"
					},
				]
			};
			assert.equal(findProperty(obj, "users.1.firstname"), obj.users[1].firstname);
		});

		it("can find a property in a complex object", () => {
			let obj = {
				a: {
					b: {
						c: {
							d: {
								e: "Issou"
							}
						}
					}
				}
			};
			assert.equal(findProperty(obj, "a.b.c.d.e"), obj.a.b.c.d.e);
		});

		it("detects if path doesn't lead to an object property", () => {
			let obj = {
				foo: "Issou"
			};
			assert.throws(() => findProperty(obj, "bar"), Error, "The path lead to an undefined value in the given object.");
		});

		it("detects if path doesn't lead to an object property in a complex structure", () => {
			let obj = {
				a: {
					b: {
						c: {
							d: {
								e: "Issou"
							}
						}
					}
				}
			};
			assert.throws(() => findProperty(obj, "a.b.e"), Error, "The path lead to an undefined value in the given object.");
		});
	});

	describe("setProperty", () => {
		it("can set an immediate property", () => {
			let user = {
				firstname: "Pol",
				lastname: "Lefèvre"
			};
			setProperty(user, "firstname", "Jean");
			assert.equal(user.firstname, "Jean");
		});

		it("can set a property through an array", () => {
			let obj = {
				users: [
					{
						firstname: "Pol",
						lastname: "Lefèvre"
					},
					{
						firstname: "Jean",
						lastname: "Jadot"
					},
					{
						firstname: "Sacha",
						lastname: "Machiels"
					},
				]
			};

			setProperty(obj, "users.1.firstname", "Jean");
			assert.equal(obj.users[1].firstname, "Jean");
		});

		it("can set a property in a complex object", () => {
			let obj = {
				a: {
					b: {
						c: {
							d: {
								e: "Issou"
							}
						}
					}
				}
			};

			setProperty(obj, "a.b.c.d.e", "Risitas");
			assert.equal(obj.a.b.c.d.e, "Risitas");
		});

		it("detects if path doesn't lead to an object property", () => {
			let obj = {
				foo: "Issou"
			};
			assert.throws(() => setProperty(obj, "bar", "hello"), Error, "The path lead to an undefined value in the given object.");
		});

		it("detects if path doesn't lead to an object property in a complex structure", () => {
			let obj = {
				a: {
					b: {
						c: {
							d: {
								e: "Issou"
							}
						}
					}
				}
			};
			assert.throws(() => setProperty(obj, "a.b.e", "hello"), Error, "The path lead to an undefined value in the given object.");
		});
	});
});