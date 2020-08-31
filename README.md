# @polifev/gallimimus

Gallimimus is a very light library for binding a javascript object (the model) to an html document (the template). It relies on the [on-change](https://www.npmjs.com/package/on-change) module to provide a bidirectional, dirty checking free data binding.

## Quick start

In this section, you'll learn how to setup a little project with Gallimimus and to run it into your browser.

### Setup

You can install the gallimimus project with ``npm`` :

```
npm install --save @polifev/gallimimus
```

Then you can require it from your application code :

```javascript
const { Gallimimus } = require("@polifev/gallimimus");
```

Gallimimus is a node-module but it aims to be used within a browser environment. You will need a way to make it browser-compatible. There are a lots of ways to achieve this but the one I choosed is [browserify](http://browserify.org/) which allows to bundle all the dependencies into one file to import in your html page.

You can easily install browserify using this command :

```
npm install -g browserify
```

### Hello world app

First, create a file named ``index.html`` and fill it with the following content :

```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8"/>
        <title>My wonderful app</title>
        <script src="./bundle.js"></script>
    </head>
    <body>
        <h1>
            My wonderful app
        </h1>
        <main id="app">
            <div data-foreach="userManager.users">
				<div>
                   	<span data-bind="$elt.firstname"></span> <span data-bind="$elt.lastname"></span>
                </div>
            </div>
            <button data-action="userManager.greetings">
                Click me
            </button>
        </main>
    </body>
</html>
```

Then, create a file named ``index.js``. That will be the root of our application. Fill it with the following content :

```javascript
const { Gallimimus } = require("@polifev/gallimimus");

let model = {
    userManager:{
        greetings(){
          	alert("Hello world");
        },
        users:[
        	{ firstname: "Pol", lastname: "Lefèvre" },
        	{ firstname: "John", lastname: "Doe" }
    	]
    }
};

document.addEventListener("readystatechange", () => {
	if (document.readyState === "complete") {
		let gallimimus = new Gallimimus();
        model = gallimimus.load(
            "app",		// The ID of the root element in your template
            document,	// A reference to the browser's document
            model		// The model that you will bind with your template
        );
	}
});
```

Now that these files are created, you will need to build your app with browserify :

```
browserify index.js -o bundle.js
```

You can now open ``index.html`` with your favorite browser and see the magic happening !

I recommend you to read the following sections if you want more information on the different aspects of Gallimimus library.

## Template directives

Directives are custom arguments that will be used to describe how the data should be display in your html document. In this section you'll learn all you have to know about the different directives that you can use in your templates.

### data-bind

#### Usage

The first thing that you'll probably want to use in your application is a way of showing (and maybe editing) the content of the scalar values of your model. That's where *data-bind* directive comes in action. Let's take a look at a basic example :

```html
<p>Hello <span data-bind="user.firstname"></span></p>
```

This line binds the content of the ``<span>`` element to the value of ``yourModel.user.firstname``. It means that, when the page will rebuild, the content of that ``<span>``will be filled  with ``yourModel.user.firstname``. It will also listen to any changes provided to ``yourModel.user.firstname`` and apply them to the content of your ``<span>``. One constraint with *data-bind* is that the provided path **must** lead to a valid property of your model. Meaning that a ``undefined`` value anywhere in this path will throw an error.

Let's take another example that is a bit more complex :

```html
<input type="text" data-bind="user.firstname,twoways,value" />
```

Here, we still want to bind the value of ``yourModel.user.firstname``, but we do it with ``twoways`` mode. It means that modifying the model will still update the document **but** modifying the value of the input in the document will also update the underlying model. You'll also notice that we must precise that our data-binding is made on the property *value* of the input. The default property that is bound being the *innerHTML* property.

You can try to combine the two examples above in the same template. You'll see that modifying the value in the ``<input>`` will element will update the ``<span>`` content.

#### Syntax

A data-bind attribute is written like this:  ``[path](,[bind-mode](,[target-property]))``. You can bind multiple properties to multiple values by separating them with semicolons.

|        name         |                      description                       | default value |
| :-----------------: | :----------------------------------------------------: | :-----------: |
|      ``path``       |     A path to the value to be bound in your model      |       -       |
|    ``bind-mode``    |  Either ``oneway``, ``twoways`` or ``onewaytosource``  |  ``oneway``   |
| ``target-property`` | The property of the html element that you want to bind | ``innerHTML`` |

#### Binding modes

|        Mode        | Updating model does update the document | Updating the document does update the model |
| :----------------: | :-------------------------------------: | :-----------------------------------------: |
|     ``oneway``     |                  **X**                  |                                             |
|    ``twoways``     |                  **X**                  |                    **X**                    |
| ``onewaytosource`` |                                         |                    **X**                    |

#### Notes

* The data-bind directive does not imply any page rebuild.

### data-if & data-else

### data-foreach

### data-component & data-root

