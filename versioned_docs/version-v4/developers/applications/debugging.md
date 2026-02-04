---
title: Debugging Applications
---

# Debugging Applications

Harper components and applications run inside the Harper process, which is a standard Node.js process that can be debugged with standard JavaScript development tools like Chrome's devtools, VSCode, and WebStorm. Debugging can be performed by launching the Harper entry script with your IDE, or you can start Harper in dev mode and connect your debugger to the running process (defaults to standard 9229 port):

```
harperdb dev
# or to run and debug a specific app
harperdb dev /path/to/app
```

Once you have connected a debugger, you may set breakpoints in your application and fully debug it. Note that when using the `dev` command from the CLI, this will run Harper in single-threaded mode. This would not be appropriate for production use, but makes it easier to debug applications.

For local debugging and development, it is recommended that you use standard console log statements for logging. For production use, you may want to use Harper's logging facilities, so you aren't logging to the console. The logging functions are available on the global `logger` variable that is provided by Harper. This logger can be used to output messages directly to the Harper log using standardized logging level functions, described below. The log level can be set in the [Harper Configuration File](../../deployments/configuration).

Harper Logger Functions

- `trace(message)`: Write a 'trace' level log, if the configured level allows for it.
- `debug(message)`: Write a 'debug' level log, if the configured level allows for it.
- `info(message)`: Write a 'info' level log, if the configured level allows for it.
- `warn(message)`: Write a 'warn' level log, if the configured level allows for it.
- `error(message)`: Write a 'error' level log, if the configured level allows for it.
- `fatal(message)`: Write a 'fatal' level log, if the configured level allows for it.
- `notify(message)`: Write a 'notify' level log.

For example, you can log a warning:

```javascript
logger.warn('You have been warned');
```

If you want to ensure a message is logged, you can use `notify` as these messages will appear in the log regardless of log level configured.

## Viewing the Log

The Harper Log can be found in your local `~/hdb/log/hdb.log` file (or in the log folder if you have specified an alternate hdb root), or in the Studio Status page. Additionally, you can use the [`read_log` operation](../operations-api/logs) to query the Harper log.
