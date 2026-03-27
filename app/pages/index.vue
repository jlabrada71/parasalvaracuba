<template>
  <div class="home-page">
    <nav class="nav">
      <span class="nav-brand">ParaSalvaraCuba</span>
      <div class="nav-actions">
        <NuxtLink to="/ideas/create" class="btn-primary">+ New Idea</NuxtLink>
        <LanguageSwitcher/>
        <NuxtLink to="/settings" class="nav-link">Settings</NuxtLink>
      </div>
    </nav>

    <main>
      <h1>{{ $t('home.title') }}</h1>
      <p class="subtitle">Submit and vote on ideas. The best rise to the top.</p>

      <div v-if="pending" class="loading">Loading ideas…</div>
      <div v-else-if="error" class="error">Failed to load ideas. Please refresh.</div>
      <div v-else-if="ideas.length === 0" class="empty">No ideas yet. Be the first!</div>

      <div v-else class="ideas-list">
        <IdeaCard
          v-for="idea in ideas"
          :key="idea.id"
          :idea="idea"
          @voted="onVoted"
        />
      </div>

      <div v-if="hasMore" class="pagination">
        <button :disabled="pending" @click="loadMore">Load more</button>
      </div>
    </main>

    <EmailCaptureModal
      :visible="modalVisible"
      @saved="onModalSaved"
      @close="onModalClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import IdeaCard from '~/components/IdeaCard.vue'
import EmailCaptureModal from '~/components/EmailCaptureModal.vue'
import { useEmailGate } from '~/composables/useEmailGate'



interface Idea {
  id: string
  title: string
  email: string
  created_at: string
  net_votes: number
}

const { modalVisible, onModalSaved, onModalClose } = useEmailGate()

const page = ref(1)
const ideas = ref<Idea[]>([])
const hasMore = ref(false)
const pending = ref(false)
const error = ref(false)

async function fetchIdeas(p: number) {
  pending.value = true
  error.value = false
  try {
    const data = await $fetch<{ ideas: Idea[]; page: number; limit: number }>(`/api/ideas?page=${p}`)
    if (p === 1) {
      ideas.value = data.ideas
    } else {
      ideas.value.push(...data.ideas)
    }
    hasMore.value = data.ideas.length === data.limit
  } catch {
    error.value = true
  } finally {
    pending.value = false
  }
}

function loadMore() {
  page.value += 1
  fetchIdeas(page.value)
}

function onVoted(payload: { ideaId: string; netVotes: number }) {
  const idea = ideas.value.find(i => i.id === payload.ideaId)
  if (idea) idea.net_votes = payload.netVotes
}

// Initial load
fetchIdeas(1)
</script>

<style scoped>
.home-page { font-family: system-ui, sans-serif; }
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #1e3a5f;
  color: white;
}
.nav-brand { font-weight: 700; font-size: 1.1rem; }
.nav-actions { display: flex; align-items: center; gap: 1rem; }
.nav-link { color: white; text-decoration: none; font-size: 0.9rem; }
.btn-primary {
  padding: 0.45rem 1rem;
  background: #2563eb;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.9rem;
}
main { max-width: 720px; margin: 2rem auto; padding: 0 1rem; }
.subtitle { color: #6b7280; margin-bottom: 1.5rem; }
.ideas-list { margin-top: 1rem; }
.loading, .empty, .error { padding: 2rem 0; color: #6b7280; }
.error { color: #dc2626; }
.pagination { margin: 1.5rem 0; text-align: center; }
.pagination button {
  padding: 0.6rem 1.5rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
}
</style>
