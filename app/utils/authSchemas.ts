import { object, string } from 'yup'

export type Translate = (key: string) => string

const MIN = 10
const MAX = 200

export function loginSchema(t: Translate) {
  return object({
    email: string().trim().required(t('auth.errors.emailRequired')).email(t('auth.errors.emailInvalid')),
    password: string().required(t('auth.errors.passwordRequired')),
  })
}

export function acceptInviteSchema(t: Translate) {
  return object({
    password: string()
      .required(t('auth.errors.passwordRequired'))
      .min(MIN, t('auth.errors.passwordMin'))
      .max(MAX, t('auth.errors.passwordMax')),
    confirm: string()
      .required(t('auth.errors.passwordRequired'))
      .test('match', t('auth.errors.passwordMismatch'), function (value) {
        return value === this.parent.password
      }),
  })
}

export function inviteSchema(t: Translate) {
  return object({
    email: string().trim().required(t('auth.errors.emailRequired')).email(t('auth.errors.emailInvalid')),
    role: string().oneOf(['author', 'admin'], t('auth.errors.roleInvalid')).required(t('auth.errors.roleInvalid')),
  })
}
