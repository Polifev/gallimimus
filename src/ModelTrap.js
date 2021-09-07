class ModelTrap {
    constructor(path){
        this._path = path;
        this.onPropertyChanged = () => {};
    }

    get(target, propertyName){
        if(typeof target[propertyName] === "object" && target[propertyName] !== null){
            let subPath = buildPath(this._path, propertyName);
            let trap =  new ModelTrap(subPath);
            trap.onPropertyChanged = this.onPropertyChanged;
            return new Proxy(target[propertyName], trap);
        } else {
            return target[propertyName];
        }
    }

    set(target, propertyName, value){
        target[propertyName] = value;
        this.onPropertyChanged(buildPath(this._path, propertyName), value);
        return true;
    }
}

function buildPath(root, name){
    if(root != ""){
        root += ".";
    }
    return root + name;
}

module.exports.ModelTrap = ModelTrap;