$(document).ready(function() {
	// form validation
	$('.ui.form').form({
		on: 'blur',
		fields: {
			login: {
				identifier: 'login',
				rules: [{
					type: 'empty',
					prompt: 'Login is empty'
				}]
			},
			password: {
				identifier: 'password',
				rules: [{
					type: 'empty',
					prompt: 'Password is empty'
				}]
			}
		}
	});
});