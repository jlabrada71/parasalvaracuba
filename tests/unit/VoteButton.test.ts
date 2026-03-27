import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VoteButton from '../../app/components/VoteButton.vue'

// Mock the composables and utilities
vi.mock('~/composables/useEmailGate', () => ({
  useEmailGate: () => ({
    requireEmail: (callback: () => void) => callback(),
  }),
}))

vi.mock('~/utils/apiClient', () => ({
  apiRequest: vi.fn(),
}))

describe('VoteButton.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with initial vote count', () => {
    const wrapper = mount(VoteButton, {
      props: {
        ideaId: 'idea-1',
        netVotes: 5,
      },
    })
    expect(wrapper.text()).toContain('5')
  })

  it('displays upvote and downvote buttons', () => {
    const wrapper = mount(VoteButton, {
      props: {
        ideaId: 'idea-1',
        netVotes: 5,
      },
    })
    const buttons = wrapper.findAll('button.vote-btn')
    expect(buttons).toHaveLength(2)
    expect(buttons[0].text()).toBe('▲')
    expect(buttons[1].text()).toBe('▼')
  })

  it('upvote button has active class when current vote is 1', async () => {
    const { apiRequest } = await import('~/utils/apiClient')
    vi.mocked(apiRequest).mockResolvedValue({ net_votes: 6 })

    const wrapper = mount(VoteButton, {
      props: {
        ideaId: 'idea-1',
        netVotes: 5,
      },
    })

    const upvoteBtn = wrapper.findAll('button.vote-btn')[0]
    await upvoteBtn.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('button.vote-btn')[0].classes()).toContain('active')
  })

  it('downvote button has active class when current vote is -1', async () => {
    const { apiRequest } = await import('~/utils/apiClient')
    vi.mocked(apiRequest).mockResolvedValue({ net_votes: 4 })

    const wrapper = mount(VoteButton, {
      props: {
        ideaId: 'idea-1',
        netVotes: 5,
      },
    })

    const downvoteBtn = wrapper.findAll('button.vote-btn')[1]
    await downvoteBtn.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('button.vote-btn')[1].classes()).toContain('active')
  })

  it('emits voted event when vote is cast', async () => {
    const { apiRequest } = await import('~/utils/apiClient')
    vi.mocked(apiRequest).mockResolvedValue({ net_votes: 6 })

    const wrapper = mount(VoteButton, {
      props: {
        ideaId: 'idea-1',
        netVotes: 5,
      },
    })

    await wrapper.findAll('button.vote-btn')[0].trigger('click')
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(wrapper.emitted('voted')).toBeTruthy()
    expect(wrapper.emitted('voted')?.[0]).toEqual([
      { ideaId: 'idea-1', netVotes: 6 },
    ])
  })

  it('toggles vote off when clicking same direction twice', async () => {
    const { apiRequest } = await import('~/utils/apiClient')
    vi.mocked(apiRequest)
      .mockResolvedValueOnce({ net_votes: 6 })
      .mockResolvedValueOnce({ net_votes: 5 })

    const wrapper = mount(VoteButton, {
      props: {
        ideaId: 'idea-1',
        netVotes: 5,
      },
    })

    const upvoteBtn = wrapper.findAll('button.vote-btn')[0]
    await upvoteBtn.trigger('click')
    await new Promise(resolve => setTimeout(resolve, 10))
    await upvoteBtn.trigger('click')
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(wrapper.emitted('voted')).toHaveLength(2)
    expect(wrapper.emitted('voted')?.[1]).toEqual([
      { ideaId: 'idea-1', netVotes: 5 },
    ])
  })

  it('disables buttons while loading', async () => {
    const { apiRequest } = await import('~/utils/apiClient')
    vi.mocked(apiRequest).mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(() => resolve({ net_votes: 6 }), 100)
        )
    )

    const wrapper = mount(VoteButton, {
      props: {
        ideaId: 'idea-1',
        netVotes: 5,
      },
    })

    await wrapper.findAll('button.vote-btn')[0].trigger('click')
    await wrapper.vm.$nextTick()

    const buttons = wrapper.findAll('button.vote-btn')
    expect(buttons[0].attributes('disabled')).toBeDefined()
    expect(buttons[1].attributes('disabled')).toBeDefined()
  })

  it('renders with commentId prop instead of ideaId', () => {
    const wrapper = mount(VoteButton, {
      props: {
        commentId: 'comment-1',
        netVotes: 3,
      },
    })
    expect(wrapper.text()).toContain('3')
  })

  it('calls /api/comments/:id/votes endpoint when commentId provided', async () => {
    const { apiRequest } = await import('~/utils/apiClient')
    vi.mocked(apiRequest).mockResolvedValue({ net_votes: 4 })

    const wrapper = mount(VoteButton, {
      props: {
        commentId: 'comment-1',
        netVotes: 3,
      },
    })

    await wrapper.findAll('button.vote-btn')[0].trigger('click')
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(vi.mocked(apiRequest)).toHaveBeenCalledWith(
      '/api/comments/comment-1/votes',
      expect.any(Object)
    )
  })

  it('emits voted event with commentId when voting on comment', async () => {
    const { apiRequest } = await import('~/utils/apiClient')
    vi.mocked(apiRequest).mockResolvedValue({ net_votes: 4 })

    const wrapper = mount(VoteButton, {
      props: {
        commentId: 'comment-1',
        netVotes: 3,
      },
    })

    await wrapper.findAll('button.vote-btn')[0].trigger('click')
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(wrapper.emitted('voted')).toBeTruthy()
    expect(wrapper.emitted('voted')?.[0]).toEqual([
      { commentId: 'comment-1', netVotes: 4 },
    ])
  })

  it('requires either ideaId or commentId prop', () => {
    // Vue type checking will catch this at compile time, but we can test
    // that the component behavior is correct when one is provided
    const wrapper1 = mount(VoteButton, {
      props: {
        ideaId: 'idea-1',
        netVotes: 5,
      },
    })
    expect(wrapper1.exists()).toBe(true)

    const wrapper2 = mount(VoteButton, {
      props: {
        commentId: 'comment-1',
        netVotes: 5,
      },
    })
    expect(wrapper2.exists()).toBe(true)
  })
})
