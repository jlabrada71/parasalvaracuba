# Component Specifications Guide

**Para Salvar A Cuba - Design System v1.0**

This document specifies component patterns and implementation details for building UI elements that align with the design system.

---

## Button Components

### Button Base (Abstract)

All buttons inherit base styles.

```vue
<template>
  <button :class="['btn-base', variantClass]">
    <slot />
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    enum: ['primary', 'secondary', 'tertiary'],
    default: 'primary'
  },
  size: {
    type: String,
    enum: ['sm', 'md', 'lg'],
    default: 'md'
  },
  disabled: Boolean,
  loading: Boolean
})

const variantClass = computed(() => `btn-${props.variant}`)
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

/* Size variants */
.btn-base.sm { padding: 0.5rem 1rem; }
.btn-base.md { padding: 1rem 2rem; }
.btn-base.lg { padding: 1.25rem 2.5rem; }

/* Disabled state */
.btn-base:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Focus visible for accessibility */
.btn-base:focus-visible {
  outline-color: var(--color-primary);
}
</style>
```

### Primary Button

**Usage:** Main CTAs - "Share Your Idea", "Create", "Vote"

```vue
<template>
  <button class="btn-primary" :disabled="disabled">
    <Icon v-if="icon" :name="icon" />
    <slot />
  </button>
</template>

<style scoped>
.btn-primary {
  background: linear-gradient(135deg, #006565, #008080);
  color: white;
  box-shadow: var(--shadow-cta-primary);
}

.btn-primary:hover:not(:disabled) {
  box-shadow: var(--shadow-cta-primary-hover);
  transform: translateY(-2px);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}
</style>
```

**Specs:**
- **Padding:** 1rem 2rem (md) / 0.5rem 1rem (sm) / 1.25rem 2.5rem (lg)
- **Border Radius:** 1rem
- **Font Weight:** 600
- **Font Size:** 0.875rem (label-lg)
- **Gradient:** 135deg from #006565 to #008080
- **Shadow:** 0 15px 30px rgba(0, 101, 101, 0.15)
- **Hover Shadow:** 0 20px 40px rgba(0, 101, 101, 0.25)
- **Min Touch Target:** 44px height

### Secondary Button

**Usage:** Secondary CTAs - "Learn More", "Comment", "Vote Down"

```vue
<style scoped>
.btn-secondary {
  background-color: #a43c12;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #925d39;
}
</style>
```

**Specs:**
- **Background:** #a43c12
- **Hover Background:** #925d39
- **No shadow** (flat appearance)

### Tertiary Button (Ghost)

**Usage:** Low-emphasis actions - "Cancel", "Skip", "Learn More"

```vue
<style scoped>
.btn-tertiary {
  background-color: transparent;
  color: #006565;
  border: 1px solid #bdc9c8;
}

.btn-tertiary:hover:not(:disabled) {
  background-color: #f0f4f3;
}
</style>
```

**Specs:**
- **Background:** Transparent
- **Border:** 1px solid #bdc9c8
- **Text Color:** #006565
- **Hover Background:** #f0f4f3

---

## Card Component

**Usage:** Idea cards, comment containers, content blocks

```vue
<template>
  <div :class="['card', { 'card-interactive': interactive }]">
    <header v-if="$slots.header">
      <slot name="header" />
    </header>

    <main>
      <slot />
    </main>

    <footer v-if="$slots.footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup>
defineProps({
  interactive: Boolean,
})
</script>

<style scoped>
.card {
  background-color: #ffffff;
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: var(--shadow-elevation-1);
  transition: all var(--transition-normal);
}

.card.interactive:hover {
  box-shadow: var(--shadow-elevation-3);
  transform: translateY(-2px);
  cursor: pointer;
}

/* Nested surface containers */
.card-surface-low {
  background-color: #f0f4f3;
}

.card-surface-high {
  background-color: #e5e9e8;
}
</style>
```

**Specs:**
- **Background:** #ffffff
- **Border Radius:** 1.5rem
- **Padding:** 1.5rem
- **Shadow:** elevation-1 (resting), elevation-3 (hover)
- **Hover Transform:** translateY(-2px)

---

## Input Field Component

**Usage:** Text inputs, search fields, form fields

```vue
<template>
  <div class="input-wrapper">
    <label v-if="label" :for="id" class="input-label">
      {{ label }}
    </label>
    <input
      :id="id"
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      class="input-field"
      @input="$emit('update:modelValue', $event.target.value)"
      @focus="focused = true"
      @blur="focused = false"
    />
    <div v-if="error" class="input-error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  modelValue: String,
  label: String,
  placeholder: String,
  type: { type: String, default: 'text' },
  disabled: Boolean,
  error: String,
})

defineEmits(['update:modelValue'])

const focused = ref(false)
</script>

<style scoped>
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-label {
  font-size: var(--font-size-label-lg);
  font-weight: 600;
  color: #181c1c;
  display: block;
}

.input-field {
  background-color: #dfe3e2;
  border: none;
  border-bottom: 2px solid #bdc9c8;
  border-radius: 0;
  padding: 0.75rem 0;
  font-size: var(--font-size-body-lg);
  font-family: var(--font-body);
  color: #181c1c;
  transition: all var(--transition-fast);
}

.input-field:focus {
  outline: none;
  border-bottom-color: #ff7f50;
  border-bottom-width: 3px;
  padding-bottom: calc(0.75rem - 1px);
}

.input-field::placeholder {
  color: #3e4949;
}

.input-field:disabled {
  background-color: #f0f4f3;
  cursor: not-allowed;
}

.input-error {
  font-size: var(--font-size-body-sm);
  color: #ba1a1a;
  margin-top: 0.25rem;
}
</style>
```

**Specs:**
- **Background:** #dfe3e2
- **Border:** bottom only, 2px, color #bdc9c8
- **Padding:** 0.75rem 0
- **Focus Border Color:** #ff7f50
- **Focus Border Width:** 3px
- **Placeholder Color:** #3e4949
- **Error Color:** #ba1a1a

---

## Badge/Tag Component

**Usage:** Category labels, status indicators, tags

```vue
<template>
  <span :class="['badge', `badge-${variant}`]">
    {{ label }}
  </span>
</template>

<script setup>
defineProps({
  label: String,
  variant: {
    type: String,
    enum: ['primary', 'secondary', 'success', 'warning', 'error'],
    default: 'primary'
  }
})
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  font-size: var(--font-size-label-md);
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  white-space: nowrap;
}

.badge-primary {
  background-color: #93f2f2;
  color: #002020;
}

.badge-secondary {
  background-color: #ffdbcf;
  color: #380c00;
}

.badge-success {
  background-color: #d1e4fc;
  color: #091d2e;
}

.badge-warning {
  background-color: #fff3e0;
  color: #4a1a07;
}

.badge-error {
  background-color: #ffdad6;
  color: #93000a;
}
</style>
```

**Specs:**
- **Padding:** 0.375rem 0.75rem
- **Border Radius:** 0.5rem
- **Font Size:** label-md (0.75rem)
- **Font Weight:** 600
- **Letter Spacing:** 0.05em
- **Text Transform:** uppercase

---

## Text/Typography Components

### Heading Components

```vue
<template>
  <component :is="headingLevel" :class="headingClass">
    <slot />
  </component>
</template>

<script setup>
defineProps({
  level: {
    type: String,
    enum: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    default: 'h1'
  },
  size: {
    type: String,
    enum: ['display-lg', 'display-md', 'headline-lg', 'headline-md', 'title-lg'],
    default: 'headline-lg'
  }
})

const headingLevel = computed(() => props.level)
const headingClass = computed(() => `text-${props.size}`)
</script>

<style scoped>
.text-display-lg {
  font-size: 3.5rem;
  line-height: 1.2;
  font-weight: 700;
  font-family: var(--font-display);
}

.text-display-md {
  font-size: 2.75rem;
  line-height: 1.2;
  font-weight: 700;
  font-family: var(--font-display);
}

.text-headline-lg {
  font-size: 2rem;
  line-height: 1.3;
  font-weight: 700;
  font-family: var(--font-headline);
}

.text-headline-md {
  font-size: 1.75rem;
  line-height: 1.3;
  font-weight: 600;
  font-family: var(--font-headline);
}

.text-title-lg {
  font-size: 1.375rem;
  line-height: 1.4;
  font-weight: 600;
  font-family: var(--font-headline);
}
</style>
```

### Body Text Component

```vue
<template>
  <p :class="['body-text', `text-${size}`]">
    <slot />
  </p>
</template>

<script setup>
defineProps({
  size: {
    type: String,
    enum: ['lg', 'md', 'sm'],
    default: 'lg'
  }
})
</script>

<style scoped>
.body-text {
  color: #181c1c;
}

.text-lg {
  font-size: 1rem;
  line-height: 1.5;
  font-family: var(--font-body);
}

.text-md {
  font-size: 0.875rem;
  line-height: 1.5;
  font-family: var(--font-body);
}

.text-sm {
  font-size: 0.8125rem;
  line-height: 1.5;
  font-family: var(--font-body);
  color: #3e4949;
}
</style>
```

---

## Container/Layout Components

### Surface Container

**Usage:** Page sections, content blocks with background

```vue
<template>
  <div :class="['surface-container', `surface-${level}`]">
    <slot />
  </div>
</template>

<script setup>
defineProps({
  level: {
    type: String,
    enum: ['default', 'low', 'high', 'highest', 'lowest'],
    default: 'default'
  }
})
</script>

<style scoped>
.surface-container {
  transition: background-color var(--transition-normal);
}

.surface-default {
  background-color: #f6faf9;
  color: #181c1c;
}

.surface-low {
  background-color: #f0f4f3;
  color: #181c1c;
}

.surface-high {
  background-color: #e5e9e8;
  color: #181c1c;
}

.surface-highest {
  background-color: #dfe3e2;
  color: #181c1c;
}

.surface-lowest {
  background-color: #ffffff;
  color: #181c1c;
}
</style>
```

---

## Accessibility Checklist

When implementing components, ensure:

- [ ] **Color:** Not the only means of conveying information
- [ ] **Contrast:** 4.5:1 for normal text, 3:1 for large text
- [ ] **Touch Targets:** 44px minimum for interactive elements
- [ ] **Focus Visible:** Clear focus indicator on keyboard navigation
- [ ] **Semantics:** Use `<button>`, `<a>`, `<form>` appropriately
- [ ] **Labels:** All inputs have associated `<label>` elements
- [ ] **Keyboard Navigation:** All interactive elements accessible via Tab/Enter/Space
- [ ] **ARIA:** Use `aria-label`, `aria-describedby` where needed
- [ ] **Motion:** Respect `prefers-reduced-motion`
- [ ] **Dark Mode Ready:** Colors use CSS variables for easy theming

---

## Animation/Motion Guidelines

```css
/* Respect motion preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Standard transitions */
.interactive-element {
  transition: all var(--transition-normal);
}

/* Entrance animations */
.fade-in {
  animation: fadeIn var(--transition-normal);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

---

## Testing Components

Each component should be tested for:

1. **Visual Regression:** Screenshot testing against design system
2. **Accessibility:** WAVE, axe, or similar tools
3. **Responsiveness:** Mobile, tablet, desktop layouts
4. **Interaction:** Hover, focus, active states
5. **States:** Normal, disabled, loading, error
6. **Keyboard Navigation:** Tab order, Enter/Space handling
7. **Dark Mode (v1.1):** Color token swapping

---

## Component Export Template

```typescript
// components/Button.vue
export interface ButtonProps {
  variant: 'primary' | 'secondary' | 'tertiary'
  size: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  icon?: string
}

export interface ButtonEmits {
  click: [event: MouseEvent]
}
```

---

## Questions?

Refer to:
- `design-tokens.css` for all available design tokens
- `DESIGN-SYSTEM.md` for system philosophy and guidelines
- Component examples in `./examples/` directory
