# Backbone.Projections

Backbone.Projections is a library of projections for Backbone.Collection.

Projection is a read-only collection which contains some subset of an other
underlying collection and stays in sync with it. That means that projection will
respond correspondingly to `add`, `remove` and other events from an underlying
collection.

Currently there are two available projections — `CappedCollection` and
`FilteredCollection`.

## CappedCollection

`CappedCollection` provides a projection of a limited number of elements from an
underlying collection:

    {CappedCollection} = require 'backbone.projections'

    collection = new Collection([...])
    capped = new CappedCollection(collection, cap: 5)

Using `cap` parameter you can restrict the number of models capped collection
will contain. By default this projection tries to maintain the order of models
induced by underlying collection but you can also pass custom comparator, for
example

    topPosts = new CappedCollection(posts,
      cap: 10
      comparator: (post) -> - post.get('likes'))

will create a `topPosts` collection which will contain first 10 most "liked"
posts from underlying `posts` collection.

## FilteredCollection

`FilteredCollection` provides a projection which contains a subset of models
from an underlying collection which match some predicate.

    {FilteredCollection} = require 'backbone.projections'

    todaysPosts = new FilteredCollection(posts,
      filter: (post) -> post.get('date').isToday())

The example above will create a `todaysPosts` projection which only contains
"today's" posts from the underlying `posts` collection.

By default this projection tries to maintain the order of models
induced by underlying collection but you can also pass custom comparator.

## Complex predicates which depend on some changing data

`FilteredCollection` can be a base for complex projection which includes more
than a single collection, as an example we will implement a difference between
two collections:

    class Difference extends FilteredCollection
      constructor: (underlying, subtrahend, options = {}) ->
        options.filter = (model) -> not subtrahend.contains(model)
        super(underlying, options)
        this.listenTo subtrahend, 'add remove reset', this.update.bind(this)


    a = new Model()
    b = new Model()
    c = new Model()
    d = new Model()

    underlying = new Collection [a, b, c]
    subtrahend = new Collection [b, c, d]

    diff = new Difference(underlying, subtrahend)

This way `diff` will contain only models from `underlying` which are not members
of `subtrahend` collection and what's more important `diff` will track changes
in `subtrahend` and update itself accordingly.

But that's a quick'n'dirty way of implementing this because on each change to
`subtrahend` the difference will reexamine entire `underlying` collection. Let's
implement this in a more efficient way:

    class EfficientDifference extends FilteredCollection
      constructor: (underlying, subtrahend, options = {}) ->
        options.filter = (model) -> not subtrahend.contains(model)
        super(underlying, options)
        this.listenTo subtrahend,
          add: (model) =>
            this.remove(model) if this.contains(model)
          remove: (model) =>
            this.add(model) if this.underlying.contains(model)
          reset: this.update.bind(this)

## Composing projections

You can compose different projection which each other, for example

    todaysPosts = new FilteredCollection(posts,
      filter: (post) -> post.get('date').isToday())
    topTodaysPosts = new CappedCollection(todaysPosts,
      cap: 5
      comparator: (post) -> - post.get('likes'))

will result in a `topTodaysPosts` projection which only contains "top 5 most
liked posts from today".
