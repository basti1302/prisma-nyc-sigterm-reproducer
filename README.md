Reproducer For a Conflict Between mocha, nyc and Prisma ORM
===========================================================

TL;DR: When `PrismaClient` is instantiated in a child process and the main process sends SIGTERM to that child process,
that SIGTERM signal is ignored if:
* this happens in the `after` hook of a mocha test,
* the Mocha test is run via Istanbul's `nyc` to collect coverage information.

Both Prisma and nyc (and possible istanbul and mocha as well) change the way `SIGTERM` and other signals are handled both in the main process as well as child processes.

This particular issues seems to be that Prisma installs its own handler for `SIGTERM` (in the child process, when PrismaClient is instantiated) and this somehow leads to the child process not terminating when receiving `SIGTERM`, when `nyc` is also active.

How To Reproduce The Issue
--------------------------

### Setup

```
npm install
```

### Good Case (Without nyc)

```
npm run test
```

Output:
```
> prisma-nyc-sigterm-reproducer@1.0.0 test
> mocha test.js

  suite
[test] before: forking child proces
[test] executing dummy test
[child] listening on port 3000
[child] still alive
[child] still alive
[child] still alive
    ✓ test (1001ms)
[test] Sending SIGTERM to child
[test] Child process has sent "exit" event.

  1 passing (1s)
```

### Bad Case (With nyc)

```
npm run coverage
```

Output:

```
> prisma-nyc-sigterm-reproducer@1.0.0 coverage
> nyc mocha test.js

  suite
[test] before: forking child proces
[test] executing dummy test
[child] listening on port 3000
[child] still alive
    ✓ test (1003ms)
[test] Sending SIGTERM to child
[child] still alive
[child] still alive
[child] still alive
[child] still alive
[test] Child process has not terminated yet.
[test] Sending SIGKILL to child
[test] Child process has sent "exit" event.
    1) "after all" hook for "test"

  1 passing (2s)
  1 failing

  1) suite
       "after all" hook for "test":
     Error: SIGTERM has been ignored, we needed to sent SIGKILL.
      at ChildProcess.<anonymous> (test.js:21:14)
      at Object.onceWrapper (node:events:628:26)
      at ChildProcess.emit (node:events:513:28)
      at Process.ChildProcess._handle.onexit (node:internal/child_process:293:12)



----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------|---------|----------|---------|---------|-------------------
All files |       0 |        0 |       0 |       0 |
```

### Additional Observation #1

* Remove the line `new PrismaClient();` in `child.js`.
* Run `npm run coverage`.
* The problem does not occur.

### Additional Observation #2

* Add the line `new PrismaClient();` back in `child.js`.
* Remove the call `this.installHook("SIGTERM",!0)` in `node_modules/@prisma/client/runtime/libary.js`.
* Run `npm run coverage`.
* The problem does not occur.

