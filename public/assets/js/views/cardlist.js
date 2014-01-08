window.CardListView = Backbone.View.extend({

	initialize: function () {
		this.render();
	},

	render: function () {
		var cards = this.model.models;
		var len = cards.length;
		var startPos = (this.options.page - 1) * 6;
		var endPos = Math.min(startPos + 6, len);

		$(this.el).html('<ul class="thumbnails"></ul>');

		for (var i = startPos; i < endPos; i++) {
			$('.thumbnails', this.el).append(new CardListItemView({model: cards[i]}).render().el);
		}

		$(this.el).append(new Paginator({model: this.model, page: this.options.page}).render().el);

		return this;
	}
});