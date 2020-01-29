'use strict';

function getData(data, locals) {
  if (data.keyTag.lenght != 0) {
    data.keyTag = data.keyTag.splice(0, 1);
  }
  return data;
}

module.exports.save = function(uri, data, locals) {
  getData(data);
  return data;
};
