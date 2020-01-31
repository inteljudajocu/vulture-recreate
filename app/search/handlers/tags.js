'use strict';

const h = require('highland'),
  { subscribe, helpers } = require('amphora-search'),
  { getIndexFromFilename, createFilter, getMainComponentRef, put, urlToUri } = require('../utils'),
  index = helpers.indexWithPrefix(getIndexFromFilename(__filename)),
  filter = createFilter({
    components: ['article', 'tags', 'articleTypeTag'],
    includePage: true
  }),
  log = require('../../services/universal/log').setup({ file: __filename });

subscribe('save').through(handleSave);

function handleSave(stream) {
  return stream
    .map(handleStreams)
    .merge()
    .map(putToElastic)
    .errors(logErrors)
    .each(logSuccess);
}

function logErrors(errors) {
  log('errors', errors);
}

function logSuccess(res) {
  log('info', res);
}

function handleStreams(stream) {
  return stream
    .filter(filter)
    .map(helpers.parseOpValue)
    .collect()
    .map(parseComponent);
}

function putToElastic(obj) {
  return put(index, urlToUri(obj.ref), obj.source);
}

function parseComponent(ops) {
  const mainComponent = getMainComponentRef(ops),
    { headline, date, canonicalUrl, tags } = mainComponent.value;

  return {
    key: mainComponent.key,
    source: {
      url: canonicalUrl,
      date: date,
      title: headline,
      tags: tags
    }
  };
}
