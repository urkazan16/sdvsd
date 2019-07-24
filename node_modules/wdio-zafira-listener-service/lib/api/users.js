
module.exports.getUserProfile = (client) => async (username) => {
	return client.apiRequest({
		method: 'GET',
		url: '/api/users/profile?username=' + username
	})
};
