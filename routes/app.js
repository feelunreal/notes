var express = require('express'),
	router = express.Router(),
	request = require('request'),
	config = require('../config'),
	jwt = require('jsonwebtoken'),
	api = 'http://127.0.0.1:' + config.get('port') + '/api/';

router.get('/', isAuthenticated, function(req, res, next) {
	res.render('main', { user: req.session.user, token: req.session.token });
});

router.get('/login', function(req, res) {
	res.render('login', { authMsg: req.flash('authMsg') });
});

router.post('/login', function(req, res) {
	var reqObj = {
		url: api + 'authenticate',
		form: req.body
	};
	request.post(reqObj, function(err, httpResponse, body){
		if (err) throw err;
		if (httpResponse.statusCode == 400) {
			req.flash('authMsg', 'Wrong password');
			res.redirect('/login');
		} else {
			var response = JSON.parse(body);
			if (response.success) {
				req.session.user = req.body.login;
				req.session.token = response.token;
				res.redirect('/');
			}
		}
	});
});

router.get('/logout', function(req, res) {
	req.session.destroy();
	res.redirect('/');
});

router.get('/notes', isAuthenticated, function(req, res, next){
	var user = req.session.user;
	var token = req.session.token;
	var options = {
		method: 'GET',
		url: api + 'users/' + user + '/notes',
		headers: {
			'x-access-token': token
		}
	};
	request(options, function(err, response, body){
		res.json(body);
	});
});

function isAuthenticated(req, res, next) {
	if (req.session.token) {
		jwt.verify(req.session.token, config.get('apiKey'), function(err, decoded) {
			if (err) {
				res.redirect('/logout');
			} else {
				next();
			}
		});
	} else {
		res.redirect('/login');
	}
}

module.exports = router;