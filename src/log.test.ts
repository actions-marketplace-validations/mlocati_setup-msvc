import * as core from '@actions/core';
import * as log from './log';

beforeEach(() => {
  core.clear();
  log.setDebug(false);
});

afterEach(() => {
  core.clear();
  log.setDebug(false);
});

test('debug() should log message when debug enabled', () => {
  log.setDebug(true);
  const message = 'Debug message';
  log.debug(message);
  expect(core.getLoggedMessages()).toContain(`INFO: ${message}`);
});

test('debug() should not log message when debug disabled', () => {
  log.setDebug(false);
  core.setDebugEnabled(false);
  const message = 'Debug message';
  log.debug(message);
  expect(core.getLoggedMessages()).not.toContain(`DEBUG: ${message}`);
});

test('info() should log message', () => {
  const message = 'Info message';
  log.info(message);
  expect(core.getLoggedMessages()).toContain(`INFO: ${message}`);
});

test('notice() should log message', () => {
  const message = 'Notice message';
  log.notice(message);
  expect(core.getLoggedMessages()).toContain(`NOTICE: ${message}`);
});

test('warning() should log message', () => {
  const message = 'Warning message';
  log.warning(message);
  expect(core.getLoggedMessages()).toContain(`WARNING: ${message}`);
});

test('error() should log message', () => {
  const message = 'Error message';
  log.error(message);
  expect(core.getLoggedMessages()).toContain(`ERROR: ${message}`);
});

test('startGroup() and endGroup() should log group messages', () => {
  const groupName = 'Test Group';
  log.startGroup(groupName);
  log.endGroup();
  expect(core.getLoggedMessages()).toContain(`GROUP START: ${groupName}`);
  expect(core.getLoggedMessages()).toContain(`GROUP END`);
});

test('startDebugGroup() and endDebugGroup() should log debug group messages when debug enabled', () => {
  core.setDebugEnabled(true);
  log.setDebug(true);
  const groupName = 'Debug Group';
  log.startDebugGroup(groupName);
  log.endDebugGroup();
  expect(core.getLoggedMessages()).toContain(`GROUP START: ${groupName}`);
  expect(core.getLoggedMessages()).toContain(`GROUP END`);
});

test('startDebugGroup() and endDebugGroup() should not log debug group messages when debug disabled', () => {
  core.setDebugEnabled(false);
  log.setDebug(false);
  const groupName = 'Debug Group';
  log.startDebugGroup(groupName);
  log.endDebugGroup();
  expect(core.getLoggedMessages()).not.toContain(`GROUP START: ${groupName}`);
  expect(core.getLoggedMessages()).not.toContain(`GROUP END`);
});
