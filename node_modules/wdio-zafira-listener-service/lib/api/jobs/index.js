
const createJob = (client) => async (input) => {
	return client.apiRequest({
		method: 'POST',
		url: '/api/jobs',
		...input
	})
};

module.exports = {
	createJob
};