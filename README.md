# @polifev/gallimimus

Gallimimus is a very light library for binding a javascript object (the model) to an html document (the template). It relies on the [on-change](https://www.npmjs.com/package/on-change) module to provide a bidirectional, dirty checking free data binding.

## Quick start

In this section, you'll learn how to setup a little project with Gallimimus and to run it into your browser.

### Setup

You can install the Gallimimus project with ``npm`` :

```
npm install --save @polifev/gallimimus
```

Then you can require it from your application code :

```javascript
const { Gallimimus } = require("@polifev/gallimimus");
```

Gallimimus is a node-module but it aims to be used within a browser environment. You will need a way to make it browser-compatible. There are a lots of ways to achieve this but the one I've chosen is [browserify](http://browserify.org/) which allows to bundle all the dependencies into one file to import in your html page.

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
            <div data-foreach="{'path':'userManager.users'}">
				<div>
                   	<span data-bind="{'path':'$elt.firstname'}"></span>
                    <span data-bind="{'path':'$elt.lastname'}"></span>
                </div>
            </div>
            <button data-action="{'path':'userManager.greetings'}">
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

The very base of Gallimimus are *template directives*. Directives are custom arguments that will be used to describe how the data should be display in your html document. These arguments are provided in a JSON-like way so you can easily omit parameters for which you want to keep the default value. It makes your templating faster and you can get rapidly to the point. (Note that you can write these directives using simple or double quotes regarding which of them you use to delimit the attribute value) 

In this section you'll learn in detail all you have to know about the different directives that you can use in your templates.

### data-bind

#### Usage

The first thing that you'll probably want to use in your application is a way of showing (and maybe editing) the content of the scalar values of your model. That's where *data-bind* directive comes in action. Let's have a look at a basic example :

```html
<p>Hello <span data-bind="{'path':'user.firstname'}"></span></p>
```

This line binds the content of the ``<span>`` element to the value of ``yourModel.user.firstname``. It means that, when the page will rebuild, the content of that ``<span>`` will be filled  with ``yourModel.user.firstname``. It will also listen to any changes provided to ``yourModel.user.firstname`` and apply them to the content of your ``<span>``. One constraint with *data-bind* is that the provided path **must** lead to a valid property of your model. Meaning that a ``undefined`` value anywhere in this path will throw an error.

Let's take another example that is a bit more complex :

```html
<input type="text" data-bind="{'path':'user.firstname','mode':'twoways','bindTo':'value'" />
```

Here, we still want to bind the value of ``yourModel.user.firstname``, but we do it with ``twoways`` mode. It means that modifying the model will still update the document **but** modifying the value of the input in the document will also update the underlying model. You'll also notice that we must precise that our data-binding is made on the property *value* of the input. The default property that is bound being the *innerHTML* property.

You can try to combine the two examples above in the same template. You'll see that modifying the value in the ``<input>`` will element will update the ``<span>`` content.

#### Syntax

| Property   | Description                                                  | Default value |
| :--------- | :----------------------------------------------------------- | :------------ |
| ``path``   | A path to the value to be bound in your model                | *Mandatory*   |
| ``mode``   | Either ``oneway``, ``twoways`` or ``onewaytosource``         | ``oneway``    |
| ``bindTo`` | The property of the html element that you want to bind       | ``innerHTML`` |
| ``args``   | A list of paths to values that should also trigger an update when modified. It is mainly used for computed properties with the ``get`` operator. To achieve this, simply put in this array all the attributes that are used in the computation of the value you want to bind. | ``[]``        |

#### Binding modes

|        Mode        | Updating model does update the document | Updating the document does update the model |
| :----------------: | :-------------------------------------: | :-----------------------------------------: |
|     ``oneway``     |                  **X**                  |                                             |
|    ``twoways``     |                  **X**                  |                    **X**                    |
| ``onewaytosource`` |                                         |                    **X**                    |

#### Notes

* The *data-bind* directive does not imply any page rebuild.
* The model is updated by listening to ``input`` and ``change`` events of the html elements.
* You can bind multiple properties to multiple values by putting them in a JSON array.

### data-action

#### Usage

Binding values are ok but can we now bind method calls to some events of our app ? This is done with the *data-action* directive. Let's have a look at an example :

```html
<button data-action="{'path':'greetings'}">Click me</button>
```

You'll notice that the syntax is pretty straightforward. With this code, Gallimimus will search for a function named ``greetings`` at the root of your model and bind it to the ``click`` event of the button as it is the default event that will be bound.

Let's now take an example that is a bit more complex :

```html
<input data-action="{'path':'validator.validate', 'event':'change', 'args':['user.firstname']}" />
```

Here, we precise that we want the action to be triggered with the event ``change`` of the ``<input>``. We also give the function ``yourModel.validator.validate`` an argument. This argument will have the value of ``yourModel.user.firstname`` **at action execution time**.

#### Syntax

|   name    |                         description                          | default value |
| :-------: | :----------------------------------------------------------: | :-----------: |
| ``path``  |        A path to the method to be bound in your model        |  *Mandatory*  |
| ``event`` |          The event that will linked to your action           |   ``click``   |
| ``args``  | A list of paths to values in the model that you want to provide as arguments to the action function. |    ``[]``     |

#### Notes

* Just as with *data-bind*, you can bind multiple events to multiple actions by putting them in a JSON array.
* Don't be afraid to bind the same event to several actions but be aware that the order in which they will be called is not guaranteed to be the same as the order in which they are declared.

### data-if & data-else

#### Usage

Sometimes, you want certain information to appear only at a certain condition. That's why *data-if* and *data-else* directives are made for. With these, you can cut parts out of your template (they are not just applied a "display:none" style). Let's have a look at an example :

```html
<div>
    <a data-if="{'path':'currentUser.isPremium'}"
       href="./premium">Access to your premium account now</a>
    <a data-else="{'path':'currentUser.isPremium'}"
       href="./buy-premium">Get premium access today for only 99.99€</a>
</div>
```

As you can see, *data-if* directives takes only one argument which is the path to a boolean-like value in your model. Here, we decided to print a particular ``<a>`` if the user has subscribed to a premium account and another one if the user has *not* subscribed yet. Be aware that it remains a client-side process so it shouldn't be used (alone) for critical security features. 

As most of directives, the binding is dynamic and if the value of ``yourModel.currentUser.isPremium`` changes, the tagged element can appear/disappear without page reloading. Nevertheless will a template rebuild be necessary in order to make it appear/disappear again. I explain in more details the lifecycle of your page in [this section](#document-lifecycle).

#### Syntax

|   name   |                    description                    | default value |
| :------: | :-----------------------------------------------: | :-----------: |
| ``path`` | A path to the attribute to be bound in your model |  *Mandatory*  |

#### Notes

* *data-else* works simply the opposite way than *data-if* and literally means "data-if-not".
* You can bind properties that are not strictly booleans. For example : printing a message if an array is empty by passing the array to a *data-else* directive.

### data-class

#### Usage

For UI features, you often need to set particular CSS classes to elements in order to display them properly regarding the data they hold. For this specific task, Gallimimus offers you a neat way of doing. Let's take a look at this first example :

```html
<div data-class="{'path':'currentUser.sex'}">
	<!-- Some user data -->
</div>
<style>
    .male{
        background-color: blue;
    }
    .female{
        background-color: magenta;
    }
    .other{
        background-color: grey;
    }
</style>
```

In this example, we used ``yourModel.currentUser.sex`` string as a class for our ``<div>`` which will set the color of its background. If the value changes, the old class will be removed and a class with the new value will be added.

It is not the only way to use *data-class*. Let's take another example :

```html
<div>
    <input type="text" 
           data-bind="{'path':'firstname', 'mode':'twoways', 'bindTo':'value'}" 
           data-class="{'path':'firstname', 'mode':'toggle', 'class':'filled'}"/>
</div>
<style>
    .filled{
        outline: 1px solid green;
    }
</style>
```

Here, we decided to toggle a defined class based on the value of a boolean-like property. This code will toggle a green outline around ``<input/>`` that contains a non-empty value. This can do the job but it's not very elegant. A good improvement here would be to create a computed property ``firstnameIsOk`` with the javascript *get* operator that returns for example ``this.firstname.length >= 3`` and bind this to our class :

```
<div>
    <input type="text" 
           data-bind="{'path':'firstname', 'mode':'twoways', 'bindTo':'value'}" 
           data-class="{'path':'firstnameIsOk', 'mode':'toggle', 'class':'filled', 'args':['firstname']}"/>
</div>
<style>
    .filled{
        outline: 1px solid green;
    }
</style>
```

With this technique, you can achieve more precise validation (by using regular expressions for example). Please note that if you chose a computed property approach, you'll need to provide the list of properties that are used for computation in the *args* attribute. Else, you wouldn't take benefit of the dynamic update.

#### Syntax

| Property  | Description                                                  | Default value |
| :-------- | :----------------------------------------------------------- | :------------ |
| ``path``  | A path to the value to be bound in your model                | *Mandatory*   |
| ``mode``  | Either ``text`` or ``toggle``                                | ``text``      |
| ``class`` | A statically defined class to be toggled when you use the ``toggle`` mode (ignored in ``text`` mode) | ""            |
| ``args``  | A list of paths to values that should also trigger an update when modified. It is mainly used for computed properties with the ``get`` operator. To achieve this, simply put in this array all the attributes that are used in the computation of the value you want to bind. | ``[]``        |

#### Class binding modes

|    Mode    |                         Description                         |
| :--------: | :---------------------------------------------------------: |
|  ``text``  |         Use the content of the property as a class          |
| ``toggle`` | Toggle a statically defined class when the property == true |

#### Notes

* This can be used for hiding content without rebuilding the page using a "display: none;" style.

### data-foreach

#### Usage

Here, we'll discuss about rendering an array of elements using the *data-foreach* directive. As always, we'll start by looking at an example :

```html
<ul>
	<li data-foreach="{'path':'daysOfWeek'}"
		data-bind="{'path':'$elt'}">
    </li>
</ul>
```

In this example, we want our web page to display every string that ``yourModel.daysOfWeek`` contains. To achieve it, we start by adding the *data-foreach* directive pointing on the array property that we want to iterate over. This will copy the ``<li>`` element as many times as there are items in ``yourModel.daysOfWeek``. Then, to bind the value displayed by the `<li>` element, we add the *data-bind* attribute to a special path : *$elt*. This path will refer to each element of the array (``yourModel.daysOfWeek[0]``, ``yourModel.daysOfWeek[1]``, etc.). In this case, as we have an array of strings, we use the root of *$elt* as a path for the displayed value in the *data-bind* attribute.

Let's see a little more complex example :

```html
<div>
	<div data-foreach="{'path':'users'}">
        <div>
            <label>Firstname</label>
            <input type="text" 
                   data-bind="{'path':'$elt.firstname', 'mode':'twoways', 'bindTo':'value'}"/>
            <label>Lastname</label>
            <input type="text" 
                   data-bind="{'path':'$elt.lastname', 'mode':'twoways', 'bindTo':'value'}"/>
        </div>
    </div>
</div>
```

In this case, ``yourModel.users`` refers to an array of objects holding two properties : ``firstname`` and ``lastname``. As you can see, we can access internal properties of *$elt*, even in a *twoways* data-binding mode. 

Let's go a step further with the next example : 

```html
<div>
	<div data-foreach="{'path':'users'}">
        <div>
            <label>Firstname</label>
            <input type="text" 
                   data-bind="{'path':'$elt.firstname', 'mode':'twoways', 'bindTo':'value'}"/>
            <label>Lastname</label>
            <input type="text" 
                   data-bind="{'path':'$elt.lastname', 'mode':'twoways', 'bindTo':'value'}"/>
            <ul>
            	<li data-foreach="{'path':'$elt.friends'}"
                    data-bind="{'path':'$elt.$elt.firstname'}"></li>
            </ul>
        </div>
    </div>
</div>
```

In this third example, we've added a nested *data-foreach* in our template. It will show us a list of the firstnames of the friends of our users. Notice the ``$elt.$elt.firstname``. It can look strange at first sight. In fact, it will be transformed in something like: ``users[m].friends[n].firstname``. Why do we have to precise these *$elt* ? Because we could want to bind to something external to our loop. See this next example:

```html
<div>
	<div data-foreach="{'path':'users'}">
        <div>
            <label>Firstname</label>
            <input type="text" 
                   data-bind="{'path':'$elt.firstname', 'mode':'twoways', 'bindTo':'value'}"/>
            <label>Lastname</label>
            <input type="text" 
                   data-bind="{'path':'$elt.lastname', 'mode':'twoways', 'bindTo':'value'}"/>
            <button data-action="{'path':'removeUser', 'args':['$elt']}">
                Delete
            </button>
        </div>
    </div>
</div>
```

Here, we want to add a button that will delete our user on click. This can be done through the *data-action* directive. This will be bound to the function ``yourModel.removeUser`` with ``user[m]`` as an argument. In fact, you can use *$elt* in every *path* or *args* property of your directives whatever they are (*data-if*, *data-class*, *data-action*, ...)

#### Syntax

| Property | Description                                         | Default value |
| :------- | :-------------------------------------------------- | :------------ |
| ``path`` | A path to the array value to be bound in your model | *Mandatory*   |

### data-component

// TODO

## Understanding Gallimimus

In this section, we'll discover in more details how Gallimimus works under the hood.

### Document lifecycle

// TODO

