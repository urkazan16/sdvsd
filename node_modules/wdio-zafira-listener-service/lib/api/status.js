
const getStatus = (client) => async () => {
	return client.apiRequest({
		url: '/api/status',
		method: 'GET'
	})
};


module.exports = {
	getStatus
};