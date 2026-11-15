/** @jest-environment node */
jest.mock('mongoose', () => ({ connect: jest.fn() }));
import mongoose from 'mongoose';
import { pageNumber } from '../src/lib/pagination';

beforeEach(() => { jest.resetModules(); delete globalThis.storefrontMongo; process.env.MONGO = 'mongodb://test'; });
test('pagination normalizes malformed input and caps page offsets', () => {
  expect(pageNumber('2')).toBe(2);
  for (const value of ['0', '-1', '10000', '1e2', ['2'], undefined]) expect(pageNumber(value)).toBe(1);
});
test('concurrent connections share a promise and failures allow retry', async () => {
  const db = require('mongoose');
  db.connect.mockRejectedValueOnce(new Error('private database details'));
  const { connectToDb } = require('../src/lib/utils');
  await expect(connectToDb()).rejects.toThrow('Database unavailable');
  const connection = { connection: { readyState: 1 } };
  db.connect.mockResolvedValue(connection);
  const results = await Promise.all([connectToDb(), connectToDb()]);
  expect(results).toEqual([connection, connection]);
  expect(db.connect).toHaveBeenCalledTimes(2);
  await connectToDb();
  expect(db.connect).toHaveBeenCalledTimes(2);
  connection.connection.readyState = 0;
  await connectToDb();
  expect(db.connect).toHaveBeenCalledTimes(3);
});
