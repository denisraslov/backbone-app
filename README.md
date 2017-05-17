# Backbone App
backbone-app is a JavaScript MVC-framework based on BackboneJS, which supports all the needed features to create working Single Page Application:

* Components based architecture

* Routing

* RESTful data fetching & handling  


### How to start
You need just 3 steps to create your app with BlocksJS:

If you don't need to work with remote API:

1. Create App class inherited from BlocksJS.App class.

2. Create pages classes inherited from BlocksJS.Page class.

3. Create Router class inherited from BlockJS.Router class. Specify the list of routes for pages, that you created before.

4. Create some blocks classes (this is how we call components here) inherited from BlocksJS.Block class. You can reuse them several times.

5. Include your blocks in pages templates and in other blocks.

That's all!
