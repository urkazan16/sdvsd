'use strict';

function makeTestController({testName, numOfTests, logger}) {
  const errors = Array.from(new Array(numOfTests));
  let abortedByUser = false;
  let fatalError = false;

  return {
    setError: (index, err) => {
      logger.log('error set in test', testName, err);
      errors[index] = err;
    },

    getError: index => {
      return errors[index];
    },

    setIsAbortedByUser: () => {
      logger.log('user aborted test', testName);
      abortedByUser = true;
    },

    getIsAbortedByUser: () => {
      return abortedByUser;
    },

    setFatalError: err => {
      fatalError = err;
    },

    getFatalError: () => {
      return fatalError;
    },

    shouldStopAllTests: () => {
      return fatalError || errors.every(Boolean) || abortedByUser;
    },

    shouldStopTest: index => {
      return errors[index] || fatalError || abortedByUser;
    },
  };
}

module.exports = makeTestController;
