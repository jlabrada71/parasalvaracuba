import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import EmailCaptureModal from '../../app/components/EmailCaptureModal.vue'

vi.mock('~/utils/emailValidation', () => ({
  validateEmail: (email: string) => {
    if (!email || email.trim() === '') {
      return { valid: false, reason: 'Email is required.' }
    }
    if (!email.includes('@')) {
      return { valid: false, reason: 'Invalid email format.' }
    }
    if (email.length > 254) {
      return { valid: false, reason: 'Email is too long.' }
    }
    return { valid: true, reason: null }
  },
}))

describe('EmailCaptureModal.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('does not render when visible is false', () => {
    const wrapper = mount(EmailCaptureModal, {
      props: {
        visible: false,
      },
    })
    expect(wrapper.find('.modal-backdrop').exists()).toBe(false)
  })

  it('renders when visible is true', () => {
    const wrapper = mount(EmailCaptureModal, {
      props: {
        visible: true,
      },
      global: {
        stubs: {
          Teleport: true,
        },
      },
    })
    expect(wrapper.find('.modal').exists()).toBe(true)
  })

  it('displays title and description', () => {
    const wrapper = mount(EmailCaptureModal, {
      props: {
        visible: true,
      },
      global: {
        stubs: {
          Teleport: true,
        },
      },
    })
    expect(wrapper.text()).toContain('Enter your email to continue')
    expect(wrapper.text()).toContain('No account needed')
  })

  it('has email input field', () => {
    const wrapper = mount(EmailCaptureModal, {
      props: {
        visible: true,
      },
      global: {
        stubs: {
          Teleport: true,
        },
      },
    })
    const input = wrapper.find('#email-input')
    expect(input.exists()).toBe(true)
    expect(input.attributes('type')).toBe('email')
  })

  it('has continue and dismiss buttons', () => {
    const wrapper = mount(EmailCaptureModal, {
      props: {
        visible: true,
      },
      global: {
        stubs: {
          Teleport: true,
        },
      },
    })
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(2)
    expect(buttons[0].text()).toBe('Continue')
    expect(buttons[1].text()).toBe('Browse without saving')
  })

  it('shows error for invalid email', async () => {
    const wrapper = mount(EmailCaptureModal, {
      props: {
        visible: true,
      },
      global: {
        stubs: {
          Teleport: true,
        },
      },
    })

    const input = wrapper.find('#email-input')
    await input.setValue('invalid')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('.error').text()).toContain('Invalid email format.')
  })

  it('shows error for empty email', async () => {
    const wrapper = mount(EmailCaptureModal, {
      props: {
        visible: true,
      },
      global: {
        stubs: {
          Teleport: true,
        },
      },
    })

    const input = wrapper.find('#email-input')
    await input.setValue('')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('.error').text()).toContain('Email is required.')
  })

  it('accepts valid email and emits saved event', async () => {
    const wrapper = mount(EmailCaptureModal, {
      props: {
        visible: true,
      },
      global: {
        stubs: {
          Teleport: true,
        },
      },
    })

    const input = wrapper.find('#email-input')
    await input.setValue('user@example.com')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('saved')).toBeTruthy()
    expect(wrapper.emitted('saved')?.[0]).toEqual(['user@example.com'])
  })

  it('emits close event after saving valid email', async () => {
    const wrapper = mount(EmailCaptureModal, {
      props: {
        visible: true,
      },
      global: {
        stubs: {
          Teleport: true,
        },
      },
    })

    const input = wrapper.find('#email-input')
    await input.setValue('user@example.com')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('emits close event when dismiss button is clicked', async () => {
    const wrapper = mount(EmailCaptureModal, {
      props: {
        visible: true,
      },
      global: {
        stubs: {
          Teleport: true,
        },
      },
    })

    const dismissBtn = wrapper.findAll('button')[1]
    await dismissBtn.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
    expect(wrapper.emitted('saved')).toBeFalsy()
  })

  it('closes modal when clicking backdrop', async () => {
    const wrapper = mount(EmailCaptureModal, {
      props: {
        visible: true,
      },
      global: {
        stubs: {
          Teleport: true,
        },
      },
    })

    const backdrop = wrapper.find('.modal-backdrop')
    await backdrop.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('prefills email input when prefill prop is provided', async () => {
    const wrapper = mount(EmailCaptureModal, {
      props: {
        visible: true,
        prefill: 'prefilled@example.com',
      },
      global: {
        stubs: {
          Teleport: true,
        },
      },
    })

    const input = wrapper.find('#email-input') as any
    expect(input.element.value).toBe('prefilled@example.com')
  })

  it('updates prefill when prop changes', async () => {
    const wrapper = mount(EmailCaptureModal, {
      props: {
        visible: true,
        prefill: 'first@example.com',
      },
      global: {
        stubs: {
          Teleport: true,
        },
      },
    })

    await wrapper.setProps({ prefill: 'second@example.com' })
    const input = wrapper.find('#email-input') as any
    expect(input.element.value).toBe('second@example.com')
  })

  it('clears error message on successful submit', async () => {
    const wrapper = mount(EmailCaptureModal, {
      props: {
        visible: true,
      },
      global: {
        stubs: {
          Teleport: true,
        },
      },
    })

    // First submit invalid email
    const input = wrapper.find('#email-input')
    await input.setValue('invalid')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('.error').exists()).toBe(true)

    // Then submit valid email
    await input.setValue('valid@example.com')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('.error').exists()).toBe(false)
  })
})
