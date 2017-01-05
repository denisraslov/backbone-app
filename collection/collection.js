var Backbone = require('backbone'),
    _ = require('lodash'),
    get = require('./../kit/get'),
    set = require('./../kit/set'),
    makeClass = require('./../kit/makeClass'),
    deepExtend = require('./../kit/deepExtend');

module.exports = makeClass(Backbone.Collection, {
    model: require('./../model/model'),
    sort: {},
    initialize: function(data, options){
        deepExtend(this, options);

        return Backbone.Collection.prototype.initialize.apply(this, arguments);
    },
    getApiUrl: function() {
        return CONFIG.apiUrl;
    },
    getHeaders: function(){},
    sync: function(method, model, options) {
        var data = _.result(this, 'query') || {};

        data = _.omit(data, function(value) {
            return !value;
        });

        if (this.setSellPointId) {
            this.setSellPointId(data);
        }

        options = _.extend({
            url: this.getApiUrl() + _.result(this, 'url'),
            headers: this.getHeaders(),
            data: $.param(data)
        }, options);

        return Backbone.Collection.prototype.sync.call(this, method, model, options);
    },
    fetch: function(options) {
        options = options || {};
        options.reset = true;
        options.afterFetch = true;

        return Backbone.Collection.prototype.fetch.call(this, options);
    },
    getName: function(id) {
        return this.get(id) ? this.get(id).get('name') : '';
    },
    createAllModel: function(name) {
        return new this.model({ id: 'ALL', name: name });
    },
    // select: function(data) {
    //     return data;
    // },
    // reset: function(data, options) {
    //     return Backbone.Collection.prototype.reset.call(
    //         this,
    //         this.select(data),
    //         options
    //     );
    // },

    //-------- utility ---------

    extend: function(data) {
        deepExtend(this, data);
    }
});
