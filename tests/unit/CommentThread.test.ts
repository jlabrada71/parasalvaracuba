import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import CommentThread from '../../app/components/CommentThread.vue'

// Mock the composables and utilities
vi.mock('~/composables/useEmailGate', () => ({
  useEmailGate: () => ({
    requireEmail: (callback: () => void) => callback(),
  }),
}))

vi.mock('~/utils/apiClient', () => ({
  apiRequest: vi.fn(),
}))

// Mock $fetch globally
vi.stubGlobal('$fetch', vi.fn())

describe('CommentThread.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders heading with comment count', async () => {
    const mockComments = [
      {
        id: 'c1',
        idea_id: 'idea-1',
        parent_comment_id: null,
        email: 'user@example.com',
        content: 'First comment',
        created_at: '2026-03-26T10:00:00Z',
        updated_at: '2026-03-26T10:00:00Z',
        upvotes: 2,
        downvotes: 0,
        net_votes: 2,
      },
    ]
    vi.mocked($fetch).mockResolvedValue(mockComments)

    const wrapper = mount(CommentThread, {
      props: {
        ideaId: 'idea-1',
      },
    })

    await flushPromises()
    expect(wrapper.text()).toContain('Comments (1)')
  })

  it('displays "No comments yet" when empty', async () => {
    vi.mocked($fetch).mockResolvedValue([])

    const wrapper = mount(CommentThread, {
      props: {
        ideaId: 'idea-1',
      },
    })

    await flushPromises()
    expect(wrapper.text()).toContain('No comments yet')
  })

  it('fetches comments on mount', async () => {
    vi.mocked($fetch).mockResolvedValue([])

    mount(CommentThread, {
      props: {
        ideaId: 'idea-1',
      },
    })

    await flushPromises()
    expect($fetch).toHaveBeenCalledWith('/api/ideas/idea-1/comments')
  })

  it('renders form with textarea and submit button', async () => {
    vi.mocked($fetch).mockResolvedValue([])

    const wrapper = mount(CommentThread, {
      props: {
        ideaId: 'idea-1',
      },
    })

    await flushPromises()
    expect(wrapper.find('.comment-form textarea').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('validates that comment cannot be empty', async () => {
    vi.mocked($fetch).mockResolvedValue([])

    const wrapper = mount(CommentThread, {
      props: {
        ideaId: 'idea-1',
      },
    })

    await flushPromises()
    const form = wrapper.find('.comment-form')
    await form.trigger('submit')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Comment cannot be empty')
  })

  it('submits top-level comment', async () => {
    const { apiRequest } = await import('~/utils/apiClient')
    const newComment = {
      id: 'c2',
      idea_id: 'idea-1',
      parent_comment_id: null,
      email: 'user@example.com',
      content: 'New comment',
      created_at: '2026-03-26T11:00:00Z',
      updated_at: '2026-03-26T11:00:00Z',
      upvotes: 0,
      downvotes: 0,
      net_votes: 0,
    }
    vi.mocked($fetch).mockResolvedValue([])
    vi.mocked(apiRequest).mockResolvedValue(newComment)

    const wrapper = mount(CommentThread, {
      props: {
        ideaId: 'idea-1',
      },
    })

    await flushPromises()

    const textarea = wrapper.find('.comment-form textarea')
    await textarea.setValue('New comment')

    const form = wrapper.find('.comment-form')
    await form.trigger('submit')
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(apiRequest).toHaveBeenCalledWith(
      '/api/ideas/idea-1/comments',
      expect.objectContaining({
        method: 'POST',
        body: { body: 'New comment' },
      })
    )
  })

  it('clears form after successful submission', async () => {
    const { apiRequest } = await import('~/utils/apiClient')
    const newComment = {
      id: 'c2',
      idea_id: 'idea-1',
      parent_comment_id: null,
      email: 'user@example.com',
      content: 'New comment',
      created_at: '2026-03-26T11:00:00Z',
      updated_at: '2026-03-26T11:00:00Z',
      upvotes: 0,
      downvotes: 0,
      net_votes: 0,
    }
    vi.mocked($fetch).mockResolvedValue([])
    vi.mocked(apiRequest).mockResolvedValue(newComment)

    const wrapper = mount(CommentThread, {
      props: {
        ideaId: 'idea-1',
      },
    })

    await flushPromises()

    const textarea = wrapper.find('.comment-form textarea')
    await textarea.setValue('New comment')

    const form = wrapper.find('.comment-form')
    await form.trigger('submit')
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(wrapper.vm.newCommentBody).toBe('')
  })

  it('handles form submission error', async () => {
    const { apiRequest } = await import('~/utils/apiClient')
    vi.mocked($fetch).mockResolvedValue([])
    vi.mocked(apiRequest).mockRejectedValue({
      data: { message: 'Server error' },
    })

    const wrapper = mount(CommentThread, {
      props: {
        ideaId: 'idea-1',
      },
    })

    await flushPromises()

    const textarea = wrapper.find('.comment-form textarea')
    await textarea.setValue('New comment')

    const form = wrapper.find('.comment-form')
    await form.trigger('submit')
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(wrapper.text()).toContain('Server error')
  })

  it('clears error message on successful submission', async () => {
    const { apiRequest } = await import('~/utils/apiClient')
    const newComment = {
      id: 'c2',
      idea_id: 'idea-1',
      parent_comment_id: null,
      email: 'user@example.com',
      content: 'New comment',
      created_at: '2026-03-26T11:00:00Z',
      updated_at: '2026-03-26T11:00:00Z',
      upvotes: 0,
      downvotes: 0,
      net_votes: 0,
    }
    vi.mocked($fetch).mockResolvedValue([])
    vi.mocked(apiRequest).mockResolvedValue(newComment)

    const wrapper = mount(CommentThread, {
      props: {
        ideaId: 'idea-1',
      },
    })

    await flushPromises()

    const textarea = wrapper.find('.comment-form textarea')
    await textarea.setValue('New comment')

    const form = wrapper.find('.comment-form')
    await form.trigger('submit')
    await new Promise(resolve => setTimeout(resolve, 10))

    // Error should be cleared after successful submission
    expect(wrapper.vm.formError).toBe('')
  })

  it('filters top-level comments (parent_comment_id === null)', async () => {
    const mockComments = [
      {
        id: 'c1',
        idea_id: 'idea-1',
        parent_comment_id: null,
        email: 'user@example.com',
        content: 'Top-level',
        created_at: '2026-03-26T10:00:00Z',
        updated_at: '2026-03-26T10:00:00Z',
        upvotes: 0,
        downvotes: 0,
        net_votes: 0,
      },
      {
        id: 'c2',
        idea_id: 'idea-1',
        parent_comment_id: 'c1',
        email: 'user@example.com',
        content: 'Reply',
        created_at: '2026-03-26T10:10:00Z',
        updated_at: '2026-03-26T10:10:00Z',
        upvotes: 0,
        downvotes: 0,
        net_votes: 0,
      },
    ]
    vi.mocked($fetch).mockResolvedValue(mockComments)

    const wrapper = mount(CommentThread, {
      props: {
        ideaId: 'idea-1',
      },
    })

    await flushPromises()

    // Verify topLevelComments computed property filters correctly
    expect(wrapper.vm.topLevelComments).toHaveLength(1)
    expect(wrapper.vm.topLevelComments[0].id).toBe('c1')
    expect(wrapper.vm.topLevelComments[0].content).toBe('Top-level')
  })

  it('adds new comment to list after submission', async () => {
    const { apiRequest } = await import('~/utils/apiClient')
    const newComment = {
      id: 'c2',
      idea_id: 'idea-1',
      parent_comment_id: null,
      email: 'user@example.com',
      content: 'New comment',
      created_at: '2026-03-26T11:00:00Z',
      updated_at: '2026-03-26T11:00:00Z',
      upvotes: 0,
      downvotes: 0,
      net_votes: 0,
    }
    vi.mocked($fetch).mockResolvedValue([])
    vi.mocked(apiRequest).mockResolvedValue(newComment)

    const wrapper = mount(CommentThread, {
      props: {
        ideaId: 'idea-1',
      },
    })

    await flushPromises()

    const textarea = wrapper.find('.comment-form textarea')
    await textarea.setValue('New comment')

    const form = wrapper.find('.comment-form')
    await form.trigger('submit')
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(wrapper.vm.comments).toContainEqual(newComment)
  })

  it('updates vote count on voted event', async () => {
    vi.mocked($fetch).mockResolvedValue([
      {
        id: 'c1',
        idea_id: 'idea-1',
        parent_comment_id: null,
        email: 'user@example.com',
        content: 'Comment',
        created_at: '2026-03-26T10:00:00Z',
        updated_at: '2026-03-26T10:00:00Z',
        upvotes: 0,
        downvotes: 0,
        net_votes: 0,
      },
    ])

    const wrapper = mount(CommentThread, {
      props: {
        ideaId: 'idea-1',
      },
    })

    await flushPromises()
    expect(wrapper.vm.comments[0].net_votes).toBe(0)

    // Trigger voted event with payload - should update the comment's vote count immediately
    await wrapper.vm.onCommentVoted({ commentId: 'c1', netVotes: 1 })
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.comments[0].net_votes).toBe(1)
  })

  it('passes correct props to CommentItem children', async () => {
    const mockComments = [
      {
        id: 'c2',
        idea_id: 'idea-1',
        parent_comment_id: null,
        email: 'user@example.com',
        content: 'Comment 2',
        created_at: '2026-03-26T10:00:00Z',
        updated_at: '2026-03-26T10:00:00Z',
        upvotes: 0,
        downvotes: 0,
        net_votes: 0,
      },
    ]
    vi.mocked($fetch).mockResolvedValue(mockComments)

    const wrapper = mount(CommentThread, {
      props: {
        ideaId: 'idea-1',
      },
    })

    await flushPromises()

    const commentItem = wrapper.findComponent({ name: 'CommentItem' })
    expect(commentItem.props('comment').id).toBe('c2')
    expect(commentItem.props('comment').net_votes).toBe(0)
    expect(commentItem.props('ideaId')).toBe('idea-1')
  })
})
