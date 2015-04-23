// Generated by CoffeeScript 1.6.3
var Collection, extend, inducedOrdering,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Collection = ((typeof window !== "undefined" && window !== null ? window.Backbone : void 0) || require('backbone')).Collection;

extend = ((typeof window !== "undefined" && window !== null ? window._ : void 0) || require('underscore')).extend;

inducedOrdering = function(collection) {
  var func;
  func = function(model) {
    return collection.indexOf(model);
  };
  func.induced = true;
  return func;
};

exports.Filtered = (function(_super) {
  __extends(Filtered, _super);

  function Filtered(underlying, options) {
    var _this = this;
    if (options == null) {
      options = {};
    }
    this.underlying = underlying;
    this.model = underlying.model;
    this.comparator = options.comparator || inducedOrdering(underlying);
    this.options = extend({}, underlying.options, options);
    Filtered.__super__.constructor.call(this, this.underlying.models.filter(this.options.filter), options);
    this.listenTo(this.underlying, {
      reset: function() {
        return _this.reset(_this.underlying.models.filter(_this.options.filter));
      },
      remove: function(model) {
        if (_this.contains(model)) {
          return _this.remove(model);
        }
      },
      add: function(model) {
        if (_this.options.filter(model)) {
          return _this.add(model);
        }
      },
      change: function(model) {
        return _this.decideOn(model);
      },
      sort: function() {
        if (_this.comparator.induced) {
          return _this.sort();
        }
      }
    });
  }

  Filtered.prototype.update = function() {
    var model, _i, _len, _ref, _results;
    _ref = this.underlying.models;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      model = _ref[_i];
      _results.push(this.decideOn(model));
    }
    return _results;
  };

  Filtered.prototype.decideOn = function(model) {
    if (this.contains(model)) {
      if (!this.options.filter(model)) {
        return this.remove(model);
      }
    } else {
      if (this.options.filter(model)) {
        return this.add(model);
      }
    }
  };

  return Filtered;

})(Collection);

exports.FilteredCollection = exports.Filtered;
