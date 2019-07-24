const request = require('request-promise');

class ZafiraClient { 

	constructor(config) {
		this.config = config;
	}

	buildHeadersAndAuth(reqOptions) {
		const headers = {
			"User-Agent": "Zafira-js-Client",
			Authorization: `Bearer ${this.config.accessToken}`,
			...reqOptions.headers
		};
		return Object.assign({}, reqOptions, { headers });
	}

	async rawRequest(reqOptions) {
		const options = this.buildHeadersAndAuth(reqOptions);
		let response;
		try {
			// console.log(`options send to request are  - ${JSON.stringify(options)}`);
			response = await request(options);
			return response.body;
		} catch(e) {
			console.log(`Request got errored out with  - ${JSON.stringify(e)}`);
			throw e;
		}
	}

	async apiRequest(reqOptions) {
		const options = Object.assign({}, reqOptions, { json: true, resolveWithFullResponse: true })
		if (options.url && options.url.startsWith('/')) {
			options.baseUrl = options.baseUrl || this.config.baseUrl;
		}
		return this.rawRequest(options);
	}
	
}

module.exports = ZafiraClient;
