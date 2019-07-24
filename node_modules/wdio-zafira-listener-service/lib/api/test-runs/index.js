
// const startTestRun = (client) => async (input) => {
// 	return client.apiRequest({
// 		method: 'POST',
// 		url: '/api/tests/runs',
// 		headers: {
// 			ciRunId: ciRunId
// 		}
// 	})
// };

const startTestRun = (client) => async (input) => {
	return client.apiRequest({
		method: 'POST',
		url: '/api/tests/runs',
		...input
	})
};


const finishTestRun = (client) => async (id) => {
	return client.apiRequest({
		url: `/api/tests/runs/${id}/finish`,
		method: 'POST'
	});
};

module.exports = {
	startTestRun,
	finishTestRun
}