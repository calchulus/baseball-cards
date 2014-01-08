window.utils = {

	// Asynchronously load templates located in separate .html files
	loadTemplate: function(views, callback) {

		var deferreds = [];

		$.each(views, function(index, view) {
			//if (window[view]) {
				deferreds.push($.get('assets/tpl/' + view + '.html', function(data) {
					window[view].prototype.template = _.template(data);
				}));
			//} else {
			//	alert(view + " not found");
			//}
		});

		$.when.apply(null, deferreds).done(callback);
	},

	displayValidationErrors: function (messages) {
		for (var key in messages) {
			if (messages.hasOwnProperty(key)) {
				this.addValidationError(key, messages[key]);
			}
		}
		this.showAlert('Warning!', 'Fix validation errors and try again', 'alert-warning');
	},

	addValidationError: function (field, message) {
		var controlGroup = $('#' + field).parent().parent();
		controlGroup.addClass('error');
		$('.help-inline', controlGroup).html(message);
	},

	removeValidationError: function (field) {
		var controlGroup = $('#' + field).parent().parent();
		controlGroup.removeClass('error');
		$('.help-inline', controlGroup).html('');
	},

	showAlert: function(title, text, klass) {
		$('.alert').removeClass("alert-error alert-warning alert-success alert-info");
		$('.alert').addClass(klass);
		$('.alert').html('<strong>' + title + '</strong> ' + text);
		$('.alert').show();
	},

	hideAlert: function() {
		$('.alert').hide();
	}

};
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
window.Card = Backbone.Model.extend({

	urlRoot: "/cards",

	idAttribute: "_id",

	initialize: function () {
		this.validators = {};

		this.validators.name = function (value) {
			return value.length > 0 ? {isValid: true} : {isValid: false, message: "You must enter a name"};
		};

		this.validators.manufacturer = function (value) {
			return value.length > 0 ? {isValid: true} : {isValid: false, message: "You must enter a manufacturer"};
		};

		this.validators.year = function (value) {
			return value.length > 0 ? {isValid: true} : {isValid: false, message: "You must enter a year"};
		};

		this.validators.picture = function (value) {
			return value.length > 0 ? {isValid: true} : {isValid: false, message: "You must enter an image"};
		};
	},

	validateItem: function (key) {
		return (this.validators[key]) ? this.validators[key](this.get(key)) : {isValid: true};
	},

	// TODO: Implement Backbone's standard validate() method instead.
	validateAll: function () {

		var messages = {};

		for (var key in this.validators) {
			if(this.validators.hasOwnProperty(key)) {
				var check = this.validators[key](this.get(key));
				if (check.isValid === false) {
					messages[key] = check.message;
				}
			}
		}

		return _.size(messages) > 0 ? {isValid: false, messages: messages} : {isValid: true};
	},

	defaults: {
		_id: null,
		name: "",
		manufacturer: "",
		year: "",
		picture: ""
	}
});


window.CardCollection = Backbone.Collection.extend({

	model: Card,

	url: "/cards"

});
window.CardView = Backbone.View.extend({

	initialize: function () {
		this.render();
	},

	render: function () {
		$(this.el).html(this.template(this.model.toJSON()));
		return this;
	},

	events: {
		"change"        : "change",
		"click .save"   : "beforeSave",
		"click .delete" : "deleteCard",
		"drop #pictureImg" : "dropHandler"
	},

	change: function (event) {
		// Remove any existing alert message
		utils.hideAlert();

		// Apply the change to the model
		var target = event.target;
		var change = {};
		change[target.name] = target.value;
		this.model.set(change);

		// Run validation rule (if any) on changed item
		var check = this.model.validateItem(target.id);
		if (check.isValid === false) {
			utils.addValidationError(target.id, check.message);
		} else {
			utils.removeValidationError(target.id);
		}
	},

	beforeSave: function () {
		var self = this;
		var check = this.model.validateAll();
		if (check.isValid === false) {
			utils.displayValidationErrors(check.messages);
			return false;
		}
		this.saveCard();
		return false;
	},

	saveCard: function () {
		var self = this;
		console.log('before save');
		this.model.save(null, {
			success: function (model) {
				self.render();
				app.navigate('cards/' + model.id, false);
				utils.showAlert('Success!', 'Card saved successfully', 'alert-success');
			},
			error: function () {
				utils.showAlert('Error', 'An error occurred while trying to delete this item', 'alert-error');
			}
		});
	},

	deleteCard: function () {
		this.model.destroy({
			success: function () {
				alert('Card deleted successfully');
				window.history.back();
			}
		});
		return false;
	},

	dropHandler: function (event) {
		console.log('dropHandler');
		log('dropHandler');
		event.stopPropagation();
		event.preventDefault();
		var e = event.originalEvent;
		e.dataTransfer.dropEffect = 'copy';
		this.pictureFile = e.dataTransfer.files[0];
		console.log(event);
		console.log(this);

		// Read the image file from the local file system and display it in the img tag
		var reader = new FileReader();
		reader.onloadend = function () {
			$('#pictureImg').attr('src', reader.result);
		};
		reader.readAsDataURL(this.pictureFile);
	}

});
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
window.HeaderView = Backbone.View.extend({

	initialize: function () {
		this.render();
	},

	render: function () {
		$(this.el).html(this.template());
		return this;
	},

	selectMenuItem: function (menuItem) {
		$('.nav li').removeClass('active');
		if (menuItem) {
			$('.' + menuItem).addClass('active');
		}
	}

});
window.HomeView = Backbone.View.extend({

	initialize:function () {
		this.render();
	},

	render:function () {
		$(this.el).html(this.template());
		return this;
	}

});
window.Paginator = Backbone.View.extend({

	className: "pagination",

	initialize:function () {
		this.model.bind("reset", this.render, this);
		this.render();
	},

	render:function () {

		var items = this.model.models;
		var len = items.length;
		var pageCount = Math.ceil(len / 6);

		$(this.el).html('<ul class="pagination" />');

		for (var i=0; i < pageCount; i++) {
			$('ul', this.el).append("<li" + ((i + 1) === this.options.page ? " class='active'" : "") + "><a href='#cards/page/"+(i+1)+"'>" + (i+1) + "</a></li>");
		}

		return this;
	}
});