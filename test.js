'use strict';

const { fork } = require('child_process');

let childProcess;

describe('suite', () => {
  before(() => {
    console.log('[test] before: forking child proces');
    childProcess = fork('./child.js');
  });

  after(done => {
    let childHasSentExit = false;
    let sigkillHasBeenRequired = false;

    childProcess.once('exit', () => {
      childHasSentExit = true;
      console.log('[test] Child process has sent "exit" event.');
      if (sigkillHasBeenRequired) {
        done(new Error('SIGTERM has been ignored, we needed to sent SIGKILL.'));
      } else {
        done();
      }
    });

    console.log('[test] Sending SIGTERM to child');
    childProcess.kill();

    setTimeout(() => {
      if (!childHasSentExit) {
        console.log('[test] Child process has not terminated yet.');
        console.log('[test] Sending SIGKILL to child');
        sigkillHasBeenRequired = true;
        childProcess.kill('SIGKILL');
      }
    }, 1000);
  });

  it('test', done => {
    console.log('[test] executing dummy test');
    setTimeout(() => {
      done();
    }, 1000);
  });
});
