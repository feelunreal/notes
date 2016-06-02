var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io')(server),
	logger = require('morgan'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	flash = require('connect-flash'),
	fs = require('fs'),
	path = require('path');

var config = require('./config');

var appRoutes = require('./routes/app'),
	apiRoutes = require('./routes/api');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev', { stream: fs.createWriteStream('./access.log', {flags: 'a'}) }));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
	secret: 'jsqovdnp',
	resave: true,
	saveUninitialized: true,
	cookie: {
		maxAge: null
	}
}));
app.use(flash());
app.use('/', appRoutes);
app.use('/api', apiRoutes);

require('./sockets')(io);

server.listen(config.get('port'), function(){
	console.log('Server started at port: ' + config.get('port'));
});