# Wave 2a Summary: Core Components Refactoring

**Status:** Complete ✓

## Tasks Executed
- 7-101: Refactor Navigation bar (index.vue, create.vue, [id].vue) ✓
- 7-102: Refactor IdeaCard component ✓
- 7-103: Refactor LanguageSwitcher component ✓
- 7-104: Add shared ds-btn classes to main.css ✓
- 7-105: Refactor create.vue form and [id].vue edit form ✓

## Commits
- `f6a6c43` feat(design-system): Wave 2a core components refactoring

## Components Updated
- `app/pages/index.vue` — Nav uses teal primary + sticky positioning + coral CTA button (`btn-nav-cta`); ideas-list uses flex+gap instead of border-bottom; pagination button uses design tokens; all hardcoded colors removed
- `app/pages/ideas/create.vue` — Nav matches index.vue; form refactored with `form-field`/`form-label`/`form-input`/`form-textarea` classes; bottom-border input style; submit button uses `ds-btn ds-btn-primary`
- `app/pages/ideas/[id].vue` — Nav matches index.vue; edit form uses same input token classes; edit/save buttons use `ds-btn` variants; all hardcoded colors removed
- `app/components/IdeaCard.vue` — Card elevation with `border-radius: var(--radius-xl)`, hover lift, teal title color, on-surface-variant meta text; no border-bottom
- `app/components/LanguageSwitcher.vue` — 44px min-width touch targets; focus-visible outline; `var(--color-on-primary)` text; active/hover states via design tokens
- `app/assets/css/main.css` — Added global `.ds-btn`, `.ds-btn-primary`, `.ds-btn-secondary`, `.ds-btn-tertiary`, `.ds-btn-sm` classes

## Testing Notes
- All buttons have 44px minimum touch targets (`min-height: 44px` on ds-btn; `min-height: 44px` on btn-nav-cta; `min-width: 44px` on lang-btn)
- Color tokens applied throughout all 5 modified files
- No hardcoded `#1e3a5f`, `#2563eb`, or `#6b7280` remain in any Wave 2a file
- Focus-visible outlines configured on: nav CTA button, lang buttons, idea card titles, ds-btn base class, pagination button
- Nav is sticky (position: sticky; top: 0; z-index: 100) across all three pages
- IdeaCard hover state: `translateY(-2px)` + shadow elevation-3
- Form inputs use bottom-border style (no box border); focus increases border to 3px with `color-secondary-container`
- Error messages use `color-error` on `color-error-container` background
- Remaining hardcoded colors in VoteButton, CommentThread, CommentItem, EmailCaptureModal, MarkdownRenderer, settings.vue are out of scope for Wave 2a (targeted in Wave 2b)

## Blockers/Deviations
- Task numbering in the plan file does not match the prompt description exactly (plan has 7-101 through 7-105 covering nav + IdeaCard + LanguageSwitcher + ds-btn + create.vue, while the prompt described them as Button/Badge/Input/Card/Navigation). Executed all 5 tasks as defined in the plan file.
- `LanguageSwitcher` lang-btn `min-height` is 32px (not 44px) per plan specification — the surrounding nav padding provides the effective 44px+ tap zone. `min-width: 44px` is set as specified.
