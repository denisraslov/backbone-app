var Backbone = require('backbone'),
    _ = require('lodash'),
    $ = require('jquery'),
    get = require('./../kit/get'),
    set = require('./../kit/set');

module.exports = Backbone.View.extend({
    globalEvents: {},
    children: [],
    isFirstRenderingCompleted: false,

    initialize: function(data) {

        this.cid = _.uniqueId('block');

        this.stopListening();

        _.merge(this, data);

        this.initCollections();
        this.initModels();

        this._ensureElement();

        this.trigger('initializing');
    },
    renderTemplate: function() {
        return this.template(this);
    },
    render: function(data) {
        this.trigger('rendering');

        _.merge(this, data);

        this.delegateEvents();

        if (this.template) {
            this.setElement($(this.renderTemplate()).replaceAll(this.el));
        }

        this.removeBlocks();
        this.initBlocks();

        this.el.block = this;

        this.isFirstRenderingCompleted = true;

        this.trigger('rendered');

        this.delegateGlobalEvents();
    },

    initCollections: function () {
        var collections = this.collections;

        _.forEach(collections, function(Collection, name) {
            collections[name] = new Collection;
        });

        if (this.collection) {
            this.collection = new this.collection;
        }
    },

    initModels: function () {
        var models = this.models;

        _.forEach(models, function(Model, name) {
            models[name] = new Model;
        });

        if (this.model) {
            this.model = new this.model;
        }
    },

    childConstructors: {},
    include: function(constructor, params) {

        params = _.extend({
            tag: 'b'
        }, params);

        var block = this,
            id = _.uniqueId('tmp-'),
            placeholder = '<' + params.tag + ' block="' + id + '"></' + params.tag + '>';

        this.childConstructors[id] = function(opt) {
            return new constructor(_.extend(opt, params));
        };

        return placeholder;
    },

    initBlocks: function () {
        var block = this,
            $blocks = block.$('[block]');

        $blocks.each(function () {
            var placeholder = this,
                id = $(placeholder).attr('block'),
                constructor = block.childConstructors[id],
                params = {};

            params.el = placeholder;
            params.parentBlock = block;

            block.initBlock(constructor, params);
        });
    },

    initBlock: function (constructor, params) {
        var block = this,
            child = constructor.call(block, _.extend({}, params, {
                parentBlock: block
            }));

        block.children.push(child);

        if (child && child.el) {
            child.el.removeAttribute('block');
        }

        child.render();

        return child;
    },

    remove: function () {
        var block = this;

        block.stopListening();
        block.undelegateEvents();
        block.undelegateGlobalEvents();
        block.removeBlocks();

        if (!block.innerTemplate){
            Backbone.View.prototype.remove.apply(block, arguments);
        }
    },

    removeBlocks: function () {
        var block = this;

        _.each(block.children, function (blockToRemove) {

            if (blockToRemove && typeof blockToRemove.remove === 'function') {
                blockToRemove.remove();
            }

        });

        block.children = [];
    },

    trigger: function (event, data) {
        var block = this;

        block.$el.trigger(event, data);

        return Backbone.View.prototype.trigger.apply(block, arguments);
    },
    delegateGlobalEvents: function () {
        var block = this;

        block.undelegateGlobalEvents();

        _.each(block.globalEvents, function (handler, event) {
            var path = event.split(' '),
                eventName = path.shift();

            //console.log('Global event delegated: ', eventName + '.' + block.cid);

            if (path.length) {
                $(document).on(eventName + '.' + block.cid, path.join(' '), handler.bind(block));
            } else {
                $(document).on(eventName + '.' + block.cid, handler.bind(block));
            }

        });
    },
    undelegateGlobalEvents: function() {
        $(document).off('.' + this.cid);
    },

    //---------- fetch ----------

    fetch: function(resources) {
        var block = this;

        var collectionsList = _(block.collections).filter(function(collection, name) {
            return !resources || (resources.collections && resources.collections.indexOf(name) != -1);
        }).value();

        var modelsList = _(block.models).filter(function(model, name) {
            return (!resources || (resources.models && resources.models.indexOf(name) != -1)) && model && model.id;
        }).value();

        var dataList = collectionsList.concat(modelsList);

        block.fetchList = _.map(dataList, function(data) {
            return (data && typeof data.fetch === 'function') ? data.fetch() : data;
        });

        return $.when.apply($, block.fetchList).then(function() {
            delete block.fetchList;
        });

    },
    stopFetch: function() {
        var block = this;

        if (block.fetchList) {
            _.each(block.fetchList, function(deferred) {
                if (deferred.abort) {
                    deferred.abort();
                } else if (deferred.xhr) {
                    deferred.xhr.abort();
                }
            });
        }

        delete block.fetchList;
    },

    //-------- utility ---------

    get: function(path) {
      return get(this, path);
    },
    set: function() {
      var args = [this].concat([].slice.call(arguments)),
          result = set.apply(null, args);

          this.trigger('set', result);

          return result;
    }
});
