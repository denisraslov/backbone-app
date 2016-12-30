var _ = require('lodash');

function makeClass(parent) {

    var instance = true,
        protoProps = _.merge.apply(null, [
            {}
        ].concat([].slice.call(arguments, 1)));

    var child = function() {
        var args;
        if (this instanceof child) {
            args = instance ? arguments : arguments[0];
            instance = true;

            for (var prop in this){
                if (_.isPlainObject(this[prop])){
                    this[prop] = _.merge({}, this[prop]);
                }

                if (_.isArray(this[prop])){
                    this[prop] = _.cloneDeep(this[prop]);
                }
            }

            if (protoProps && _.has(protoProps, 'constructor')) {
                return protoProps.constructor.apply(this, args);
            } else {
                return parent.apply(this, args);
            }
        } else {
            instance = false;
            return new child(arguments);
        }
    };

    child.prototype = Object.create(parent.prototype);

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) {
        _.merge(child.prototype, protoProps);
    }

    return _.merge(child, parent, {
        extend: function() {
            var args = [this].concat([].slice.call(arguments));
            return makeClass.apply(null, args);
        }
    });
};

module.exports = makeClass;