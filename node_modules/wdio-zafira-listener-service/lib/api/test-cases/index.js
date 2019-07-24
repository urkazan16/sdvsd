
const createTestCase = (client) => async (input) => {
	return client.apiRequest({
		method: 'POST',
		url: '/api/tests/cases',
		...input
	});
};

const getTestMetricsById = (client) => async (id) => {
	return client.apiRequest({
		method: 'GET',
		url: `/api/tests/cases/${id}/metrics`
	});
};

module.exports = {
	createTestCase, 
	getTestMetricsById
};
