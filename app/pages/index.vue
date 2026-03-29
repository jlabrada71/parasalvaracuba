<template>
  <div class="home-page">
    <nav class="nav">
      <span class="nav-brand">ParaSalvaraCuba</span>
      <div class="nav-actions">
        <NuxtLink :to="localePath('/ideas/create')" class="btn-nav-cta">{{ $t('nav.newIdea') }}</NuxtLink>
        <LanguageSwitcher/>
        <NuxtLink :to="localePath('/settings')" class="nav-link">{{ $t('nav.settings') }}</NuxtLink>
      </div>
    </nav>

    <main>
      <h1>{{ $t('home.title') }}</h1>
      <p class="subtitle">{{ $t('home.subtitle') }}</p>

      <div v-if="pending" class="loading">{{ $t('home.loading') }}</div>
      <div v-else-if="error" class="error">{{ $t('home.error') }}</div>
      <div v-else-if="ideas.length === 0" class="empty">{{ $t('home.empty') }}</div>

      <div v-else class="ideas-list">
        <IdeaCard
          v-for="idea in ideas"
          :key="idea.id"
          :idea="idea"
          @voted="onVoted"
        />
      </div>

      <div v-if="hasMore" class="pagination">
        <button :disabled="pending" @click="loadMore">{{ $t('home.loadMore') }}</button>
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
const localePath = useLocalePath()


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
.home-page {
  font-family: var(--font-body);
  background-color: var(--color-background);
  color: var(--color-on-surface);
  min-height: 100vh;
}
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-4) var(--spacing-8);
  background: var(--color-primary);
  color: var(--color-on-primary);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-elevation-2);
}
.nav-brand {
  font-family: var(--font-display);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-title-md);
  letter-spacing: var(--letter-spacing-xs);
}
.nav-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}
.nav-link {
  color: var(--color-on-primary);
  text-decoration: none;
  font-size: var(--font-size-body-md);
  opacity: 0.85;
  transition: opacity var(--transition-fast);
}
.nav-link:hover { opacity: 1; }
/* Primary CTA button in nav - uses secondary coral for contrast on teal bg */
.btn-nav-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: var(--spacing-3) var(--spacing-6);
  background-color: var(--color-secondary);
  color: var(--color-on-secondary);
  border-radius: var(--radius-lg);
  text-decoration: none;
  font-size: var(--font-size-label-lg);
  font-weight: var(--font-weight-semi-bold);
  transition: all var(--transition-normal);
  border: none;
}
.btn-nav-cta:hover {
  background-color: #925d39;
  transform: translateY(-1px);
}
.btn-nav-cta:focus-visible {
  outline: 2px solid var(--color-on-primary);
  outline-offset: 2px;
}
main { max-width: 720px; margin: var(--spacing-8) auto; padding: 0 var(--spacing-4); }
.subtitle { color: var(--color-on-surface-variant); margin-bottom: var(--spacing-6); }
.ideas-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  margin-top: var(--spacing-6);
}
.loading, .empty, .error { padding: var(--spacing-8) 0; color: var(--color-on-surface-variant); }
.error { color: var(--color-error); }
.pagination { margin: var(--spacing-6) 0; text-align: center; }
.pagination button {
  min-height: 44px;
  padding: var(--spacing-3) var(--spacing-6);
  background: var(--color-surface-container-low);
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-family: var(--font-label);
  font-size: var(--font-size-label-lg);
  color: var(--color-on-surface);
  transition: background-color var(--transition-fast);
}
.pagination button:hover { background: var(--color-surface-container); }
.pagination button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
</style>
