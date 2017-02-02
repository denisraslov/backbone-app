var Backbone = require('backbone'),
    _ = require('lodash'),
    $ = require('jquery'),
    Block = require('./../block/block');

module.exports = Block.extend({
    el: '#page',
    models: {},
    collections: {},
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
        page.prevPage = window.PAGE;
        window.PAGE = page;

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
    // renderTemplate: function() {
    //     return '<div id="page">' +
    //         this.template(this) +
    //         '</div>';
    // },
    render: function() {
        var page = this,
            result;

        if (page.prevPage) {
            if (page.prevPage != page) {
                page.prevPage.remove();
            } else {
                page.prevPage.removeBlocks();
            }
        }

        result = Block.prototype.render.apply(page, arguments);

        page.loaded();

        return result;
    },
    loading: function () {
        document.getElementById('page').dataset.status = 'loading';
    },
    loaded: function () {
        var page = document.getElementById('page');

        if (page.dataset.status == 'loading') {
            page.dataset.status = 'loaded';
            setTimeout(function () {
                page.dataset.status = '';
            }, 600);
        }
    },
    remove: function () {
        var block = this;

        block.stopListening();
        block.undelegateEvents();
        block.undelegateGlobalEvents();
        block.removeBlocks();
    }
});
