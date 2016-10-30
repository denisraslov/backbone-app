
var Backbone = require('backbone'),
    _ = require('lodash'),
    $ = require('jquery');

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
    }
});
