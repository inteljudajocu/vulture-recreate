'use strict';

const h = require('highland'),
  { subscribe, helpers } = require('amphora-search'),
  {
    put,
    del,
    urlToUri,
    uriToPublished,
    createFilter,
    getIndexFromFilename,
    getMainComponentRef,
    getComponentByName
  } = require('../utils'),
  index = helpers.indexWithPrefix(getIndexFromFilename(__filename)),
  filter = createFilter({
    components: ['article', 'tags'],
    includePage: true
  }),
  log = require('../../services/universal/log').setup({ file: __filename });

subscribe('save').through(handleSave);

subscribe('unpublishPage').through(handleUnpublish);

function handleSave(stream) {
  return stream
    .map(handleStreams)
    .merge()
    .map(putToElastic)
    .errors(logErrors)
    .each(logSuccess);
}

function handleStreams(stream) {
  return stream
    .filter(filter)
    .map(helpers.parseOpValue)
    .collect()
    .map(parseComponent);
}

function parseComponent(ops) {
  const mainComponent = getMainComponentRef(ops),
    tags = getComponentByName(ops, 'tags'),
    { items } = tags.value,
    { headline, date, canonicalUrl } = mainComponent.value;

  return {
    key: mainComponent.key,
    source: {
      url: canonicalUrl,
      date: date,
      title: headline,
      items
    }
  };
}

function putToElastic(obj) {
  return put(index, urlToUri(obj.ref), obj.source);
}

function handleUnpublish(stream) {
  return stream
    .tap(console.log)
    .map(handleStreamUnpublish)
    .errors(logErrors)
    .each(logSuccess);
}

function handleStreamUnpublish(op) {
  return del(index, uriToPublished(op.uri));
}

function logErrors(errors) {
  log('errors', errors);
}

function logSuccess(res) {
  log('info', res);
}
