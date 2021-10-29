# 1.0.0 First release - 30/08/2020

## 1.0.0  First release - 30/08/2020

### 1.0.0  First release - 30/08/2020

#### Core features

* Bidirectional data-binding
* Model watching
* Dynamic html document generation
* Action to events binding
* Simple component system

### 1.0.1 - First fix - 30/08/2020 

#### Fixed

* Typos correction in README.md (quick start section)
* Remove es6 exports that were forgotten and made the module not workings

## 1.1.0 - Multi-binding update - 31/08/2020

### 1.1.0 - Multi-binding update - 31/08/2020

#### Core features

* Adding the possibility to bind multiple properties with one *data-bind* attribute
* Adding the possibility to use computed properties within a *data-bind* attribute
* Adding the possiblility to bind multiple actions with one *data-action* attribute
* Adding the possibility to pass arguments to actions

#### Minor changes

* Adding Component class within Gallimimus root
* Code coverage is now > 70%
* Adding a CHANGELOG.md

# 2.0.0 - JSON update

## 2.0.0 JSON update

### 2.0.0 JSON update

#### Core features

* Changing templating attribute syntax from CSV to JSON-like format
* Adding the possibility to bind CSS class using the *data-class* attribute
* Adding support for more document events on *data-action*

#### Minor changes

* Documentation updated for directives :
  * *data-bind*
  * *data-action*
  * *data-if*
  * *data-else*
  * *data-class*
  * *data-foreach*
* Code coverage is now > 80%

### 2.0.1 Patch: component root replacement

#### Fixed

* The component holder properties are no more injected with component data root.

### 2.0.2 Patch: model return

#### Fixed

* The observed model is now returned by the *load* function of the *Gallimimus* object
* The feature above is slightly tested

### 2.0.3 Patch: rebuild less

#### Fixed

* The *data-foreach* and *data-if*/*data-else* directives have been a bit optimized to avoid useless page rebuilds
* The feature above is slightly tested

### 2.0.4 Patch: lost focus

* The *data-action* directive has been modified to automatically add its event-args to its bound callback function
* The input that was focused before a document rebuild will now be re-focused automatically after rebuild (it needs an ID)