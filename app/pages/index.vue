<template>
  <div class="home-page">
    <nav class="nav">
      <span class="nav-brand">ParaSalvarACuba</span>
      <div class="nav-actions">
        <NuxtLink :to="localePath('/ideas/create')" class="nav-cta-wrapper">
          <Button variant="secondary" size="md">{{ $t('nav.newIdea') }}</Button>
        </NuxtLink>
        <LanguageSwitcher/>
        <NuxtLink :to="localePath('/settings')" class="nav-link">{{ $t('nav.settings') }}</NuxtLink>
      </div>
    </nav>

    <main>
      <Hero
        :title="$t('home.title')"
        :subtitle="$t('home.subtitle')"
      />

      <div class="content-wrapper">
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
          <Button :disabled="pending" @click="loadMore" variant="tertiary">{{ $t('home.loadMore') }}</Button>
        </div>
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
import { Button, Hero } from '@/components/design-system'
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
/* Wrapper for Button component to handle link styling */
.nav-cta-wrapper {
  text-decoration: none;
  display: inline-block;
}
main { width: 100%; }
.content-wrapper {
  max-width: 720px;
  margin: var(--spacing-8) auto;
  padding: 0 var(--spacing-4);
}
.ideas-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  margin-top: var(--spacing-6);
}
.loading, .empty, .error { padding: var(--spacing-8) 0; color: var(--color-on-surface-variant); text-align: center; }
.error { color: var(--color-error); }
.pagination { margin: var(--spacing-6) 0; text-align: center; }
</style>
