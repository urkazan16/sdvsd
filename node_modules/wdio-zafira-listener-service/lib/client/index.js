const request = require('request-promise');
const ZafiraClient = require('./client');


// handle config values, generate temporary auth Token from permanent one and create a singleton Client!!!!!
// TODO - Read Config settings!!!

const getClient = async (refreshToken)  => {
	const reqOptions = {
		baseUrl: 'http://demo.qaprosoft.com/zafira-ws',
		url: '/api/auth/refresh',
		json: true,
		method: 'POST',
		body: {
			refreshToken
		}
	}
	const response  = await request(reqOptions);
	const options = {
		...response,
		baseUrl: 'http://demo.qaprosoft.com/zafira-ws'
	}
	return new ZafiraClient(options);
};

module.exports = getClient;