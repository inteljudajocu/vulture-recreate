'use strict';

const primaryTags = [];

function getData(data) {
  data.keyTag.forEach(element => {
    if (element.primary) primaryTags.push(element);
    console.log('tags primarios');
    console.log(primaryTags);
  });
  data.keyTag = primaryTags;

  return data;
}

module.exports.save = function(uri, data, locals) {
  getData(data);
  return data;
};
