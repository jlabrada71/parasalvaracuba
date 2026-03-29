# Implementation Guide: Integrating Design System into Nuxt.js Project

**Para Salvar A Cuba - Design System v1.0**

This guide shows how to integrate the design system assets into your existing Nuxt.js application.

---

## Step 1: Install Design Tokens

### Add to `nuxt.config.ts`

```typescript
export default defineNuxtConfig({
  // ... existing config

  css: [
    '~/design-system/design-tokens.css', // Add this line
    '~/assets/css/main.css', // Your existing CSS
  ],

  tailwindcss: {
    // Include Para Salvar design tokens
    config: {
      theme: {
        extend: require('./design-system/tailwind-para-salvar.js').extend,
      },
      plugins: require('./design-system/tailwind-para-salvar.js').plugins,
    },
  },

  // Ensure Google Fonts are loaded for Manrope and Inter
  googleFonts: {
    families: {
      Manrope: [400, 600, 700], // For headlines/display
      Inter: [400, 500, 600, 700], // For body/UI
    },
    display: 'swap', // Use system fonts while loading
  },
})
```

### Directory Structure

```
project-root/
├── design-system/
│   ├── README.md
│   ├── DESIGN-SYSTEM.md
│   ├── COMPONENT-SPECS.md
│   ├── design-tokens.css
│   ├── design-tokens.json
│   ├── tailwind-para-salvar.js
│   └── IMPLEMENTATION-GUIDE.md (this file)
│
├── app/
│   ├── components/
│   │   ├── Button.vue         ← Use component specs
│   │   ├── Card.vue           ← Use component specs
│   │   ├── Input.vue          ← Use component specs
│   │   └── ... (other components)
│   │
│   ├── layouts/
│   │   └── default.vue
│   │
│   ├── pages/
│   │   ├── index.vue
│   │   ├── ideas/
│   │   └── ...
│   │
│   └── app.vue
│
└── nuxt.config.ts
```

---

## Step 2: Create Base Components

### Button Component: `app/components/Button.vue`

```vue
<template>
  <button
    :class="[
      'btn-base',
      `btn-${variant}`,
      `btn-${size}`,
      { 'opacity-50 cursor-not-allowed': disabled },
    ]"
    :disabled="disabled"
    @click="handleClick"
  >
    <Icon v-if="icon && !loading" :name="icon" class="w-5 h-5 mr-2" />
    <span v-if="loading" class="inline-block w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
    <slot />
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'tertiary'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  icon?: string
}>(), {
  variant: 'primary',
  size: 'md',
})

const emit = defineEmits<{
  click: [MouseEvent]
}>()

const handleClick = (e: MouseEvent) => {
  emit('click', e)
}
</script>

<style scoped>
.btn-base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  font-weight: 600;
  font-size: var(--font-size-label-lg);
  transition: all var(--transition-normal);
  border: none;
  cursor: pointer;
  outline: 2px solid transparent;
  outline-offset: 2px;
}

/* Sizes */
.btn-sm {
  padding: 0.5rem 1rem;
  min-height: 40px;
}

.btn-md {
  padding: 1rem 2rem;
  min-height: 48px;
}

.btn-lg {
  padding: 1.25rem 2.5rem;
  min-height: 56px;
}

/* Variants */
.btn-primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-container));
  color: var(--color-on-primary);
  box-shadow: var(--shadow-cta-primary);
}

.btn-primary:hover:not(:disabled) {
  box-shadow: var(--shadow-cta-primary-hover);
  transform: translateY(-2px);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-secondary {
  background-color: var(--color-secondary);
  color: var(--color-on-secondary);
}

.btn-secondary:hover:not(:disabled) {
  background-color: #925d39;
}

.btn-tertiary {
  background-color: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-outline-variant);
}

.btn-tertiary:hover:not(:disabled) {
  background-color: var(--color-surface-container-low);
}

/* Focus visible */
.btn-base:focus-visible {
  outline-color: var(--color-primary);
}

/* Disabled state */
.btn-base:disabled {
  cursor: not-allowed;
}
</style>
```

### Card Component: `app/components/Card.vue`

```vue
<template>
  <div
    :class="[
      'card',
      { 'hover:shadow-elevation-3 hover:-translate-y-1': interactive },
    ]"
  >
    <header v-if="$slots.header" class="mb-4">
      <slot name="header" />
    </header>

    <main>
      <slot />
    </main>

    <footer v-if="$slots.footer" class="mt-4 border-t border-outline-variant pt-4">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  interactive?: boolean
}>(), {
  interactive: false,
})
</script>

<style scoped>
.card {
  background-color: var(--color-surface-container-lowest);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-elevation-1);
  transition: all var(--transition-normal);
}
</style>
```

### Input Component: `app/components/Input.vue`

```vue
<template>
  <div class="input-wrapper">
    <label v-if="label" :for="id" class="input-label">
      {{ label }}
      <span v-if="required" class="text-error">*</span>
    </label>

    <input
      :id="id"
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      class="input-field"
      @input="$emit('update:modelValue', $event.target.value)"
    />

    <div v-if="error" class="input-error" role="alert">
      {{ error }}
    </div>
    <div v-if="hint" class="input-hint">
      {{ hint }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: string
  label?: string
  placeholder?: string
  type?: string
  disabled?: boolean
  required?: boolean
  error?: string
  hint?: string
  id?: string
}>(), {
  type: 'text',
  id: () => `input-${Math.random().toString(36).substr(2, 9)}`,
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<style scoped>
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.input-label {
  font-size: var(--font-size-label-lg);
  font-weight: 600;
  color: var(--color-on-surface);
  display: block;
}

.input-field {
  background-color: var(--color-surface-container-highest);
  border: none;
  border-bottom: 2px solid var(--color-outline-variant);
  border-radius: 0;
  padding: var(--spacing-3) 0;
  font-size: var(--font-size-body-lg);
  font-family: var(--font-body);
  color: var(--color-on-surface);
  transition: all var(--transition-fast);
}

.input-field::placeholder {
  color: var(--color-on-surface-variant);
}

.input-field:focus {
  outline: none;
  border-bottom-color: var(--color-secondary);
  border-bottom-width: 3px;
}

.input-field:disabled {
  background-color: var(--color-surface-container-low);
  cursor: not-allowed;
}

.input-error {
  font-size: var(--font-size-body-sm);
  color: var(--color-error);
  margin-top: var(--spacing-1);
}

.input-hint {
  font-size: var(--font-size-body-sm);
  color: var(--color-on-surface-variant);
}
</style>
```

---

## Step 3: Update Existing Components

### Update `IdeaCard.vue`

```vue
<template>
  <Card interactive class="group">
    <div class="space-y-3">
      <!-- Title -->
      <h3 class="text-title-md font-semibold text-on-surface group-hover:text-primary transition-colors">
        {{ idea.title }}
      </h3>

      <!-- Description -->
      <p class="text-body-md text-on-surface-variant line-clamp-3">
        {{ idea.description }}
      </p>

      <!-- Meta info -->
      <div class="flex items-center justify-between pt-2 border-t border-outline-variant">
        <div class="flex gap-4 text-body-sm">
          <span class="text-on-surface-variant">
            {{ idea.votes }} votes
          </span>
          <span class="text-on-surface-variant">
            {{ idea.comments }} comments
          </span>
        </div>
        <Button variant="tertiary" size="sm">
          View
        </Button>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
defineProps<{
  idea: {
    title: string
    description: string
    votes: number
    comments: number
  }
}>()
</script>
```

### Update `VoteButton.vue`

```vue
<template>
  <div class="flex gap-2">
    <button
      class="p-2 rounded-md transition-colors"
      :class="upvoted ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface'"
      @click="toggleUpvote"
      aria-label="Upvote idea"
    >
      <Icon name="arrow-up" class="w-5 h-5" />
    </button>

    <span class="px-3 py-2 text-body-md font-semibold text-on-surface">
      {{ netVotes }}
    </span>

    <button
      class="p-2 rounded-md transition-colors"
      :class="downvoted ? 'bg-error text-on-error' : 'bg-surface-container-high text-on-surface'"
      @click="toggleDownvote"
      aria-label="Downvote idea"
    >
      <Icon name="arrow-down" class="w-5 h-5" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  ideaId: string
  initialVotes: number
}>()

const upvoted = ref(false)
const downvoted = ref(false)
const votes = ref(props.initialVotes)

const netVotes = computed(() => {
  let total = votes.value
  if (upvoted.value) total += 1
  if (downvoted.value) total -= 1
  return total
})

const toggleUpvote = () => {
  upvoted.value = !upvoted.value
  if (upvoted.value && downvoted.value) downvoted.value = false
}

const toggleDownvote = () => {
  downvoted.value = !downvoted.value
  if (downvoted.value && upvoted.value) upvoted.value = false
}
</script>
```

---

## Step 4: Update Global Styles

### Create `app/assets/css/main.css`

```css
/* Import design tokens first */
@import '../../design-system/design-tokens.css';

/* Apply design system to document root */
html {
  font-family: var(--font-body);
  color: var(--color-on-surface);
  background-color: var(--color-background);
}

body {
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Ensure proper focus visible on all browsers */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Remove default link styling */
a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--color-secondary);
}

/* Improve form accessibility */
button, [role="button"], input[type="checkbox"], input[type="radio"] {
  cursor: pointer;
}

/* Ensure minimum touch target */
button, a, input[type="button"], input[type="submit"] {
  min-height: 44px;
  min-width: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Respect motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Utilities for common patterns */
.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--spacing-4);
  padding-right: var(--spacing-4);
}

@media (min-width: 640px) {
  .container {
    max-width: 640px;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
  }
}

/* Spacing utilities (if not using Tailwind) */
.mt-4 { margin-top: var(--spacing-4); }
.mb-4 { margin-bottom: var(--spacing-4); }
.p-6 { padding: var(--spacing-6); }
.gap-4 { gap: var(--spacing-4); }

/* Text utilities */
.text-center { text-align: center; }
.font-bold { font-weight: 700; }
.text-gray-500 { color: var(--color-on-surface-variant); }
```

---

## Step 5: Update Layout

### Update `app.vue`

```vue
<template>
  <div class="min-h-screen bg-surface">
    <!-- Navigation -->
    <nav class="bg-white shadow-elevation-1 sticky top-0 z-50">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 class="text-headline-lg font-bold text-primary">
          Para Salvar A Cuba
        </h1>
        <Button variant="primary">
          Share Your Idea
        </Button>
      </div>
    </nav>

    <!-- Main content -->
    <main>
      <NuxtPage />
    </main>

    <!-- Footer -->
    <footer class="bg-surface-container-low text-center py-6 mt-12">
      <p class="text-body-sm text-on-surface-variant">
        © 2026 Para Salvar A Cuba. All voices matter.
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import Button from './components/Button.vue'
</script>

<style scoped>
:deep(.container) {
  max-width: 1280px;
}
</style>
```

---

## Step 6: Testing

### Accessibility Testing Checklist

```bash
# 1. WAVE Extension
# Open DevTools → Install WAVE extension → Run on each page

# 2. Color Contrast
# Use https://webaim.org/resources/contrastchecker/
# Verify: 4.5:1 for body text, 3:1 for UI

# 3. Keyboard Navigation
# Tab through all interactive elements
# Verify Enter/Space works on buttons
# Verify Tab order makes sense

# 4. Screen Reader Testing
# macOS: VoiceOver (Cmd+F5)
# Windows: NVDA (free) or JAWS
# Verify form labels are announced
# Verify button purposes are clear

# 5. Mobile Testing
# Test on real devices at these breakpoints:
# - 375px (iPhone SE)
# - 768px (iPad)
# - 1024px (Desktop)

# 6. Browser Testing
# Chrome, Firefox, Safari, Edge
# Verify design is consistent
```

### Component Testing

```bash
npm run build        # Build components
npm run dev          # Start dev server
npm run test         # Run unit tests
npm run test:a11y    # Run accessibility tests
```

---

## Step 7: Deployment Checklist

- [ ] All CSS variables are imported
- [ ] Fonts are loaded (Manrope, Inter)
- [ ] Components follow specs in `COMPONENT-SPECS.md`
- [ ] Accessibility tested with WAVE
- [ ] Color contrast verified (4.5:1 minimum)
- [ ] Touch targets are 44px+
- [ ] Keyboard navigation works
- [ ] Mobile responsive tested
- [ ] All browsers tested
- [ ] Performance optimized

---

## Troubleshooting

### Issue: Colors don't match design system

**Solution:** Make sure you're using CSS variables, not hardcoded hex values:
```css
❌ Wrong: background: #006565;
✅ Right: background: var(--color-primary);
```

### Issue: Buttons don't have hover effects

**Solution:** Ensure transitions are applied and colors use variables:
```vue
<style scoped>
.btn {
  transition: all var(--transition-normal);
  background: var(--color-primary);
}

.btn:hover {
  background: var(--color-primary-container);
}
</style>
```

### Issue: Fonts don't load

**Solution:** Verify Google Fonts config in `nuxt.config.ts`:
```typescript
googleFonts: {
  families: {
    Manrope: [400, 600, 700],
    Inter: [400, 500, 600, 700],
  }
}
```

### Issue: Spacing feels off

**Solution:** Use spacing variables, not arbitrary values:
```css
❌ Wrong: margin: 15px;
✅ Right: margin: var(--spacing-4); /* 16px */
```

---

## Next Steps

1. **Build Components:** Follow `COMPONENT-SPECS.md`
2. **Update Pages:** Replace hardcoded styles with design tokens
3. **Test:** Run accessibility and responsive tests
4. **Review:** Have design team review before shipping
5. **Document:** Update component documentation as you build

---

## Resources

- `design-system/DESIGN-SYSTEM.md` — Full design system documentation
- `design-system/COMPONENT-SPECS.md` — Component implementation patterns
- `design-system/design-tokens.json` — Token definitions
- `design-system/tailwind-para-salvar.js` — Tailwind configuration

---

**Last Updated:** 2026-03-29
**Questions?** Refer to the main design system documentation.
