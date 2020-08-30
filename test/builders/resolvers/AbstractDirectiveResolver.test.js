const assert = require("assert");
const { AbstractDirectiveResolver } = require("../../../src/builders/resolvers/AbstractDirectiveResolver");

describe("AbstractDirectiveResolver", () => {
    it("cannot be instantiated", () => {
        assert.throws(() => new AbstractDirectiveResolver(), TypeError, "Abstract class \"AbstractDirectiveResolver\" cannot be instantiated.");
    });

    it("can be inherited", () => {
        assert.doesNotThrow(() => {
            class MockResolver extends AbstractDirectiveResolver {

            }
            new MockResolver();
        });
    });

    it("detects if child class doesn't implement \"resolve\"", () => {
        class MockResolver extends AbstractDirectiveResolver {

        }

        assert.throws(() => new MockResolver().resolve(), Error, "\"resolve\" is not implemented");
    });
});