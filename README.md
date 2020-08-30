# @polifev/gallimimus

Gallimimus is a very light library for binding a javascript object (the model) to an html document (the template). It relies on the [on-change](https://www.npmjs.com/package/on-change) module to provide a bidirectional, dirty checking free data binding.

## Quick start

You can install the gallimimus project with ``npm`` :

```
npm install --save @polifev/galimimus
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

## Hello world app

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

document.addEventListener("load", () => {
    "readystatechange", () => {
	if (document.readyState === "complete") {
		let gallimimus = new Gallimimus();
        gallimimus.load(
            "app",		// The ID of the root element in your template
            document,	// A reference to the browser's document
            model		// The model that you will bind with your template
        );
	}
};
```

Now that these files are created, you will need to build your app with browserify :

```
browserify index.js -o bundle.js
```

You can now open ``index.html`` with your favorite browser and see the magic happening !

I recommend you to read the following sections if you want more information on the different aspects of Gallimimus library.