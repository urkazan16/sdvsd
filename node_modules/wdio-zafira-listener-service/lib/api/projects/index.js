
const createProject = (client) => async (body) => {
	return client.apiRequest({
		method: 'POST',
		url: '/api/projects',
		body
	});
};

const getProjectByName = (client) => async (projectName) => {
	return client.apiRequest({
		method: 'GET',
		url: `/api/projects/${projectName}`
	})
};

module.exports = {
	createProject,
	getProjectByName
};
