#!/usr/bin/env node

/**
 * Pre-build script for Docusaurus. Runs in the prebuild, predev and prestart hooks.
 */

require('./generateReleaseNotesData')();
