'use strict';

const { search } = require('../../services/server/elastic'),
  query = {
    _source: ['url', 'date', 'title'],
    size: 5,
    sort: [{ date: 'desc' }],
    query: {
      match_all: {}
    }
  };

function getArticleElastic(data) {
  return search('local_tags', query)
    .then(({ hits }) => hits.hits)
    .then(hits => hits.map(({ _source }) => _source))
    .then(res => {
      data.stories = res;
      return data;
    });
}

module.exports.render = function(uri, data) {
  return getArticleElastic(data).then(data => data);
};
