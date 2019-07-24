'use strict'
const ZfService = require('../lib')

exports.config = {
  specs: [
    './test/e2e/*.js'
  ],
  capabilities: [
    { browserName: 'phantomjs' }
  ],
  services: ['phantomjs', new ZfService(
    { // Service Options
      refreshToken: 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIyIiwicGFzc3dvcmQiOiIveU45VDZZaHY5ZHRCeDNmSUFZSmxqeG12YzRObGhrMCIsInRlbmFudCI6InphZmlyYSIsImV4cCI6MTMwMzk3OTc0MzUwfQ.DuKkYg4FnU1Knyas7-YRF-wNk_Uv5wmRqmds44Z134r7VDvyoPr2KZmYZuu5dQIgErfyV4aN0e5zYgWGEebpUg',
      username: 'admin',
      testSuite: {
        fileName: 'test.xml',
        name: 'example_test',
      },
      job: { // Jenkins Settings
        "jenkinsHost": process.env.HOST || 'demo.qaprosoft.com',
        "jobURL": process.env.BUILD_URL || 'http://demo.qaprosoft.com/jenkins/job/sharmademo/6/', //  // Jenkins Build URL
        "name": process.env.JOB_NAME || 'example',
      },
      run: {
        buildNumber: process.env.BUILD_NUMBER || 6,
        startedBy: process.env.BUILD_CAUSE_MANUALTRIGGER ? 'HUMAN' : 'SCHEDULER' // One of  "SCHEDULER", "UPSTREAM_JOB", "HUMAN"
      }
    }
  )],
  exclude: [],
  maxInstances: 2, // it depends on the plan of the cloud servvice
  sync: true,
  logLevel: 'error',
  coloredLogs: true,
  waitforTimeout: 20000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  framework: 'mocha',
  reporters: ['dot'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 30000
  }
}
