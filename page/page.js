var Backbone = require('backbone'),
    _ = require('lodash'),
    $ = require('jquery'),
    Block = require('./../block/block');

module.exports = Block.extend({
    el: '#page',
    defaultParams: {},
    template: function() {
        return '<div class="content"></div>';
    },
    initialize: function() {
        var page = this,
            fetching = $.Deferred();

        if (!page.checkAccess()) {
            return false;
        }

        window.PAGE && window.PAGE.stopFetch();

        page.loading();

        $.when(Block.prototype.initialize.apply(page, arguments)).then(function(){
            $.when(page.fetch()).then(function() {
                return page.render();
            })
        });
    },
    checkAccess: function() {
        return true;
    },
    renderTemplate: function() {
        return '<div id="page">' +
            this.template(this) +
            '</div>';
    },
    render: function() {
        var page = this,
            prevPageEl = document.getElementById('page'),
            result;

        if (window.PAGE) {
            if (window.PAGE != page) {
                window.PAGE.remove();
            } else {
                window.PAGE.removeBlocks();
            }
        }

        result = Block.prototype.render.apply(page, arguments);

        page.loaded();

        window.PAGE = page;

        return result;
    },
    fetch: function(resources) {
        var page = this;

        var collectionsList = _(page.collections).filter(function(collection, name) {
            return !resources || (resources.collections && resources.collections.indexOf(name) != -1);
        }).value();

        var modelsList = _(page.models).filter(function(model, name) {
            return (!resources || (resources.models && resources.models.indexOf(name) != -1)) && model && model.id;
        }).value();

        var dataList = collectionsList.concat(modelsList);

        page.fetchList = _.map(dataList, function(data) {
            return (data && typeof data.fetch === 'function') ? data.fetch() : data;
        });

        return $.when.apply($, page.fetchList).then(function() {
            delete page.fetchList;
        });

    },
    stopFetch: function() {
        var page = this;

        if (page.fetchList) {
            _.each(page.fetchList, function(deferred) {
                if (deferred.abort) {
                    deferred.abort();
                } else if (deferred.xhr) {
                    deferred.xhr.abort();
                }
            });
        }

        delete page.fetchList;
    },
    loading: function () {
        document.getElementById('page').dataset.status = 'loading';
    },
    loaded: function () {
        document.getElementById('page').dataset.status = 'loaded';
    },
    remove: function () {
        var block = this;

        block.stopListening();
        block.undelegateEvents();
        block.undelegateGlobalEvents();
        block.removeBlocks();
    }
});
