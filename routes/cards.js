
var mongo = require('mongodb');

var Server = mongo.Server,
	Db = mongo.Db,
  	BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('baseballcarddb', server);

db.open(function(err, db) {
	if(!err) {
		console.log("Connected to 'baseballcarddb' database");
		db.collection('cards', {strict:true}, function(err, collection) {
			if (err) {
				console.log("The 'cards' collection doesn't exist. Creating it with sample data...");
				populateDB();
			}
		});
	}
});

exports.findById = function(req, res) {
	var id = req.params.id;
	console.log('Retrieving card: ' + id);
	db.collection('cards', function(err, collection) {
		collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
			res.send(item);
		});
	});
};

exports.findAll = function(req, res) {
	db.collection('cards', function(err, collection) {
		collection.find().toArray(function(err, items) {
			res.send(items);
		});
	});
};

exports.addCard = function(req, res) {
	var card = req.body;
	console.log('Adding card: ' + JSON.stringify(card));
	db.collection('cards', function(err, collection) {
		collection.insert(card, {safe:true}, function(err, result) {
			if (err) {
				res.send({'error':'An error has occurred'});
			} else {
				console.log('Success: ' + JSON.stringify(result[0]));
				res.send(result[0]);
			}
		});
	});
};

exports.updateCard = function(req, res) {
	var id = req.params.id;
	var card = req.body;
	console.log('Updating card: ' + id);
	console.log(JSON.stringify(card));
	db.collection('cards', function(err, collection) {
		collection.update({'_id':new BSON.ObjectID(id)}, card, {safe:true}, function(err, result) {
			if (err) {
				console.log('Error updating card: ' + err);
				res.send({'error':'An error has occurred'});
			} else {
				console.log('' + result + ' document(s) updated');
				res.send(card);
			}
		});
	});
};

exports.deleteCard = function(req, res) {
	var id = req.params.id;
	console.log('Deleting card: ' + id);
	db.collection('cards', function(err, collection) {
		collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
			if (err) {
				res.send({'error':'An error has occurred - ' + err});
			} else {
				console.log('' + result + ' document(s) deleted');
				res.send(req.body);
			}
		});
	});
};

var populateDB = function() {

	var cards = [
		{
			name: "Mickey Mantle",
			year: "1961",
			manufacturer: "Topps",
			picture: "mickey_mantle_1961_topps.jpg"
		},
		{
			name: "George Brett",
			year: "1975",
			manufacturer: "Topps",
			picture: "george_brett_1975_topps.jpg"
		}];

	db.collection('cards', function(err, collection) {
		collection.insert(cards, {safe:true}, function(err, result) {});
	});

};