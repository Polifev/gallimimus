const assert = require("assert");
const { ModelTrap } = require("../src/ModelTrap");

describe("ModelTrap", () => {
    it("detects changes on object fields", () => {
        let obj = {
            a: 0
        };
        let catchedPath = null;
        let catchedValue = null;
        let trap = new ModelTrap("");
        trap.onPropertyChanged = (path, value) => {
            catchedPath = path;
            catchedValue = value;
        };
        let prox = new Proxy(obj, trap);
        prox.a = 1;
        assert.strictEqual(catchedPath, "a");
        assert.strictEqual(catchedValue, 1); 
    });

    it("apply changes on object", () => {
        let obj = {
            a: 0
        };
        let trap = new ModelTrap("");
        trap.onPropertyChanged = () => {
            // do nothing
        };
        let prox = new Proxy(obj, trap);
        prox.a = 1;
        assert.strictEqual(prox.a, 1);
    });

    it("detects changes on subobjects", () => {
        let obj = {
            a: {
                b: 0
            }
        };
        let catchedPath = null;
        let catchedValue = null;
        let trap = new ModelTrap("");
        trap.onPropertyChanged = (path, value) => {
            catchedPath = path;
            catchedValue = value;
        };
        let prox = new Proxy(obj, trap);
        prox.a.b = 1;
        assert.strictEqual(catchedPath, "a.b");
        assert.strictEqual(catchedValue, 1);
    });

    it("detects changes due to method calls", () => {
        class Clazz {
            constructor(){
                this.prop = 0;
            }
            change(){
                this.prop = 1;
            }
        }
        let obj = new Clazz();
        let catchedPath = null;
        let catchedValue = null;
        let trap = new ModelTrap("");
        trap.onPropertyChanged = (path, value) => {
            catchedPath = path;
            catchedValue = value;
        };
        let prox = new Proxy(obj, trap);
        prox.change();
        assert.strictEqual(catchedPath, "prop");
        assert.strictEqual(catchedValue, 1);
    });

    it("detects changes on array elements", () => {
        let obj = {
            arr: [1, 2, 3, 4]
        };
        let catchedPath = null;
        let catchedValue = null;
        let trap = new ModelTrap("");
        trap.onPropertyChanged = (path, value) => {
            catchedPath = path;
            catchedValue = value;
        };

        let prox = new Proxy(obj, trap);
        prox.arr[0] = 0;

        assert.strictEqual(catchedPath, "arr.0");
        assert.strictEqual(catchedValue, 0);
    });

    it("detects array manipulations", () => {
        let obj = {
            arr: [1, 2, 3, 4]
        };
        let catchedPaths = [];
        let trap = new ModelTrap("");
        trap.onPropertyChanged = (path) => {
            catchedPaths.push(path);
        };

        let prox = new Proxy(obj, trap);
        prox.arr.push(5);

        assert.ok(catchedPaths.includes("arr.length"));
        assert.ok(catchedPaths.includes("arr.4"));
    });

    it("detects object replacement", () => {
        let obj = {
            subobj: {prop: 10}
        };
        let catchedPath = null;
        let catchedValue = null;
        let trap = new ModelTrap("");
        trap.onPropertyChanged = (path, value) => {
            console.log(path);
            console.log(value);
            catchedPath = path;
            catchedValue = value;
        };

        let prox = new Proxy(obj, trap);
        prox.subobj = { prop: 15};

        assert.ok(catchedPath);
        assert.ok(catchedValue);
    });
});