var _ = require('lodash');

module.exports = function(object, path) {

      if (!object || !path){
          return object;
      }

      var attr = object,
          segments = path.split('.');

      _.every(segments, function(segment){

          if (typeof attr[segment] === 'function'){
              attr = attr[segment].apply(object);
          } else {
              attr = attr[segment];
          }

          return attr;
      });

      return attr;
  };
