window.CardListItemView = Backbone.View.extend({

	tagName: "li",

	initialize: function () {
		this.model.bind("change", this.render, this);
		this.model.bind("destroy", this.close, this);
	},

	render: function () {
		$(this.el).html(this.template(this.model.toJSON()));
		return this;
	}

});