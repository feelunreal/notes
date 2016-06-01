(function(){
	var app = angular.module('notesApp', []);

	app.factory('socket', function() {
		var socket = io.connect({ query: 'user=' + user });
		return socket;
	});

	app.controller('NotesCtrl', function($scope, socket) {
		$('.loader').fadeIn();
		socket.emit('load notes', {
			user: user,
			token: token
		});
		socket.on('notes loaded', function(notes) {
			$scope.notes = JSON.parse(notes);
			$scope.$apply();
			$('.loader').fadeOut();
		});
		socket.on('note saved', function() {
			socket.emit('load notes', {
				user: user,
				token: token
			});
		});

		$scope.saveNote = function($event) {
			if ($event.keyCode === 13) {
				var note = {
					body: $scope.newNote,
					author: user
				};
				socket.emit('new note', {
					token: token,
					note: note
				});
			}
		}

		$scope.deleteNote = function(_id) {
			socket.emit('delete note', {
				token: token,
				note: {
					_id: _id,
					author: user
				}
			});
		}
	});

	app.directive('contenteditable', function(socket) {
	    return {
	        require: 'ngModel',
	        link: function(scope, elm, attrs, ctrl) {
	            // view -> model
	            elm.bind('blur', function() {
	                scope.$apply(function() {
	                    ctrl.$setViewValue(elm.html());
	                });
	            });

	            // model -> view
	            ctrl.render = function(value) {
	                elm.html(value);
	            };

	            // load init value from DOM
	            ctrl.$setViewValue(elm.html());

	            elm.bind('keydown', function(event) {
	                var esc = event.which == 27,
	                	enter = event.which == 13,
	                    el = event.target;

	                if (enter) {
	                	var note = {
	                		_id: elm.attr('id'),
	                		body: elm.html(),
	                		author: user
	                	};

	                	socket.emit('edit note', { note: note, token: token });
						ctrl.$setViewValue(elm.html());
						el.blur();
						event.preventDefault();                        
	                }  
	            });
	            
	        }
	    };
	});
})();