var Backbone = require('backbone'),
    _ = require('lodash'),
    $ = require('jquery'),
    Block = require('./../block/block'),
    makeClass = require('./../kit/makeClass');

module.exports = makeClass(Block, {
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

        page.loading();

        window.PAGE = page;

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
