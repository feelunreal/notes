var request = require('request'),
		config = require('../config'),
		api = 'http://127.0.0.1:' + config.get('port') + '/api/';

// sockets
module.exports = function(io) {
	io.on('connection', function(socket){

		var room = socket.handshake.query.user;
		socket.join(room);

		socket.on('load notes', function(data){
			request({
				method: 'GET',
				url: api + 'users/' + data.user + '/notes',
				headers: {
					'x-access-token': data.token
				}
			}, function(err, response, body){
				io.to(room).emit('notes loaded', body);
			});
		});

		socket.on('new note', function(data) {
			request({
				method: 'POST',
				url: api + 'users/' + data.note.author + '/notes',
				headers: {
					'x-access-token': data.token
				},
				json: data.note
			}, function(err, response, body) {
				if (response.statusCode === 200) {
					io.to(room).emit('note saved');
				}
			});
		});

		socket.on('edit note', function(data) {
			request({
				method: 'PUT',
				url: api + 'users/' + data.note.author + '/notes',
				headers: {
					'x-access-token': data.token
				},
				json: data.note
			}, function(err, response, body) {
				if (response.statusCode === 200) {
					io.to(room).emit('note saved');
				}
			});
		});

		socket.on('delete note', function(data) {
			request({
				method: 'DELETE',
				url: api + 'users/' + data.note.author + '/notes/' + data.note._id,
				headers: {
					'x-access-token': data.token
				}
			}, function(err, response, body) {
				if (response.statusCode === 200) {
					io.to(room).emit('note saved');
				}
			});
		});
	});
}