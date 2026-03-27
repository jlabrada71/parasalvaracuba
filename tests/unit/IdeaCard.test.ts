import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import IdeaCard from '../../app/components/IdeaCard.vue'

// Mock VoteButton component
vi.mock('../../app/components/VoteButton.vue', () => ({
  default: {
    name: 'VoteButton',
    template: '<div class="vote-button-mock"></div>',
    props: ['ideaId', 'netVotes'],
    emits: ['voted'],
  },
}))

// Mock NuxtLink
vi.mock('#app', () => ({
  defineNuxtLink: () => ({
    name: 'NuxtLink',
    template: '<a :href="to"><slot /></a>',
    props: ['to'],
  }),
}))

describe('IdeaCard.vue', () => {
  const mockIdea = {
    id: 'idea-123',
    title: 'Better public transportation',
    email: 'citizen@example.com',
    created_at: '2025-03-26T10:00:00Z',
    net_votes: 42,
  }

  it('renders idea title', () => {
    const wrapper = mount(IdeaCard, {
      props: { idea: mockIdea },
      global: {
        components: {
          VoteButton: { template: '<div></div>' },
          NuxtLink: { template: '<a><slot /></a>', props: ['to'] },
        },
      },
    })
    expect(wrapper.text()).toContain('Better public transportation')
  })

  it('renders author email', () => {
    const wrapper = mount(IdeaCard, {
      props: { idea: mockIdea },
      global: {
        components: {
          VoteButton: { template: '<div></div>' },
          NuxtLink: { template: '<a><slot /></a>', props: ['to'] },
        },
      },
    })
    expect(wrapper.text()).toContain('citizen@example.com')
  })

  it('renders formatted date', () => {
    const wrapper = mount(IdeaCard, {
      props: { idea: mockIdea },
      global: {
        components: {
          VoteButton: { template: '<div></div>' },
          NuxtLink: { template: '<a><slot /></a>', props: ['to'] },
        },
      },
    })
    expect(wrapper.text()).toMatch(/Mar/i)
  })

  it('renders VoteButton component with correct props', () => {
    const wrapper = mount(IdeaCard, {
      props: { idea: mockIdea },
      global: {
        stubs: {
          VoteButton: true,
          NuxtLink: { template: '<a><slot /></a>', props: ['to'] },
        },
      },
    })
    const voteButton = wrapper.findComponent({ name: 'VoteButton' })
    expect(voteButton.exists()).toBe(true)
    expect(voteButton.props('ideaId')).toBe('idea-123')
    expect(voteButton.props('netVotes')).toBe(42)
  })

  it('links to idea detail page', () => {
    const wrapper = mount(IdeaCard, {
      props: { idea: mockIdea },
      global: {
        components: {
          VoteButton: { template: '<div></div>' },
          NuxtLink: {
            template: '<a :href="to"><slot /></a>',
            props: ['to'],
          },
        },
      },
    })
    const link = wrapper.find('a')
    expect(link.attributes('href')).toBe('/ideas/idea-123')
  })

  it('emits voted event from VoteButton', async () => {
    const wrapper = mount(IdeaCard, {
      props: { idea: mockIdea },
      global: {
        stubs: {
          NuxtLink: { template: '<a><slot /></a>', props: ['to'] },
        },
      },
    })

    // Manually emit from VoteButton
    const voteButton = wrapper.findComponent({ name: 'VoteButton' })
    await voteButton.vm.$emit('voted', { ideaId: 'idea-123', netVotes: 50 })

    expect(wrapper.emitted('voted')).toBeTruthy()
    expect(wrapper.emitted('voted')?.[0]).toEqual([
      { ideaId: 'idea-123', netVotes: 50 },
    ])
  })

  it('updates when idea props change', async () => {
    const wrapper = mount(IdeaCard, {
      props: { idea: mockIdea },
      global: {
        components: {
          VoteButton: { template: '<div></div>' },
          NuxtLink: { template: '<a><slot /></a>', props: ['to'] },
        },
      },
    })

    const newIdea = {
      ...mockIdea,
      title: 'Improved water quality',
      net_votes: 100,
    }
    await wrapper.setProps({ idea: newIdea })

    expect(wrapper.text()).toContain('Improved water quality')
  })
})
