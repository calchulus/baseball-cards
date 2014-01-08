var express = require('express'),
	path = require('path'),
	http = require('http'),
	card = require('./routes/cards');

var app = express();

app.configure(function () {
	app.set('port', process.env.PORT || 3000);
	app.use(express.logger('dev'));
	app.use(express.bodyParser()),
		app.use(express.static(path.join(__dirname, 'public')));
});

app.get('/cards', card.findAll);
app.get('/cards/:id', card.findById);
app.post('/cards', card.addCard);
app.put('/cards/:id', card.updateCard);
app.delete('/cards/:id', card.deleteCard);

http.createServer(app).listen(app.get('port'), function () {
	console.log("Express server listening on port " + app.get('port'));
});