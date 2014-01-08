var AppRouter = Backbone.Router.extend({
	routes: {
		"" : "home",
		"cards" : "list",
		"cards/page/:page" : "list",
		"cards/add" : "addCard",
		"cards/:id" : "cardDetails"
	},

	initialize: function() {
		this.headerView = new HeaderView();
		$('.header').html(this.headerView.el)
	},

	home: function (id) {
		if (!this.homeView) {
			this.homeView = new HomeView();
		}
		$('#content').html(this.homeView.el);
		this.headerView.selectMenuItem('home-menu');
	},

	list: function(page) {
		var p = page ? parseInt(page, 10) : 1;
		var cardList = new CardCollection();
		cardList.fetch({success: function(){
			$("#content").html(new CardListView({model: cardList, page: p}).el);
		}});
		this.headerView.selectMenuItem('home-menu');
	},

	cardDetails: function (id) {
		var card = new Card({_id: id});
		card.fetch({success: function(){
			$("#content").html(new CardView({model: card}).el);
		}});
		this.headerView.selectMenuItem();
	},

	addCard: function() {
		var card = new Card();
		$('#content').html(new CardView({model: card}).el);
		this.headerView.selectMenuItem('add-menu');
	}

});

utils.loadTemplate(['HomeView', 'HeaderView', 'CardView', 'CardListItemView'], function() {
	app = new AppRouter();
	Backbone.history.start();
});