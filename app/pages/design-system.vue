<template>
  <div class="design-system-showcase">
    <!-- Hero Section -->
    <Hero
      title="Para Salvar A Cuba"
      subtitle="Democratic Ideas Platform"
    >
      <template #actions>
        <Button variant="primary" size="lg">
          {{ $t('nav.newIdea') }}
        </Button>
        <Button variant="secondary" size="lg">
          Learn More
        </Button>
      </template>
    </Hero>

    <!-- Content Section -->
    <div class="showcase-container">
      <!-- Typography -->
      <Card class="showcase-section">
        <template #header>
          <Heading level="h2" size="headline-lg">
            Typography System
          </Heading>
        </template>

        <div class="spacing-vertical-lg">
          <div class="showcase-group">
            <Heading level="h3" size="headline-md">Display Sizes</Heading>
            <Heading level="h3" size="display-lg" class="mt-4">Display Large (3.5rem)</Heading>
            <Heading level="h3" size="display-md" class="mt-4">Display Medium (2.75rem)</Heading>
          </div>

          <div class="showcase-group">
            <Heading level="h3" size="headline-md">Headline Sizes</Heading>
            <Heading level="h2" size="headline-lg" class="mt-4">Headline Large (2rem)</Heading>
            <Heading level="h3" size="headline-md" class="mt-4">Headline Medium (1.75rem)</Heading>
            <Heading level="h4" size="headline-sm" class="mt-4">Headline Small (1.5rem)</Heading>
          </div>

          <div class="showcase-group">
            <Heading level="h3" size="headline-md">Body Text</Heading>
            <Text size="body-lg" class="mt-4">
              Body Large - This is the default paragraph text. It's clear and readable at 1rem (16px).
            </Text>
            <Text size="body-md" class="mt-2">
              Body Medium - Supporting text at 0.875rem (14px) for secondary content.
            </Text>
            <Text size="body-sm" class="mt-2">
              Body Small - Fine print at 0.8125rem (13px) for metadata.
            </Text>
          </div>
        </div>
      </Card>

      <!-- Buttons -->
      <Card class="showcase-section">
        <template #header>
          <Heading level="h2" size="headline-lg">
            Button Variants
          </Heading>
        </template>

        <div class="showcase-group">
          <Heading level="h3" size="headline-md">Primary Buttons</Heading>
          <div class="button-group">
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="md">Medium</Button>
            <Button variant="primary" size="lg">Large</Button>
            <Button variant="primary" disabled>Disabled</Button>
            <Button variant="primary" loading>Loading</Button>
          </div>
        </div>

        <div class="showcase-group">
          <Heading level="h3" size="headline-md">Secondary Buttons</Heading>
          <div class="button-group">
            <Button variant="secondary" size="sm">Small</Button>
            <Button variant="secondary" size="md">Medium</Button>
            <Button variant="secondary" size="lg">Large</Button>
            <Button variant="secondary" disabled>Disabled</Button>
          </div>
        </div>

        <div class="showcase-group">
          <Heading level="h3" size="headline-md">Tertiary Buttons</Heading>
          <div class="button-group">
            <Button variant="tertiary" size="sm">Small</Button>
            <Button variant="tertiary" size="md">Medium</Button>
            <Button variant="tertiary" size="lg">Large</Button>
            <Button variant="tertiary" disabled>Disabled</Button>
          </div>
        </div>
      </Card>

      <!-- Forms -->
      <Card class="showcase-section">
        <template #header>
          <Heading level="h2" size="headline-lg">
            Form Controls
          </Heading>
        </template>

        <div class="showcase-group">
          <Input
            v-model="formData.name"
            label="Full Name"
            placeholder="Enter your name"
            required
          />
        </div>

        <div class="showcase-group">
          <Input
            v-model="formData.email"
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            hint="We'll never share your email"
          />
        </div>

        <div class="showcase-group">
          <Input
            v-model="formData.message"
            label="Message (with error)"
            placeholder="Type something..."
            error="This field is required"
          />
        </div>
      </Card>

      <!-- Badges -->
      <Card class="showcase-section">
        <template #header>
          <Heading level="h2" size="headline-lg">
            Badges & Labels
          </Heading>
        </template>

        <div class="showcase-group">
          <Heading level="h3" size="headline-md">Badge Variants</Heading>
          <div class="badge-group">
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
          </div>
        </div>

        <div class="showcase-group">
          <Heading level="h3" size="headline-md">Vote Counts</Heading>
          <div class="badge-group">
            <div class="vote-example">
              <Badge variant="primary">42 votes</Badge>
              <Text size="body-sm" secondary>Community support</Text>
            </div>
            <div class="vote-example">
              <Badge variant="secondary">15 comments</Badge>
              <Text size="body-sm" secondary>Active discussion</Text>
            </div>
          </div>
        </div>
      </Card>

      <!-- Color Palette -->
      <Card class="showcase-section">
        <template #header>
          <Heading level="h2" size="headline-lg">
            Color Palette
          </Heading>
        </template>

        <div class="color-grid">
          <div v-for="color in colors" :key="color.name" class="color-swatch">
            <div :style="{ backgroundColor: color.hex }" class="swatch" />
            <Text size="label-sm" as="div" class="color-name">{{ color.name }}</Text>
            <Text size="label-sm" as="div" class="color-code" secondary>{{ color.hex }}</Text>
          </div>
        </div>
      </Card>

      <!-- Cards -->
      <Card class="showcase-section">
        <template #header>
          <Heading level="h2" size="headline-lg">
            Card Variations
          </Heading>
        </template>

        <div class="card-grid">
          <Card>
            <template #header>
              <Heading level="h3" size="headline-sm">Basic Card</Heading>
            </template>
            <Text>This is a basic card with header and content.</Text>
          </Card>

          <Card interactive>
            <template #header>
              <Heading level="h3" size="headline-sm">Interactive Card</Heading>
            </template>
            <Text>Hover me! Interactive cards have lift effects on hover.</Text>
          </Card>

          <Card elevated>
            <template #header>
              <Heading level="h3" size="headline-sm">Elevated Card</Heading>
            </template>
            <Text>This card starts with elevated shadow.</Text>
          </Card>

          <Card interactive class="idea-card">
            <template #header>
              <Heading level="h3" size="headline-sm">Idea Card Example</Heading>
            </template>
            <Text class="mb-4">
              A proposal to improve public transportation accessibility in urban areas.
            </Text>
            <template #footer>
              <div class="card-footer-actions">
                <Badge variant="primary">128 votes</Badge>
                <Text size="body-sm" secondary>8 comments</Text>
              </div>
            </template>
          </Card>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import {
  Button,
  Card,
  Input,
  Badge,
  Hero,
  Heading,
  Text,
} from '@/components/design-system'

const formData = reactive({
  name: '',
  email: '',
  message: '',
})

const colors = [
  { name: 'Primary Teal', hex: '#006565' },
  { name: 'Primary Container', hex: '#008080' },
  { name: 'Secondary Coral', hex: '#fe7e4f' },
  { name: 'Secondary Dark', hex: '#a43c12' },
  { name: 'Tertiary Navy', hex: '#495b70' },
  { name: 'Error', hex: '#ba1a1a' },
  { name: 'Surface', hex: '#f6faf9' },
  { name: 'On Surface', hex: '#181c1c' },
]
</script>

<style scoped>
.design-system-showcase {
  min-height: 100vh;
  background-color: var(--color-surface);
}

.showcase-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: var(--spacing-12) var(--spacing-4);
}

.showcase-section {
  margin-bottom: var(--spacing-8);

  &:last-child {
    margin-bottom: 0;
  }
}

.showcase-group {
  margin-bottom: var(--spacing-8);

  &:first-child {
    margin-top: 0;
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.spacing-vertical-lg {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
}

.mt-4 {
  margin-top: var(--spacing-4);
}

.mt-2 {
  margin-top: var(--spacing-2);
}

.mb-4 {
  margin-bottom: var(--spacing-4);
}

.button-group {
  display: flex;
  gap: var(--spacing-3);
  flex-wrap: wrap;
  margin-top: var(--spacing-4);
}

.badge-group {
  display: flex;
  gap: var(--spacing-4);
  flex-wrap: wrap;
  margin-top: var(--spacing-4);
  align-items: center;
}

.vote-example {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--spacing-4);
  margin-top: var(--spacing-4);
}

.color-swatch {
  text-align: center;
}

.swatch {
  width: 100%;
  height: 120px;
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-2);
  box-shadow: var(--shadow-elevation-1);
}

.color-name {
  display: block;
  margin-bottom: var(--spacing-1);
}

.color-code {
  display: block;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--spacing-6);
  margin-top: var(--spacing-4);
}

.idea-card {
  text-align: left;
}

.card-footer-actions {
  display: flex;
  gap: var(--spacing-4);
  align-items: center;
}

@media (max-width: 768px) {
  .showcase-container {
    padding: var(--spacing-6) var(--spacing-4);
  }

  .button-group {
    gap: var(--spacing-2);
  }

  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
