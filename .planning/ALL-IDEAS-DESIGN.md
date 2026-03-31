# All Ideas Listing Page - Design Specifications
**Para Salvar A Cuba Civic Platform**

Generated: March 31, 2026
Design System: "The Civic Pulse" (The Empowered Editorial)
Platform: Stitch AI Design

---

## Design Overview
The "All Ideas" page is a comprehensive listing view that allows community members to browse, filter, and engage with civic ideas. The design follows the Para Salvar A Cuba design system with an emphasis on editorial clarity, intuitive navigation, and emphasis on community engagement through voting and discussion.

---

## Layout Structure

### 1. Header Navigation (Sticky)
**Purpose:** Persistent navigation and branding

**Components:**
- Logo/Brand name on left (teal color)
- Primary navigation: Home | Ideas | About | Contact
- Language selector (EN/ES/PT) on right
- Background: Teal gradient (#006565 to #008080)
- Text color: White (#ffffff)
- Height: Generous padding (recommended ~64px)
- Elevation: Sticky positioning with subtle ambient shadow (24px blur, 6% opacity)

**Typography:**
- Brand name: Headline size, Manrope, white text
- Nav links: Body-md, Inter, white text
- Language selector: Label-md, Inter

---

### 2. Hero/Filter Section
**Purpose:** Title, introduction, and content filtering

**Layout:**
- Asymmetric margins: 8.5rem left, 5.5rem right (following design system guidelines)
- Background: Base surface (#f6faf9)
- Generous vertical whitespace (spacing-6, approximately 2rem)

**Elements:**

**Title Area:**
- Headline: "Explore All Community Ideas" (Display-md or Display-lg, Manrope, bold)
- Color: on-surface (#181c1c)
- Subtitle: "Browse and support innovative ideas shaping Cuba's future" (body-lg, Inter)
- Color: on-surface-variant (#3e4949)
- Spacing below: spacing-5 (1.4rem)

**Search Bar:**
- Style: Minimalist ghost border design
- Background: surface-container-highest (#dfe3e2)
- Bottom border: outline-variant (#bdc9c8) at 15% opacity
- Focus state: Bottom border expands to 2px, transitions to secondary (coral #FF7F50)
- Placeholder text: gray
- Icon: Search icon (trailing or leading)
- Padding: spacing-3 on all sides
- Corner radius: md (0.75rem)

**Filter Chips:**
- Style: Tertiary buttons (ghost style)
- Options: "Recent", "Most Voted", "Most Discussed", "All Categories"
- Inactive: No background, primary text (#006565), outline-variant border at 15% opacity
- Active/Selected:
  - Background: primary-fixed (#93f2f2)
  - Text: on-primary-fixed (#002020)
  - Border: none
- Spacing between chips: spacing-2 (0.5rem)
- Corner radius: md (0.75rem)
- Horizontal arrangement with horizontal scrolling on mobile

---

### 3. Main Content Grid

**Grid Layout:**
- Desktop: 3 columns
- Tablet: 2 columns
- Mobile: 1 column
- Column gap: spacing-4 (1.4rem)
- Row gap: spacing-4 (1.4rem)
- Horizontal padding: matching header asymmetry or responsive inset

**Total Cards:** Display 12-16 cards per page
- Variety of idea types and engagement levels
- Mix of newly posted and popular ideas

---

## Idea Card Component

**Structure & Styling:**

**Card Container:**
- Background: surface-container-lowest (#ffffff)
- Border: None (use surface hierarchy for definition)
- Corner radius: md (0.75rem)
- Padding: spacing-4 inside (1.4rem)
- Elevation:
  - Default: Placed on surface-container-low (#f0f4f3) background for subtle lift
  - Hover: Ambient shadow (24px blur, 0% spread, 6% opacity on-surface tint)
  - Hover background: Subtle shift (no color change, just tonal) or maintain surface

**Card Content Organization (Top to Bottom):**

**1. Category Badge (Top-left)**
- Style: Pill-shaped or rounded rectangle
- Background: primary-container (#008080)
- Text: on-primary (#ffffff)
- Typography: label-sm, all-caps, letter-spacing +0.05em
- Padding: spacing-1 horizontal (0.25rem), spacing-2 vertical (0.5rem)
- Corner radius: full

**2. Title Area**
- Headline: title-md, Manrope, bold
- Color: on-surface (#181c1c)
- Line clamp: 2 lines
- Margin below: spacing-2 (0.5rem)

**3. Metadata Row (Author & Date)**
- Layout: Horizontal flex
- Author section:
  - Avatar: 32px circle, fallback with initials
  - Author name: body-sm, Manrope, #181c1c
  - Margin between avatar and name: spacing-1 (0.25rem)
- Separator: 4px dot (on-surface-variant color)
- Date posted: label-sm, on-surface-variant (#3e4949)
- Spacing between sections: spacing-3 (0.75rem)

**4. Excerpt/Description**
- Typography: body-sm, Inter
- Color: on-surface (#181c1c)
- Line clamp: 2-3 lines
- Height: approximately 2.5-3 text lines
- Margin below: spacing-3 (0.75rem)

**5. Interaction Footer (Bottom)**
- Layout: Horizontal flex, space-between
- Background: Inherit (transparent, same as card)
- Border-top: No line - rely on spacing and subtle tonal shift

**Vote/Engagement Metrics:**
- Layout: Three sections separated by spacing-2 (0.5rem)

  **Upvote Section:**
  - Icon: Thumbs up or arrow up (outlined by default)
  - Count: body-sm, Inter
  - Color (inactive): on-surface-variant (#3e4949)
  - Color (active): secondary (#a43c12) or coral accent (#FF7F50)
  - Interactive: Clickable container with subtle hover feedback

  **Downvote Section:**
  - Icon: Thumbs down or arrow down (outlined by default)
  - Count: body-sm, Inter
  - Color (inactive): on-surface-variant (#3e4949)
  - Same interactive behavior as upvote

  **Comment Section:**
  - Icon: Chat bubble or comment icon
  - Count: body-sm, Inter
  - Color: on-surface-variant (#3e4949)
  - Non-voting interaction

---

## Color Application in Cards

**Text Hierarchy:**
- Primary text (title): #181c1c (on-surface)
- Secondary text (author, date): #3e4949 (on-surface-variant)
- Accents (votes): #FF7F50 (coral secondary) when active
- Inactive accents: #3e4949

**Backgrounds:**
- Card base: #ffffff (surface-container-lowest)
- Adjacent sections: #f0f4f3 (surface-container-low)
- Category badge: #008080 (primary-container)

---

## Pagination Section

**Position:** Below grid, centered
**Spacing:** spacing-6 (2rem) above pagination

**Components:**

**Previous Button:**
- Style: Tertiary ghost
- Background: transparent
- Text: primary (#006565)
- Border: outline-variant (#bdc9c8) at 15% opacity
- Icon + "Previous" label
- Corner radius: md (0.75rem)
- Padding: spacing-2 (0.5rem)
- State: Disabled (opacity 50%) on first page

**Page Buttons (Numbered):**
- Numbers: 1, 2, 3... with "..." for long ranges
- Active page (current):
  - Background: Gradient (primary #006565 to primary-container #008080)
  - Text: white
  - Corner radius: md (0.75rem)
- Inactive pages:
  - Style: Tertiary ghost
  - Background: transparent
  - Text: primary (#006565)
  - Border: outline-variant at 15% opacity
- Size: All buttons consistent height/width
- Spacing: spacing-1 (0.25rem) between buttons

**Next Button:**
- Style: Tertiary ghost
- Similar to Previous button
- Icon + "Next" label
- State: Disabled on last page

**Mobile Consideration:**
- On mobile, show fewer page numbers
- Possible alternative: Infinite scroll instead of pagination

---

## Footer Section

**Position:** Below pagination, at page bottom
**Background:** surface-container-low (#f0f4f3)
**Text color:** on-surface (#181c1c)
**Padding:** spacing-6 (2rem) vertical, spacing-5 (1.4rem) horizontal

**Layout:**
- Horizontal flex with space-between
- Left section: Logo/brand name + copyright text
- Right section: Footer links (About, FAQ, Privacy Policy, Contact)

**Typography:**
- Brand: body-md, Inter, #181c1c
- Copyright: label-sm, #3e4949
- Links: body-sm, Inter, links in primary color (#006565) with underline on hover

**Links:**
- Color: primary (#006565)
- Hover: Underline appears, color darkens slightly or becomes primary-container (#008080)
- Spacing between links: spacing-3 (0.75rem)

---

## Responsive Behavior

### Desktop (1200px+)
- Grid: 3 columns
- Full asymmetric margins (8.5rem left, 5.5rem right)
- Standard spacing scales
- Full pagination with all page numbers visible

### Tablet (768px - 1199px)
- Grid: 2 columns
- Adjusted margins (4rem left, 3rem right)
- Same component spacing
- Simplified pagination (show fewer page numbers)

### Mobile (< 768px)
- Grid: 1 column
- Padding-based margins (spacing-4 on sides)
- Compact spacing (spacing-2 or spacing-3 between cards)
- Filter chips: Horizontal scrollable container
- Pagination: Dots indicator (1 of 5, 2 of 5) or "Load More" button
- Header: Hamburger menu for navigation on very small screens

---

## Interactive States & Micro-interactions

### Card Hover
- Elevation: Subtle ambient shadow appears (24px blur, 6% opacity)
- Background: No color change (maintain white)
- Scale: Optional subtle scale-up (101-102%)
- Transition: 200ms ease-out

### Filter Chip Selection
- Feedback: Immediate background/text color change
- Active indicator: Visual distinction maintained
- Multiple selection: Allowed (unless filtered UX requires single select)

### Vote Button Interaction
- Hover: Icon color shifts to coral (#FF7F50)
- Active (voted): Icon filled with coral color
- Click feedback: Slight scale animation or color flash

### Pagination Button States
- Hover: Slight background shift, cursor pointer
- Active page: Gradient fill maintains visual hierarchy
- Disabled: Reduced opacity (50%)

### Search & Filter
- Input focus: Coral bottom border, keyboard cursor active
- Filter chip click: Immediate selection state, page content updates (or loads)
- Search submit: Results filter/update

---

## Typography Scale Usage

| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Page title | Manrope | Display-md/lg | Bold | #181c1c |
| Subtitle | Inter | Body-lg | Regular | #3e4949 |
| Card title | Manrope | Title-md | Bold | #181c1c |
| Author name | Inter | Body-sm | Regular | #181c1c |
| Date posted | Inter | Label-sm | Regular | #3e4949 |
| Excerpt | Inter | Body-sm | Regular | #181c1c |
| Vote count | Inter | Body-sm | Regular | #FF7F50 (active) |
| Category badge | Inter | Label-sm | All-caps | #ffffff |
| Pagination number | Inter | Body-sm | Regular | #006565 |
| Footer link | Inter | Body-sm | Regular | #006565 |

---

## Color Palette Reference

**Primary Colors:**
- Primary: #006565
- Primary Container: #008080
- Primary Fixed: #93f2f2
- Primary Fixed Dim: #76d6d5

**Secondary (Accent) Colors:**
- Secondary: #a43c12
- Secondary Container: #fe7e4f
- Coral Accent: #FF7F50

**Surface & Background:**
- Surface: #f6faf9 (base background)
- Surface Container Low: #f0f4f3 (secondary sections)
- Surface Container Lowest: #ffffff (card backgrounds)
- Surface Container High: #e5e9e8
- Surface Container Highest: #dfe3e2

**Text Colors:**
- On Surface: #181c1c (primary text)
- On Surface Variant: #3e4949 (secondary text)

**Accents & Outlines:**
- Outline Variant: #bdc9c8
- Tertiary: #495b70

---

## Design System Principles Applied

1. **The No-Line Rule:** No 1px solid borders used for sectioning. All boundaries defined by background color shifts or spacing.

2. **Surface Hierarchy & Nesting:** Cards use layering principle with surface-container-lowest on surface-container-low background for natural lift.

3. **Glass & Gradient Rule:** Filters and interactive elements use subtle tonal approaches. Primary CTAs use gradient (primary to primary-container at 135°).

4. **Spacing Scale:** All spacing follows the design system scale (spacing-1 through spacing-6) for consistent rhythm.

5. **Ambient Shadows Only:** Elevation achieved through stacking and tonal shifts, not drop shadows, except subtle ambient shadows on hover.

6. **Editorial Aesthetic:** Asymmetric layouts, generous whitespace, high-contrast typography creating an "Empowered Editorial" feel.

---

## Implementation Considerations for Vue.js

### Component Architecture
```
AllIdeasPage
├── Header (sticky)
├── HeroSection
│   ├── Title
│   ├── Subtitle
│   ├── SearchBar
│   └── FilterChips
├── IdeasGrid
│   ├── IdeaCard (repeatable)
│   │   ├── Badge
│   │   ├── Title
│   │   ├── Metadata (Author + Date)
│   │   ├── Excerpt
│   │   └── EngagementFooter
│   │       ├── VoteButton (up)
│   │       ├── VoteButton (down)
│   │       └── CommentButton
├── Pagination
│   ├── PrevButton
│   ├── PageButtons
│   └── NextButton
├── Footer
```

### Key Props & State
- **ideas:** Array of idea objects with: id, title, author, date, excerpt, votes, comments, category
- **currentPage:** Number (for pagination)
- **filters:** Object with selectedFilters and searchQuery
- **sortOrder:** "recent" | "most-voted" | "most-discussed"

### Styling Approach
- Use CSS custom properties (CSS variables) for design tokens from design system
- Apply surface-container colors to create layering
- Use `spacing-*` classes or CSS variables for consistent spacing
- No border-based dividers; rely on background color transitions

### Responsive Strategy
- CSS Grid with @media queries for column changes (3 -> 2 -> 1)
- Flexible margins/padding using clamp() function
- Hidden elements for pagination simplification on mobile

---

## Accessibility Considerations

1. **Color Contrast:** Ensure vote count in coral (#FF7F50) meets WCAG AA standards against white background
2. **Button States:** Use aria-current="page" for active pagination button
3. **Links:** Underline or other visual indicator on footer links beyond color alone
4. **Form Labels:** Search input needs associated label (may be visually hidden)
5. **Keyboard Navigation:** All interactive elements accessible via Tab key
6. **Screen Readers:** Proper heading hierarchy (h1 for title, h2 for section headers)

---

## Future Enhancement Ideas

1. **Infinite Scroll:** Replace pagination with infinite scroll on mobile
2. **Advanced Filters:** Category selector, date range, author search
3. **Sorting Toggle:** Dropdown for sort order selection
4. **Saved Ideas:** Save/bookmark functionality
5. **Author Profiles:** Click author name to view profile/other ideas
6. **Search Results:** Full-text search with highlighting
7. **Related Ideas:** Show similar ideas within or below cards
8. **Mobile Carousel:** Swipe through ideas on small screens as alternative to grid

---

## Design Assets Location

**Stitch Project:** Para Salvar A Cuba - Civic Ideas Platform
**Project ID:** 5452549322734083535
**Design System:** "The Civic Pulse"
**Screen:** All Ideas Listing Page

All design specifications above are derived from the Stitch-generated design and the Para Salvar A Cuba design system documentation ("The Empowered Editorial" creative north star).
