var _ = require('lodash');

function getChanges(newData, oldData) {

      var changes = {};

      if (newData === oldData) {
          return {};
      }

      if (!_.isPlainObject(newData)) {
          return newData;
      }

      _.forOwn(newData, function (value, key) {
          if (_.isPlainObject(value) && oldData[key]) {
              changes[key] = getChanges(value, oldData[key]);

              if (_.isEmpty(changes[key]) && !_.isEmpty(value)) {
                  delete changes[key];
              }

          } else if (oldData[key] !== value) {
              changes[key] = value;
          }
      });

      return changes;
  }

  function pathToObject(path, value) {
      var object = {},
          attr = object,
          segments = path.split('.');

      _.each(segments, function (segment, index) {
          if (index === segments.length - 1) {
              attr[segments[segments.length - 1]] = value;
          } else {
              attr[segment] = {};
          }
          attr = attr[segment];
      });

      return object;
  }

  function set(object, newData) {

      _.forOwn(newData, function(value, key){

          if (_.isPlainObject(value) && _.isPlainObject(object[key])){
              set(object[key], value);
          } else if (_.isArray(value) && _.isArray(object[key])){
              object[key].splice.apply(object[key], [0, object[key].length].concat(value));
          } else {
              object[key] = value;
          }

      });

  }

  module.exports = function (object, path, data) {
      var changedData;

      if (typeof path === 'string') {
          data = pathToObject(path, data);
      } else {
          data = path;
      }

      changedData = getChanges(data, object);

      set(object, changedData);

      return changedData;
  };
