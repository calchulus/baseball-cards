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
