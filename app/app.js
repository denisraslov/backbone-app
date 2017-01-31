var Backbone = require('backbone'),
    _ = require('lodash'),
    $ = require('jquery'),
    Block = require('./../block/block');

$(document).ajaxError(function (event, error) {
    switch (error.status) {
        case 401:
            Backbone.History.started && document.location.reload();
            break;
        case 400:
            break;
        case 406:
            break;
        case 409:
            break;
        case 422:
            break;
        default:
            console.warn(event, error);

            if (error.statusText != 'abort' && window.PAGE) {
                APP.showAPIError(error);
            }

            break;
    }
});

module.exports = Block.extend({
    el: '#app',
    events: {
        'click [href]:not([external])': function (e) {
            e.stopPropagation();

            var app = this;

            if (e.currentTarget.dataset.navigate !== '0') {
                e.preventDefault();

                app.navigate(e.currentTarget.getAttribute('href'), {
                    trigger: e.currentTarget.dataset.trigger !== '0',
                    replace: e.currentTarget.dataset.replace == '1'
                });
            }
        }
    },
    renderTemplate: function() {
        return '<div id="app">' +
                '<div id="page">' +
                    this.template(this) +
                '</div>' +
            '</div>';
    },
    navigate: function(url, params) {
        return this.router.navigate.apply(this.router, arguments);
    },
    showAPIError: function(data) {
        var app = this;

        app.showMessage('Произошла ошибка API. ' + data.statusText + ' - ' +
            data.status + '.<br>Попробуйте обновить страницу.');
    },
    showMessage: function(text) {
        alert(text);
    },
    initialize: function() {
        var app = this,
            result = Block.prototype.initialize.apply(this, arguments),
            router;

        window.APP = app;

        this.render();

        $.when(this.fetch())
          .then(function() {
              app.router = app.initRouter(true).then(function(router) {
                  console.log(router)
                 app.router = router;
                 Backbone.history.start({pushState: true});
              });
          })
          .fail(function() {
              app.router = app.initRouter(false).then(function(router) {
                 app.router = router;
                 Backbone.history.start({pushState: true});
              });
          })
    }
});
