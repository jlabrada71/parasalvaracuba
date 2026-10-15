import { describe, it, expect } from 'vitest'
import { loginSchema, acceptInviteSchema, inviteSchema } from '../../app/utils/authSchemas'

const t = (k: string) => k

describe('authSchemas', () => {
  it('loginSchema requires valid email and a password', async () => {
    await expect(loginSchema(t).validate({ email: '', password: '' }, { abortEarly: false })).rejects.toMatchObject({
      errors: expect.arrayContaining(['auth.errors.emailRequired', 'auth.errors.passwordRequired']),
    })
    await expect(loginSchema(t).validate({ email: 'nope', password: 'x' })).rejects.toMatchObject({ errors: ['auth.errors.emailInvalid'] })
    await expect(loginSchema(t).validate({ email: 'a@b.co', password: 'x' })).resolves.toBeTruthy()
  })

  it('acceptInviteSchema enforces 10–200 chars and matching confirmation', async () => {
    const ok = 'a-long-enough-password'
    await expect(acceptInviteSchema(t).validate({ password: 'short', confirm: 'short' })).rejects.toMatchObject({ errors: ['auth.errors.passwordMin'] })
    await expect(acceptInviteSchema(t).validate({ password: 'x'.repeat(201), confirm: 'x'.repeat(201) })).rejects.toMatchObject({ errors: ['auth.errors.passwordMax'] })
    await expect(acceptInviteSchema(t).validate({ password: ok, confirm: ok + '!' })).rejects.toMatchObject({ errors: ['auth.errors.passwordMismatch'] })
    await expect(acceptInviteSchema(t).validate({ password: ok, confirm: ok })).resolves.toBeTruthy()
  })

  it('inviteSchema validates email and role', async () => {
    await expect(inviteSchema(t).validate({ email: 'bad', role: 'author' })).rejects.toMatchObject({ errors: ['auth.errors.emailInvalid'] })
    await expect(inviteSchema(t).validate({ email: 'a@b.co', role: 'root' })).rejects.toMatchObject({ errors: ['auth.errors.roleInvalid'] })
    await expect(inviteSchema(t).validate({ email: 'a@b.co', role: 'admin' })).resolves.toBeTruthy()
  })
})
