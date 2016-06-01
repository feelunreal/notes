var express = require('express'),
	router = express.Router(),
	User = require('../models/user.js'),
	Note = require('../models/note.js'),
	jwt = require('jsonwebtoken'),
	config = require('../config');

router.get('/', function(req, res){
	res.send('Notes API is running');
});

router.post('/authenticate', function(req, res){
	User.findOne({
		login: req.body.login
	}, function(err, user) {
		if (err) throw err;

		if (!user) {
			var user = new User;
			user.login = req.body.login;
			user.password = req.body.password;
			user.save(function(err) {
				if (err) throw err;
				var token = jwt.sign(user, config.get('apiKey'), {
					expiresIn: config.get('apiTokenExpiration')
				});
				res.json({
					success: true,
					message: 'Created new user and token',
					token: token
				});
			})
		} else {
			if (user.checkPassword(req.body.password)) {
				var token = jwt.sign(user, config.get('apiKey'), {
					expiresIn: config.get('apiTokenExpiration')
				});
				res.json({
					success: true,
					message: 'Login success, token created',
					token: token
				});
			} else {
				res.status(400).json({ success: false, message: 'Authentication failed. Wrong password.' });
			}
		}
	});
});

router.get('/users/:user/notes', apiAuth, userTokenMatch, function(req, res){
	Note.aggregate([
		{$match: {
			'author': req.params.user
		}},
		{$project: {
			author: '$author',
			//created: { $dateToString: { format: '%d' + '-%m' +' %H:%M:%S', date: '$created' } },
			created: '$created',
			body: '$body'
		}}
	], function(err, notes) {
		if (err) return res.sendStatus(400);
		for (var i = notes.length - 1; i >= 0; i--) {
			var date = notes[i].created.toString();
			var p = date.split(' ');
			date = p[1] + ' ' + p[2] + ' ' + p[4];
			notes[i].created = date;
		}
		return res.json(notes);
	});
});

router.post('/users/:user/notes', apiAuth, userTokenMatch, function(req, res){
	var note = new Note;
	note.body = req.body.body;
	note.author = req.body.author;

	note.save(function(err) {
		if (err) res.sendStatus(400);
		return res.sendStatus(200);
	});
});

router.put('/users/:user/notes', apiAuth, userTokenMatch, function(req, res){
	Note.findOneAndUpdate({_id: req.body._id}, {$set:{body:req.body.body, created:new Date()}}, {new: true}, function(err){
	    if(err) return res.sendStatus(400);
	    return res.sendStatus(200);
	});
});

router.delete('/users/:user/notes/:_id', apiAuth, userTokenMatch, function(req, res){
	Note.find({
		_id: req.params._id
	}).remove(function(err){
		if (err) return res.sendStatus(400);
		return res.sendStatus(200)
	});
});

// базовая аутентификация проверяет наличие токена в запросе и не истек ли срок действия токена
function apiAuth(req, res, next) {
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	if (token) {
		jwt.verify(token, config.get('apiKey'), function(err, decoded) {
			if (err) {
				var message;
				if (err.name === 'TokenExpiredError') {
					message = 'Failed to authenticate token, token expired at: ' + err.expiresAd;
				} else {
					message = 'Failed to authenticate token, token is invalid';
				}
				return res.status(403).json({
					success: false, message: message
				});
			} else {
				req.decoded = decoded;
				next();
			}
		});
	} else {
		return res.status(403).json({
			success: false,
			message: 'No token provided'
		});
	}
}

// второй уровень аутенцификации, если делается запрос к api, на получение данных определнного пользователя,
// то выполняется проверка соответствия токена и запрошенного пользователя. Сделано это для исключения получения 
// чужих данных (заметок) через api
function userTokenMatch(req, res, next) {
	if (req.decoded._doc.login !== req.params.user) {
		return res.status(403).json({ success: false, message: 'Used token does not match requested user' });
	}
	next();
}

module.exports = router;