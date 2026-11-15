/** @jest-environment node */
jest.mock('../src/lib/utils', () => ({ connectToDb: jest.fn() }));
import { connectToDb } from '../src/lib/utils';
import { GET } from '../src/app/api/health/route';
test('readiness pings MongoDB and reports outages without caching or leaking errors', async () => {
  const command = jest.fn().mockResolvedValue({ok:1});
  connectToDb.mockResolvedValue({connection:{db:{command}}});
  expect((await GET()).status).toBe(200);
  expect(command).toHaveBeenCalledWith({ping:1}, {timeoutMS:5000});
  command.mockRejectedValue(new Error('private details'));
  const response = await GET();
  expect(response.status).toBe(503);
  expect(response.headers.get('Cache-Control')).toBe('no-store');
  expect(await response.json()).toEqual({status:'unavailable'});
});
