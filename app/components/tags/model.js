'use strict';
const _map = require('lodash/map'),
  _assign = require('lodash/assign'),
  _set = require('lodash/set'),
  _includes = require('lodash/includes'),
  { removeNonAlphanumericCharacters } = require('../../services/universal/sanitize'),
  // invisible tags will be rendered to the page but never visible outside of edit mode
  invisibleTags = [],
  primaryTags = [],
  { search } = require('../../services/server/elastic'),
  query = {
    query: { match_all: {} }
  };

let tags = [];

/**
 * Removes all non alphanumeric characters from the tags
 * @param {array} items
 * @returns {array}
 */
function normalizeTags(items = []) {
  return items.map(({ text }) => removeNonAlphanumericCharacters(text)).filter(Boolean);
}

/**
 * make sure all tags are lowercase and have trimmed whitespace
 * @param  {array} items
 * @return {array}
 */
function clean(items) {
  return _map(items || [], function(item) {
    return _assign({}, item, { text: item.text.toLowerCase().trim() });
  });
}

/**
 * set an 'invisible' boolean on tags, if they're in the list above
 * @param {array} items
 * @return {array}
 */
function setInvisible(items) {
  return _map(items || [], function(item) {
    return _set(item, 'invisible', _includes(invisibleTags, item.text));
  });
}

function setPrimary(items) {
  return _map(items || [], function(item) {
    return _set(item, 'primary', _includes(primaryTags, item.text));
  });
}

function madePrimary(items) {
  if (items[0] != undefined) items[0].primary = true;
  return items;
}

function getTagsElastic(uri, data) {
  return search('local_tags', query)
    .then(({ hits }) => hits.hits)
    .then(hits => hits.map(({ _source }) => _source))
    .then(res => {
      data = res;
      console.log(data);
      return data;
    });
}

module.exports.render = function(uri, data) {
  tags = getTagsElastic(data);
  return data;
};

module.exports.save = function(uri, data) {
  let { items } = data;

  items = clean(items); // first, make sure everything is lowercase and has trimmed whitespace
  data.normalizedTags = normalizeTags(items);
  items = setInvisible(items); // then figure out which tags should be invisible
  items = setPrimary(items);
  items = madePrimary(items);
  data.items = items;
  return data;
};
