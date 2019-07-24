
const createTestSuite = (client) => async (input) => {
	return client.apiRequest({
		url: '/api/tests/suites',
		method: 'POST',
		...input
	})
};

module.exports = {
	createTestSuite
}