# All Ideas Page - Interaction Patterns & Visual Hierarchy

## Visual Hierarchy

### Type Scale Hierarchy
```
Page Title (Display-md/lg, 2.8-3.5rem, Manrope, Bold)
    ↓
Subtitle (Body-lg, 1rem, Inter)
    ↓
Filter & Search Section (Body-md, 0.9rem, Inter)
    ↓
Card Title (Title-md, 1.1rem, Manrope, Bold)
    ↓
Card Metadata (Body-sm, 0.8rem, Inter)
    ↓
Card Excerpt (Body-sm, 0.8rem, Inter)
    ↓
Vote Counts (Body-sm, 0.8rem, Inter)
    ↓
Pagination Numbers (Body-sm, 0.8rem, Inter)
    ↓
Footer Links (Body-sm, 0.8rem, Inter)
```

### Color Hierarchy
```
PRIMARY FOCUS (Teal #008080, #006565)
    ↓ Used for:
    - Header background
    - Category badges
    - Primary buttons
    - Active pagination buttons
    - Navigation focus states

SECONDARY ACCENT (Coral #FF7F50)
    ↓ Used for:
    - Active vote buttons
    - Hover effects
    - Form focus states
    - Success/action moments

SUPPORTIVE TEXT (#3e4949, on-surface-variant)
    ↓ Used for:
    - Metadata (author, date)
    - Inactive vote counts
    - Secondary labels
    - Tertiary information

NEUTRAL BACKGROUND (#f6faf9, #ffffff)
    ↓ Used for:
    - Page background
    - Card backgrounds
    - Safe space for content
```

---

## Interaction States

### Search Bar Interaction Flow

```
DEFAULT STATE:
┌─────────────────────────────────────┐
│ 🔍 Search ideas by title...         │
└─────────────────────────────────────┘
Background: surface-container-highest (#dfe3e2)
Border: outline-variant (#bdc9c8) at 15% opacity, bottom only
Text: placeholder (gray)

HOVER STATE (Inactive):
┌─────────────────────────────────────┐
│ 🔍 Search ideas by title...         │
└─────────────────────────────────────┘
Background: Subtle shift (may lighten slightly)
Border: Slightly more visible outline-variant
Cursor: text

FOCUS STATE:
┌─────────────────────────────────────┐
│ 🔍 User is typing...                │
└═════════════════════════════════════┘
Background: surface-lowest (#ffffff)
Border-bottom: 2px coral (#FF7F50), expanded from 1px
Text: on-surface (#181c1c)
Cursor: text input cursor visible

POST-SUBMIT:
- Results filter instantly (or load)
- Grid updates to show filtered ideas
- Page returns to page 1
- Search highlights applied if applicable
```

### Filter Chip Interaction Flow

```
DEFAULT STATE (Inactive):
[Recent] [Most Voted] [Most Discussed] [All Categories]

Each chip:
- Background: transparent
- Border: 1px outline-variant (#bdc9c8)
- Text: primary (#006565)
- Cursor: pointer
- Transition: 150ms ease-out

HOVER STATE:
[Recent] [Most Voted] [Most Discussed] [All Categories]
          ^
          Background shifts to surface-low (#f0f4f3)
          Border becomes more visible
          Text: primary (darkened slightly)

CLICK/ACTIVE STATE:
[Recent] ◆ Most Voted ◆ [Most Discussed] [All Categories]

Active chip:
- Background: primary-fixed (#93f2f2)
- Border: removed or same as background
- Text: primary (#006565), bold (weight: 600)
- Shadow: subtle
- Grid content updates
- Transition: 200ms ease-out

MULTIPLE SELECTION (if applicable):
[Recent] ◆ Most Voted ◆ [Most Discussed] ◆ All Categories
Multiple chips can show active state simultaneously
```

### Idea Card Interaction Flow

```
RESTING STATE (Grid view):
┌────────────────────────────────────┐
│ CATEGORY                            │
│                                     │
│ This Is An Idea Title That...       │
│                                     │
│ 👤 Author Name                 3d   │
│ This is the excerpt of the idea │   │
│ that shows 2-3 lines of preview │   │
│                                     │
│ 👍 124    👎 8    💬 12            │
└────────────────────────────────────┘

Box shadow: None (sits on surface-low background)
Background: white
Cursor: default

HOVER STATE:
┌────────────────────────────────────┐
│ CATEGORY                            │
│                                     │
│ This Is An Idea Title That...       │
│                                     │
│ 👤 Author Name                 3d   │
│ This is the excerpt of the idea │   │
│ that shows 2-3 lines of preview │   │
│                                     │
│ 👍 124    👎 8    💬 12            │
└────────────────────────────────────┘
   ↓ (24px blur, 6% opacity ambient shadow)

Box shadow: 0 24px 24px rgba(24, 28, 28, 0.06)
Background: white (unchanged)
Cursor: pointer
Transition: 200ms ease-out

CLICK/NAVIGATION:
- Entire card is clickable
- Navigate to /ideas/[id] detail page
- Alternative: Voting buttons open vote immediately

SCALE FEEDBACK (Optional):
- Subtle scale-up (101-102%) on hover
- Creates tactile "lift" sensation
- Transition: 200ms ease-out
```

### Vote Button Interaction Flow

```
UPVOTE BUTTON (Default):
┌──────────────┐
│ 👍  124      │
└──────────────┘

Background: transparent
Icon: outlined style
Count text: #3e4949 (gray)
Cursor: pointer
Border: none

HOVER STATE:
┌──────────────┐
│ 👍  124      │
└──────────────┘
  ↓ Color shift
Icon: slightly brighter
Count text: coral (#FF7F50)
Transition: 150ms ease-out

ACTIVE/VOTED STATE:
┌──────────────┐
│ 👍  125      │
└──────────────┘
  ↓ Solid fill
Icon: filled, coral (#FF7F50)
Count text: coral (#FF7F50), bold
Background: subtle (optional)
Transition: 200ms ease-out

STATE CHANGE (Vote Flipped):
User clicks down button after clicking up:
- Upvote: 👍  125 → 👍  124 (outline, gray)
- Downvote: 👎  8 → 👎  9 (filled, coral)
- Smooth transition
- API call in background

DOWNVOTE BUTTON:
Same pattern as upvote:
- Default: outlined, gray
- Hover: coral preview
- Active: filled, coral
- Count updates appropriately
```

### Pagination Button Interaction Flow

```
PREVIOUS BUTTON:
┌──────────────────┐
│ ← Previous       │
└──────────────────┘

State: normal (page 2+)
Background: transparent
Border: 1px outline-variant
Text: primary (#006565)
Cursor: pointer

State: disabled (page 1)
Background: transparent
Border: 1px outline-variant (at 50% opacity)
Text: primary (at 50% opacity)
Cursor: not-allowed

HOVER (when enabled):
Background: surface-low (#f0f4f3)
Border: outline-variant (more visible)
Text: primary (darker)

ACTIVE PAGE NUMBERS:
Inactive: [1]  [2]  [3]  [4]  [5]  [Next]
              ↑

Active:   [1]  ◆2◆  [3]  [4]  [5]  [Next]
               ↑
Background: gradient (primary #006565 → primary-container #008080 at 135°)
Border: none
Text: white (#ffffff)
Font-weight: 600
Transition: 200ms ease-out

INACTIVE PAGE NUMBERS:
[1]  [2]  [3]  [4]  [5]
 ↑
Background: transparent
Border: 1px outline-variant (#bdc9c8)
Text: primary (#006565)
Cursor: pointer

HOVER:
[1]  [2]  [3]  [4]  [5]
 ↑
Background: surface-low (#f0f4f3)
Border: outline-variant (more visible)
Text: primary (darker)

NEXT BUTTON:
Same as Previous, but:
- Text: "Next →"
- Disabled when on last page
```

### Category Badge Interaction Flow

```
BADGE (on card):
┌─────────────┐
│ INNOVATION  │
└─────────────┘

Default:
Background: primary-container (#008080)
Text: white (#ffffff)
Padding: spacing-2 horizontal, spacing-2 vertical (8px × 4px)
Border-radius: full (9999px)
Font-size: label-sm (0.7rem)
Font-weight: 600
Letter-spacing: +0.05em

Optional interaction (if clickable):
Hover:
Background: primary (#006565) (slightly darker shade)
Cursor: pointer
Transition: 150ms ease-out

If filters by category:
Activates matching filter chip
Refreshes grid to show only that category
```

---

## Responsive Behavior & Interaction Changes

### Desktop → Tablet Transition (1200px → 768px)

```
GRID CHANGES:
3 columns → 2 columns
Gap: 1.4rem → 1.4rem (unchanged)
Card sizing: Larger → Medium

MARGINS:
8.5rem left, 5.5rem right → 4rem left, 3rem right
Asymmetry maintained but reduced

PAGINATION:
Shows: [1] [2] ... [8] [9] [Next]
↓
Shows: [1] [2] [3] ... [Next]
(Fewer page numbers visible)

FILTER CHIPS:
Fit on one line → May wrap to 2 lines depending on screen
Scrollable if needed

HEADER:
Maintains sticky behavior
Font sizes scale down slightly
Navigation may collapse if needed
```

### Tablet → Mobile Transition (768px → 320px)

```
GRID CHANGES:
2 columns → 1 column
Gap: 1.4rem → 1rem (closer together)
Cards: Full width with padding

MARGINS:
4rem left/right → spacing-4 (1rem) padding
Responsive inset approach

SEARCH BAR:
Width: Fill container
Font: Slightly smaller (body-sm)

FILTER CHIPS:
Horizontal scrollable container
"Recent" visible, others scroll right
Snap behavior for mobile
Padding-bottom for scroll visibility

PAGINATION:
Alternative options:
- Dots: "1 of 12" with < >
- Load More button instead
- Numbered buttons still possible but smaller
Font sizes: label-sm (0.7rem)

HEADER:
Hamburger menu for navigation
Logo remains visible
Language selector in dropdown

FOOTER:
Stacked layout (not side-by-side)
Single column
Links stack vertically
```

---

## Loading & Transition States

### Content Loading

```
Initial load (page opens):
- Skeleton screens for cards (optional)
- Faded placeholder backgrounds
- Staggered fade-in animation (100ms stagger)
- Transition: 300ms ease-out

Filtering/Searching (content changes):
- Existing cards fade out (150ms)
- New cards fade in (200ms)
- Pagination updates
- Active filter chip updates immediately
- Smooth transition feels responsive

Page navigation (pagination):
- Cards fade out (150ms)
- Content area shows brief fade
- New cards fade in (200ms)
- Scroll to top of grid (smooth scroll, 300ms)
```

### Hover & Focus Transitions

```
All transitions follow:
- Fast interaction feedback: 150ms ease-out
- Standard state changes: 200ms ease-out
- Page transitions: 300ms ease-out

Easing curve: ease-out (fast start, gradual slow down)
Properties animated:
- color: 150-200ms
- background-color: 150-200ms
- border-color: 150-200ms
- box-shadow: 200ms
- transform (scale): 200ms
- opacity: 150-200ms

No simultaneous animations on same element
(avoids visual chaos)
```

---

## Accessibility Interactions

### Keyboard Navigation Flow

```
TAB KEY NAVIGATION ORDER:
1. Header Links (Home, Ideas, About, Contact)
2. Language Selector
3. Search Input
4. Filter Chip 1 (Recent)
5. Filter Chip 2 (Most Voted)
6. Filter Chip 3 (Most Discussed)
7. Filter Chip 4 (All Categories)
8. Idea Card 1 - Title/Card container
9. Vote Up button
10. Vote Down button
11. Comment button
12. Idea Card 2 - Title/Card container
13. ... (repeat for all cards)
14. Pagination Previous button
15. Pagination Page 1 button
16. Pagination Page 2 button
17. ... (all page numbers)
18. Pagination Next button
19. Footer Links

FOCUS INDICATORS:
- Visible focus ring (outline: 2px solid primary)
- Color: teal (#006565)
- Offset: 2-4px from element
- Works on: buttons, links, inputs
- Style: solid outline (no dashed)
```

### Screen Reader Announcements

```
Search Input:
aria-label="Search ideas by title or description"
aria-describedby="search-helper"

Filter Chips:
aria-pressed="true|false" (for selected state)
role="switch" (if single-select only)

Vote Buttons:
aria-label="Vote up for this idea"
aria-pressed="true|false" (if voted)
Announces vote count on state change

Pagination:
aria-label="Page 2 of 12"
aria-current="page" (on active button)
Button announces: "Go to page 3"

Category Badge:
aria-label="Category: Innovation"
(not interactive if just display)
(if clickable: aria-pressed or role="button")
```

---

## Dark Mode Considerations (Future)

If dark mode is added:

```
Color Adjustments:
Primary: #00A8A5 (slightly brighter teal)
Surface: #0A0E0E (very dark)
Surface Low: #1a1f1f
Card: #15191a
Text Primary: #F0F4F3 (almost white)
Text Secondary: #BDC9C8 (lighter gray)
Coral: #FF9A7A (slightly lighter)

Shadow: Adjusted opacity (8-10% instead of 6%)
Focus rings: Remain teal or shift to bright accent

Otherwise interaction patterns remain identical
```

---

## Error & Validation States (if needed)

### Search/Form Validation

```
Invalid Search (too short or no results):
- Border color: shifts to error (#ba1a1a)
- Helper text: "No ideas found. Try different keywords"
- Text color: error color
- Clear button: appears to reset search
- Transition: 150ms

Valid/Successful Submit:
- Border color: shifts to success (primary #006565)
- Helper text: "Showing X results"
- Transition: 150ms
```

---

## Summary of Key Interaction Principles

1. **Immediate Visual Feedback**: All interactions provide instant visual response
2. **Consistent Transitions**: 150ms for hovers, 200ms for state changes, 300ms for page transitions
3. **Soft Easing**: ease-out for organic, natural feel
4. **No Color-Only Feedback**: Icon fills, text weight changes, shape changes also used
5. **Accessibility First**: Keyboard navigation, focus indicators, ARIA labels
6. **Editorial Feel**: Smooth, refined interactions - not jarring or aggressive
7. **Surface Layering**: Depth through layering, not shadows (mostly)
8. **Generous Hit Targets**: Buttons and interactive areas properly sized (min 44px for mobile)
9. **Responsive Adaptation**: Interaction patterns adjust for screen size
10. **Civic Platform Tone**: Professional, trustworthy, empowering interactions

These patterns work together to create a platform that feels both authoritative and approachable, matching the "Empowered Editorial" creative north star of the design system.
