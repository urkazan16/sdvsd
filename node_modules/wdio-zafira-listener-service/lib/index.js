const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const API = require('./api');
const getClient = require('./client/index');

class ZfService {
  constructor(options) {
    this.options = options;
    this.cases = {};
  }

  async onPrepare(config, capabilities) {
    
    rimraf.sync('./.zfservice');
    fs.mkdirSync('./.zfservice');

    process.stdout.write(`ZfService: Job Body : "${JSON.stringify(this.options.job)}" \n\n`);
    process.stdout.write(`ZfService: onPrepare: "${JSON.stringify(config)}" \n\n`);

    const { refreshToken, project, username, testSuite, job, run } = this.options;
    const client = await getClient(refreshToken);
    
    // 1. Fetch User Profile
    const userProfile = await API.getUserProfile(client)(username);
    process.stdout.write(`ZfService: User Profile: "${JSON.stringify(userProfile)}" \n\n`);
    this.userProfile = userProfile;
    fs.writeFileSync(path.resolve('./.zfservice/userProfile.json'), JSON.stringify(userProfile));

    // 2. Create Test Suite!
    const testSuiteResp = await API.createTestSuite(client)({
        body: {
            "fileName": testSuite.fileName,
            "name": testSuite.name,
            "userId": userProfile.id
        }
    });
    process.stdout.write(`ZfService: Test Suite: "${JSON.stringify(testSuiteResp)}" \n\n`);
    
    this.testSuite = testSuiteResp;

    fs.writeFileSync(path.resolve('./.zfservice/testSuite.json'), JSON.stringify(testSuiteResp));
    
    // 3. Create a job 
    const jobResp = await API.createJob(client)({
        body: {
            ...job,
            "userId": userProfile.id
        }
    });

    process.stdout.write(`ZfService: Job : "${JSON.stringify(jobResp)}" \n\n`);
    fs.writeFileSync(path.resolve('./.zfservice/job.json'), JSON.stringify(jobResp));

    this.job = jobResp;

    // 4. Create a test run
    const testRunResp = await API.startTestRun(client)({
        body: {
            "buildNumber": run.buildNumber,
            "jobId": jobResp.id,
            "startedBy": run.startedBy,
            "testSuiteId": testSuiteResp.id
        }
    });

    process.stdout.write(`TestRun : "${JSON.stringify(testRunResp)}" \n\n`);
    this.testRun = testRunResp;
    fs.writeFileSync(path.resolve('./.zfservice/run.json'), JSON.stringify(testRunResp));
  }

  async beforeSuite(suite) {
    process.stdout.write(`beforeSuite : ${JSON.stringify(suite)} \n\n`);

    const userProfile = JSON.parse(fs.readFileSync('./.zfservice/userProfile.json'));
    const testSuite = JSON.parse(fs.readFileSync('./.zfservice/testSuite.json'));

    const { refreshToken } = this.options;
    const client = await getClient(refreshToken);

    const testCase = await API.createTestCase(client)({
        body: {
            "primaryOwnerId": userProfile.id,
            "testClass": suite.title,
            "testMethod": "e2e",
            "testSuiteId": testSuite.id,
        }
    });

    this.case = testCase; // Index By File
    process.stdout.write(`ZfService: beforeSuite case: ${JSON.stringify(testCase)} \n\n`);
  }

  async beforeTest(test) {
    process.stdout.write(`ZfService: beforeTest : "${JSON.stringify(test)}" \n\n`);

    const testRun = JSON.parse(fs.readFileSync('./.zfservice/run.json'));

    const { refreshToken } = this.options;
    const client = await getClient(refreshToken);
    
    // Start Test
    const testResp = await API.startTest(client)({
        "name": test.title,
        "status": "IN_PROGRESS",
        "testCaseId": this.case.id,
        "testRunId": testRun.id
    });
    this.test = testResp;
    process.stdout.write(`ZfService: beforeTest start test: "${JSON.stringify(testResp)}" \n\n`);
  }

  async afterTest(test) {
    process.stdout.write(`ZfService: afterTest : "${JSON.stringify(test)}" \n\n`);

    const { refreshToken } = this.options;
    const client = await getClient(refreshToken);
    
    // Start Test
    const testResp = await API.finishTest(client)(this.test.id, {
        ...this.test,
        "status": test.passed ? "PASSED" : "FAILED" // "UNKNOWN", "IN_PROGRESS", "PASSED", "FAILED", "SKIPPED", "ABORTED", "QUEUED"
    });
    this.test = testResp;
    process.stdout.write(`ZfService: afterTest finish test: "${JSON.stringify(testResp)}" \n\n`);
  }

  async onComplete(exitCode, config) {
    process.stdout.write(`ZfService: onComplete : "exitCode: ${exitCode}" "config: ${JSON.stringify(config)}" \n\n`);

    const testRun = JSON.parse(fs.readFileSync('./.zfservice/run.json'));
    
    const { refreshToken } = this.options;
    const client = await getClient(refreshToken);

    const finishTestRunResp = await API.finishTestRun(client)(testRun.id);

    process.stdout.write(`ZfService: onComplete : finish test run: ${JSON.stringify(finishTestRunResp)} \n\n`);
    await new Promise((resolve) => {
        setTimeout(resolve, 3000);
    });
  }
}

ZfService.serviceName = 'ZfService';

module.exports = ZfService;
