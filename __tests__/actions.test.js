/** @jest-environment node */
jest.mock('../src/lib/auth-state', () => ({
  activeSession: jest.fn(), consumeLoginAttempt: jest.fn(), issueSession: jest.fn(), revokeSession: jest.fn(), revokeAllSessions: jest.fn(),
}));
jest.mock('next/headers', () => ({ cookies: jest.fn() }));
jest.mock('next/navigation', () => ({ redirect: jest.fn((path) => { throw new Error(`REDIRECT:${path}`); }) }));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));
jest.mock('../src/lib/utils', () => ({ connectToDb: jest.fn() }));
jest.mock('../src/lib/models', () => ({ product: { create: jest.fn(), findByIdAndUpdate: jest.fn(), findByIdAndDelete: jest.fn() } }));
import { activeSession, consumeLoginAttempt, issueSession } from '../src/lib/auth-state';
import { cookies } from 'next/headers';
import { product } from '../src/lib/models';
import { addProduct, updateProduct, deleteProduct, handleAdmin } from '../src/lib/action';
import { createSession, hashPassword } from '../src/lib/session';

beforeEach(() => {
  jest.clearAllMocks();
  process.env.SESSION_SECRET = 'x'.repeat(64);
  cookies.mockResolvedValue({ get: () => undefined, set: jest.fn() });
  activeSession.mockResolvedValue(false);
  consumeLoginAttempt.mockResolvedValue(true);
  issueSession.mockResolvedValue('issued-session');
});
test.each([addProduct, updateProduct, deleteProduct])('mutation requires a session before database access', async (action) => {
  await expect(action({}, new Map())).rejects.toThrow('REDIRECT:/login');
  expect(product.create).not.toHaveBeenCalled();
  expect(product.findByIdAndUpdate).not.toHaveBeenCalled();
  expect(product.findByIdAndDelete).not.toHaveBeenCalled();
});
test('authenticated mutations validate, create, edit, and delete', async () => {
  cookies.mockResolvedValue({ get: () => ({ value: createSession() }) });
  activeSession.mockResolvedValue(true);
  const data = new Map(Object.entries({id:'507f1f77bcf86cd799439011', title:'Cake', desc:'Chocolate', price:'3.50', img:'https://images.pexels.com/photos/test.jpg'}));
  await expect(addProduct({}, data)).rejects.toThrow('REDIRECT:/products');
  expect(product.create).toHaveBeenCalledWith(expect.objectContaining({price:3.5}));
  product.findByIdAndUpdate.mockResolvedValue({});
  await expect(updateProduct({}, data)).rejects.toThrow('REDIRECT:/products');
  expect(product.findByIdAndUpdate).toHaveBeenCalledWith(data.get('id'), expect.any(Object), {runValidators:true});
  product.findByIdAndDelete.mockResolvedValue({});
  expect(await deleteProduct({}, data)).toEqual({success:'Product deleted.'});
  data.set('price','-1');
  expect((await addProduct({}, data)).error).toBeTruthy();
});
test('login rejects invalid passwords and issues a cookie only for correct credentials', async () => {
  process.env.ADMIN_USERNAME = 'admin';
  process.env.ADMIN_PASSWORD_HASH = hashPassword('coursework test password');
  const jar = { set: jest.fn(), get: jest.fn() };
  cookies.mockResolvedValue(jar);
  expect((await handleAdmin({}, new Map([['username','admin'],['password','wrong']]))).error).toBeTruthy();
  expect(jar.set).not.toHaveBeenCalled();
  await expect(handleAdmin({}, new Map([['username','admin'],['password','coursework test password']]))).rejects.toThrow('REDIRECT:/products');
  expect(jar.set).toHaveBeenCalledWith('storefront_session', expect.any(String), expect.objectContaining({httpOnly:true, sameSite:'lax', maxAge:3600}));
});

test('throttled login does not issue a session', async () => {
  consumeLoginAttempt.mockResolvedValue(false);
  expect((await handleAdmin({}, new Map())).error).toMatch(/Too many/);
  expect(issueSession).not.toHaveBeenCalled();
});
