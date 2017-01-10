var Backbone = require('backbone'),
    _ = require('lodash'),
    $ = require('jquery'),
    get = require('./../kit/get'),
    set = require('./../kit/set'),
    makeClass = require('./../kit/makeClass');

module.exports = makeClass(Backbone.Model, {
    constructor: function(attributes, options){
        options = _.extend({
            parse: true
        }, options);

        Backbone.Model.call(this, attributes, options);
    },
    getHeaders: function(){},
    getApiUrl: function() {},
    sync: function(method, model, options) {
        options = _.extend({
            url: options.url || this.getApiUrl() + _.result(this, 'url'),
            headers: this.getHeaders()
        }, options);

        var result = Backbone.Model.prototype.sync.call(this, method, model, options);

        return result;
    },
    toJSON: function(options) {
        options = options || {};

        if (options.isSave) {
            return this.getData();
        }

        return Backbone.Model.prototype.toJSON.apply(this, arguments);
    },
    getData: function() {
        var saveData;

        if (_.isFunction(this.saveData)) {
            saveData = this.saveData();
        }

        if (_.isArray(this.saveData)) {
            saveData = _.pick(this.toJSON(), this.saveData);
        }

        return saveData;
    },
    get: function(path) {
        return get(this, 'attributes.' + path);
    },
    save: function(attributes, options) {
        return Backbone.Model.prototype.save.call(this, attributes, _.extend({
            wait: true,
            isSave: true
        }, options));
    },
    destroy: function(options) {
        return Backbone.Model.prototype.destroy.call(this, _.extend({
            wait: true
        }, options))
    },
    parse: function(data) {
        var model = this;

        data = data || {};

        _.forEach(model.collections, function(collectionConstructor, key) {

            if (typeof collectionConstructor === 'function'){
                model.collections[key] = new collectionConstructor;
            }

            if (model.collections[key] instanceof Backbone.Collection){
                model.collections[key].reset(data[key]);
            }
        });

        _.forEach(model.models, function(modelConstructor, key) {

            if (typeof modelConstructor === 'function'){
                model.models[key] = modelConstructor.call(modelConstructor);
            }

            if (model.models[key] instanceof Backbone.Model){
                model.models[key].set(data[key]);
            }
        });

        return data;
    },
    clear: function(){

        var model = this;

        var _super = Backbone.Model.prototype.clear.apply(model, arguments);

        model.set(model.__defaults);

        _.forEach(model.collections, function(nestedCollection) {
            nestedCollection.reset([]);
        });

        _.forEach(model.models, function(nestedModel) {
            nestedModel.clear();
        });

        return _super;
    },
    saveData: function(){
        return this.toJSON();
    },
    fetch: function(options) {
        var data;

        for (var i in this.query) {
            if (typeof(this.query[i]) === 'function') {
                this.query[i] = this.query[i].bind(this);
            }
        }

        data = _.result(this, 'query') || {};

        data = _.omit(data, function(value) {
            return !value;
        });

        options = _.extend({
            data: data
        }, options);

        var model = this,
            xhr = Backbone.Model.prototype.fetch.call(model, options),
            deferred;

        deferred = xhr.then(function(responseText, status, xhr) {
            model.parse(model.attributes);
        });

        deferred.xhr = xhr;

        return deferred;
    },
    getName: function() {
        return this.get('name');
    }
});
