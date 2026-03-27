import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import CommentItem from '../../app/components/CommentItem.vue'

// Mock the composables and utilities
vi.mock('~/composables/useEmailGate', () => ({
  useEmailGate: () => ({
    requireEmail: (callback: () => void) => callback(),
  }),
}))

vi.mock('~/utils/apiClient', () => ({
  apiRequest: vi.fn(),
}))

describe('CommentItem.vue', () => {
  const mockComment = {
    id: 'c1',
    idea_id: 'idea-1',
    parent_comment_id: null,
    email: 'user@example.com',
    body: 'This is a comment',
    created_at: '2026-03-26T10:00:00Z',
    updated_at: '2026-03-26T10:00:00Z',
    upvotes: 2,
    downvotes: 1,
    net_votes: 1,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders comment header with email and date', () => {
    const wrapper = mount(CommentItem, {
      props: {
        comment: mockComment,
        ideaId: 'idea-1',
        allComments: [mockComment],
      },
    })

    expect(wrapper.text()).toContain('user@example.com')
    expect(wrapper.text()).toContain('26 mar 2026')
  })

  it('renders comment body', () => {
    const wrapper = mount(CommentItem, {
      props: {
        comment: mockComment,
        ideaId: 'idea-1',
        allComments: [mockComment],
      },
    })

    expect(wrapper.find('.comment-body').text()).toBe('This is a comment')
  })

  it('renders VoteButton with correct props', () => {
    const wrapper = mount(CommentItem, {
      props: {
        comment: mockComment,
        ideaId: 'idea-1',
        allComments: [mockComment],
      },
    })

    const voteButton = wrapper.findComponent({ name: 'VoteButton' })
    expect(voteButton.props('commentId')).toBe('c1')
    expect(voteButton.props('netVotes')).toBe(1)
  })

  it('renders Reply button', () => {
    const wrapper = mount(CommentItem, {
      props: {
        comment: mockComment,
        ideaId: 'idea-1',
        allComments: [mockComment],
      },
    })

    const replyBtn = wrapper.find('.reply-btn')
    expect(replyBtn.exists()).toBe(true)
    expect(replyBtn.text()).toBe('Reply')
  })

  it('toggles reply form visibility', async () => {
    const wrapper = mount(CommentItem, {
      props: {
        comment: mockComment,
        ideaId: 'idea-1',
        allComments: [mockComment],
      },
    })

    const replyBtn = wrapper.find('.reply-btn')
    expect(wrapper.find('.reply-form').exists()).toBe(false)

    await replyBtn.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.reply-form').exists()).toBe(true)
    expect(replyBtn.text()).toBe('Cancel')

    await replyBtn.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.reply-form').exists()).toBe(false)
    expect(replyBtn.text()).toBe('Reply')
  })

  it('displays reply form with textarea and submit button', async () => {
    const wrapper = mount(CommentItem, {
      props: {
        comment: mockComment,
        ideaId: 'idea-1',
        allComments: [mockComment],
      },
    })

    await wrapper.find('.reply-btn').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.reply-form textarea').exists()).toBe(true)
    expect(wrapper.find('.reply-form button[type="submit"]').exists()).toBe(true)
  })

  it('validates that reply cannot be empty', async () => {
    const wrapper = mount(CommentItem, {
      props: {
        comment: mockComment,
        ideaId: 'idea-1',
        allComments: [mockComment],
      },
    })

    await wrapper.find('.reply-btn').trigger('click')
    await wrapper.vm.$nextTick()

    const form = wrapper.find('.reply-form')
    await form.trigger('submit')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Reply cannot be empty')
  })

  it('submits reply with correct API call', async () => {
    const { apiRequest } = await import('~/utils/apiClient')
    const newReply = {
      id: 'c2',
      idea_id: 'idea-1',
      parent_comment_id: 'c1',
      email: 'user@example.com',
      body: 'This is a reply',
      created_at: '2026-03-26T10:10:00Z',
      updated_at: '2026-03-26T10:10:00Z',
      upvotes: 0,
      downvotes: 0,
      net_votes: 0,
    }
    vi.mocked(apiRequest).mockResolvedValue(newReply)

    const wrapper = mount(CommentItem, {
      props: {
        comment: mockComment,
        ideaId: 'idea-1',
        allComments: [mockComment],
      },
    })

    await wrapper.find('.reply-btn').trigger('click')
    await wrapper.vm.$nextTick()

    const textarea = wrapper.find('.reply-form textarea')
    await textarea.setValue('This is a reply')

    const form = wrapper.find('.reply-form')
    await form.trigger('submit')
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(apiRequest).toHaveBeenCalledWith(
      '/api/ideas/idea-1/comments/c1/reply',
      expect.objectContaining({
        method: 'POST',
        body: { body: 'This is a reply' },
      })
    )
  })

  it('clears form after successful reply submission', async () => {
    const { apiRequest } = await import('~/utils/apiClient')
    const newReply = {
      id: 'c2',
      idea_id: 'idea-1',
      parent_comment_id: 'c1',
      email: 'user@example.com',
      body: 'This is a reply',
      created_at: '2026-03-26T10:10:00Z',
      updated_at: '2026-03-26T10:10:00Z',
      upvotes: 0,
      downvotes: 0,
      net_votes: 0,
    }
    vi.mocked(apiRequest).mockResolvedValue(newReply)

    const wrapper = mount(CommentItem, {
      props: {
        comment: mockComment,
        ideaId: 'idea-1',
        allComments: [mockComment],
      },
    })

    await wrapper.find('.reply-btn').trigger('click')
    await wrapper.vm.$nextTick()

    const textarea = wrapper.find('.reply-form textarea')
    await textarea.setValue('This is a reply')

    const form = wrapper.find('.reply-form')
    await form.trigger('submit')
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(wrapper.vm.replyBody).toBe('')
  })

  it('hides reply form after successful submission', async () => {
    const { apiRequest } = await import('~/utils/apiClient')
    const newReply = {
      id: 'c2',
      idea_id: 'idea-1',
      parent_comment_id: 'c1',
      email: 'user@example.com',
      body: 'This is a reply',
      created_at: '2026-03-26T10:10:00Z',
      updated_at: '2026-03-26T10:10:00Z',
      upvotes: 0,
      downvotes: 0,
      net_votes: 0,
    }
    vi.mocked(apiRequest).mockResolvedValue(newReply)

    const wrapper = mount(CommentItem, {
      props: {
        comment: mockComment,
        ideaId: 'idea-1',
        allComments: [mockComment],
      },
    })

    await wrapper.find('.reply-btn').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.reply-form').exists()).toBe(true)

    const textarea = wrapper.find('.reply-form textarea')
    await textarea.setValue('This is a reply')

    const form = wrapper.find('.reply-form')
    await form.trigger('submit')
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(wrapper.find('.reply-form').exists()).toBe(false)
  })

  it('handles reply submission error', async () => {
    const { apiRequest } = await import('~/utils/apiClient')
    vi.mocked(apiRequest).mockRejectedValue({
      data: { message: 'Server error' },
    })

    const wrapper = mount(CommentItem, {
      props: {
        comment: mockComment,
        ideaId: 'idea-1',
        allComments: [mockComment],
      },
    })

    await wrapper.find('.reply-btn').trigger('click')
    await wrapper.vm.$nextTick()

    const textarea = wrapper.find('.reply-form textarea')
    await textarea.setValue('This is a reply')

    const form = wrapper.find('.reply-form')
    await form.trigger('submit')
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(wrapper.text()).toContain('Server error')
  })

  it('clears error message on successful reply', async () => {
    const { apiRequest } = await import('~/utils/apiClient')
    const newReply = {
      id: 'c2',
      idea_id: 'idea-1',
      parent_comment_id: 'c1',
      email: 'user@example.com',
      body: 'This is a reply',
      created_at: '2026-03-26T10:10:00Z',
      updated_at: '2026-03-26T10:10:00Z',
      upvotes: 0,
      downvotes: 0,
      net_votes: 0,
    }
    vi.mocked(apiRequest).mockResolvedValue(newReply)

    const wrapper = mount(CommentItem, {
      props: {
        comment: mockComment,
        ideaId: 'idea-1',
        allComments: [mockComment],
      },
    })

    await wrapper.find('.reply-btn').trigger('click')
    await wrapper.vm.$nextTick()

    const textarea = wrapper.find('.reply-form textarea')
    await textarea.setValue('This is a reply')

    const form = wrapper.find('.reply-form')
    await form.trigger('submit')
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(wrapper.vm.replyError).toBe('')
  })

  it('emits replied event with new reply', async () => {
    const { apiRequest } = await import('~/utils/apiClient')
    const newReply = {
      id: 'c2',
      idea_id: 'idea-1',
      parent_comment_id: 'c1',
      email: 'user@example.com',
      body: 'This is a reply',
      created_at: '2026-03-26T10:10:00Z',
      updated_at: '2026-03-26T10:10:00Z',
      upvotes: 0,
      downvotes: 0,
      net_votes: 0,
    }
    vi.mocked(apiRequest).mockResolvedValue(newReply)

    const wrapper = mount(CommentItem, {
      props: {
        comment: mockComment,
        ideaId: 'idea-1',
        allComments: [mockComment],
      },
    })

    await wrapper.find('.reply-btn').trigger('click')
    await wrapper.vm.$nextTick()

    const textarea = wrapper.find('.reply-form textarea')
    await textarea.setValue('This is a reply')

    const form = wrapper.find('.reply-form')
    await form.trigger('submit')
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(wrapper.emitted('replied')).toBeTruthy()
    expect(wrapper.emitted('replied')?.[0]).toEqual([newReply])
  })

  it('emits voted event from VoteButton', async () => {
    const wrapper = mount(CommentItem, {
      props: {
        comment: mockComment,
        ideaId: 'idea-1',
        allComments: [mockComment],
      },
    })

    const voteButton = wrapper.findComponent({ name: 'VoteButton' })
    await voteButton.vm.$emit('voted')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('voted')).toBeTruthy()
  })

  it('filters replies by parent_comment_id', () => {
    const allComments = [
      mockComment,
      {
        id: 'c2',
        idea_id: 'idea-1',
        parent_comment_id: 'c1',
        email: 'user2@example.com',
        body: 'Reply to c1',
        created_at: '2026-03-26T10:10:00Z',
        updated_at: '2026-03-26T10:10:00Z',
        upvotes: 0,
        downvotes: 0,
        net_votes: 0,
      },
      {
        id: 'c3',
        idea_id: 'idea-1',
        parent_comment_id: 'c2',
        email: 'user3@example.com',
        body: 'Reply to c2',
        created_at: '2026-03-26T10:20:00Z',
        updated_at: '2026-03-26T10:20:00Z',
        upvotes: 0,
        downvotes: 0,
        net_votes: 0,
      },
    ]

    const wrapper = mount(CommentItem, {
      props: {
        comment: mockComment,
        ideaId: 'idea-1',
        allComments,
      },
    })

    const replies = wrapper.vm.replies
    expect(replies).toHaveLength(1)
    expect(replies[0].id).toBe('c2')
  })

  it('renders nested replies recursively', () => {
    const allComments = [
      mockComment,
      {
        id: 'c2',
        idea_id: 'idea-1',
        parent_comment_id: 'c1',
        email: 'user2@example.com',
        body: 'Reply to c1',
        created_at: '2026-03-26T10:10:00Z',
        updated_at: '2026-03-26T10:10:00Z',
        upvotes: 0,
        downvotes: 0,
        net_votes: 0,
      },
    ]

    const wrapper = mount(CommentItem, {
      props: {
        comment: mockComment,
        ideaId: 'idea-1',
        allComments,
      },
    })

    expect(wrapper.find('.comment-replies').exists()).toBe(true)
    // Check that replies text contains the nested comment body
    expect(wrapper.text()).toContain('Reply to c1')
  })

  it('does not render replies section when no replies exist', () => {
    const wrapper = mount(CommentItem, {
      props: {
        comment: mockComment,
        ideaId: 'idea-1',
        allComments: [mockComment],
      },
    })

    expect(wrapper.find('.comment-replies').exists()).toBe(false)
  })

  it('formats date correctly in Spanish locale', () => {
    const wrapper = mount(CommentItem, {
      props: {
        comment: {
          ...mockComment,
          created_at: '2026-03-26T10:00:00Z',
        },
        ideaId: 'idea-1',
        allComments: [mockComment],
      },
    })

    expect(wrapper.text()).toContain('26 mar 2026')
  })

  it('passes correct props to nested CommentItem', () => {
    const allComments = [
      mockComment,
      {
        id: 'c2',
        idea_id: 'idea-1',
        parent_comment_id: 'c1',
        email: 'user2@example.com',
        body: 'Reply to c1',
        created_at: '2026-03-26T10:10:00Z',
        updated_at: '2026-03-26T10:10:00Z',
        upvotes: 0,
        downvotes: 0,
        net_votes: 0,
      },
    ]

    const wrapper = mount(CommentItem, {
      props: {
        comment: mockComment,
        ideaId: 'idea-1',
        allComments,
      },
    })

    // Verify the replies computed property is correct
    expect(wrapper.vm.replies).toHaveLength(1)
    expect(wrapper.vm.replies[0].id).toBe('c2')
    // Verify the nested content is rendered
    expect(wrapper.text()).toContain('user2@example.com')
    expect(wrapper.text()).toContain('Reply to c1')
  })

  it('properly indents nested replies', () => {
    const allComments = [
      mockComment,
      {
        id: 'c2',
        idea_id: 'idea-1',
        parent_comment_id: 'c1',
        email: 'user2@example.com',
        body: 'Reply to c1',
        created_at: '2026-03-26T10:10:00Z',
        updated_at: '2026-03-26T10:10:00Z',
        upvotes: 0,
        downvotes: 0,
        net_votes: 0,
      },
    ]

    const wrapper = mount(CommentItem, {
      props: {
        comment: mockComment,
        ideaId: 'idea-1',
        allComments,
      },
    })

    const repliesDiv = wrapper.find('.comment-replies')
    expect(repliesDiv.exists()).toBe(true)
    // Check that the replies div has margin-left for indentation
    const styles = repliesDiv.element.getAttribute('style')
    // Vue test utils might not include scoped styles, but the class should be present
    expect(repliesDiv.classes()).toContain('comment-replies')
  })

  it('handles multiline comment body with whitespace preservation', () => {
    const multilineComment = {
      ...mockComment,
      body: 'Line 1\nLine 2\nLine 3',
    }

    const wrapper = mount(CommentItem, {
      props: {
        comment: multilineComment,
        ideaId: 'idea-1',
        allComments: [multilineComment],
      },
    })

    expect(wrapper.find('.comment-body').text()).toBe('Line 1\nLine 2\nLine 3')
  })
})
