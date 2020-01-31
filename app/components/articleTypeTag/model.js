'use strict';

const primaryTags = [];

function getData(data) {
  data.keyTag.forEach(element => {
    if (element.primary) primaryTags.push(element);
  });
  data.keyTag = primaryTags;

  return data;
}

module.exports.save = function(uri, data, locals) {
  getData(data);
  return data;
};
