# Features Research: Civic Engagement Platforms

Research based on analysis of leading civic engagement platforms (Decidim, Consul, ChangeMakers, Participa, OpenGov) and participatory democracy systems globally.

## Table Stakes (Users expect these)

Features that users expect to find or they abandon the platform. These establish baseline credibility.

- **Voting/ranking by votes**: Simple | Already in v1 ✓
  - Enables signal of popularity and consensus

- **Email-based identity**: Simple | Already in v1 ✓
  - Low friction entry point; no social account required

- **Moderation/spam control**: Medium | Already in v1 ✓
  - Essential for platform health; prevents abuse at scale

- **Browse ideas by recency/trending**: Simple | Already in v1 ✓
  - Core discovery mechanism

- **Threaded comments**: Simple | Already in v1 ✓
  - Enables discussion depth without infinite scrolling

- **Create ideas (title + description)**: Simple | Already in v1 ✓
  - Core contribution mechanism

- **Search**: Medium | NOT in v1 — **HIGH PRIORITY**
  - Users need to find existing ideas before creating duplicates
  - Critical for platform utility as idea count grows

- **Category/topic organization**: Medium | NOT in v1 — **HIGH PRIORITY**
  - Platforms without categories become unusable at scale (100+ ideas)
  - Decidim, Consul, and Participa all use category hierarchies
  - Example categories: Transportation, Environment, Education, Public Safety

- **View idea details and discussion history**: Simple | Already in v1 (likely) ✓
  - Users need to understand proposal context before voting

- **Sorting/filtering options**: Simple | NOT in v1 — **MEDIUM PRIORITY**
  - Sort by: Most voted, Newest, Most commented, Open vs Closed
  - Filter by: Status, Category, Author

- **Status tracking (Open, Under Review, Implemented, Rejected)**: Medium | NOT in v1 — **MEDIUM PRIORITY**
  - Users need to know proposal lifecycle
  - Creates accountability perception

- **Mobile-responsive design**: Simple | NOT in v1 — **HIGH PRIORITY**
  - Mobile users comprise 60%+ of civic platform traffic
  - Table stakes for modern apps

- **Accessibility (WCAG 2.1 AA minimum)**: Medium | NOT in v1 — **MEDIUM PRIORITY**
  - Legal requirement in many jurisdictions
  - Required for inclusive civic engagement

- **Basic user profiles**: Simple | NOT in v1 — **LOW PRIORITY**
  - Shows contribution history
  - Builds trust in repeated participants

- **Duplicate detection/merge capability**: Medium | NOT in v1 — **MEDIUM PRIORITY**
  - Moderators need to consolidate similar ideas
  - Prevents vote splitting on essentially identical proposals

- **Admin moderation dashboard**: Medium | Already in v1 ✓
  - Basic moderation queue exists

---

## Differentiators (Competitive advantages)

Features that distinguish platforms and create network effects or switching costs.

### Engagement & Participation

- **Participatory budgeting module**: Hard | NOT in v1 (deferred)
  - Users allocate actual budget across competing proposals
  - Decidim's standout feature; drives deep engagement
  - Creates real governance stakes

- **Idea endorsement/co-sign without voting**: Medium | NOT in v1
  - Distinguishes "strong interest" from "casual support"
  - Used by Consul for signature gathering
  - Builds momentum narratives

- **Milestone/implementation tracking**: Hard | NOT in v1
  - Show implementation progress post-approval
  - Creates feedback loop: idea → decision → action
  - Decidim/Consul both offer this
  - Critical for credibility of platforms (shows ideas matter)

- **Notification system (smart alerts)**: Medium | NOT in v1 — **WORTH ADDING**
  - Alert users when ideas they care about get comments
  - Alert when voting deadlines approach
  - Increases retention and participation

### Quality & Information

- **Rich text formatting for ideas/comments**: Simple | NOT in v1
  - Bold, links, images enable better proposals
  - Decidim standard; improves proposal quality

- **Idea attachment support (PDF, images, documents)**: Medium | NOT in v1
  - Studies, diagrams, supporting evidence
  - Increases proposal credibility

- **Related ideas linking**: Medium | NOT in v1
  - Show similar ideas and how they differ
  - Reduces redundancy; helps users understand landscape

- **Official government responses to ideas**: Hard | NOT in v1
  - Government statement on why approved/rejected
  - Creates legitimacy; shows ideas are actually reviewed
  - Distinguishes real civic platforms (Consul/Decidim) from entertainment

- **Voting deadline/closure mechanism**: Simple | NOT in v1
  - Ideas shouldn't stay open forever
  - Creates urgency; bunches engagement

- **Deliberation phase separation**: Medium | NOT in v1
  - Separate phases: Idea submission → Discussion → Voting → Implementation
  - Decidim's innovation; prevents vote-rushing

### Community & Trust

- **Topic moderation (volunteers or staff manage categories)**: Medium | NOT in v1
  - Distributed moderation authority
  - Builds community ownership
  - Decidim's "Participatory Process" feature

- **User reputation or trust badges** (cautious): Medium | NOT in v1
  - Badges for verified community members (not reputation scores)
  - Example: "Government Official", "Verified Resident"
  - Only if designed carefully (see Anti-Features)

- **Multi-language support**: Medium | NOT in v1
  - Essential for immigrant communities and global platforms
  - Decidim emphasizes this; makes sense for cross-country platform

- **Real-time activity feed**: Medium | NOT in v1
  - See new ideas/votes/comments live
  - Low priority but increases sense of live community

- **Social proof cues (recent votes, trending badges)**: Simple | NOT in v1
  - "123 people voted on this today"
  - Mild engagement boost

---

## Anti-Features (Don't build these)

Features that sound good but cause problems in civic platforms—deliberately avoid.

### Toxic Incentive Structures

- **Reputation/karma systems with points or scoring**: Hard to build correctly; causes gaming
  - Why it's bad: Creates leaderboards → vote gaming → quality collapse
  - Examples: Reddit's karma system breeds low-quality contributions
  - Civic context worse: People pursue points instead of good governance
  - Alternative: Use badges for achievements, not scores

- **Gamification (badges, levels, achievements for engagement)**: Can trivialize serious issues
  - Why it's bad: Encourages frivolous voting and idea creation
  - "Idea Creator 5x" badge incentivizes spam
  - In civic context, voting should feel weighty, not fun

- **Algorithmic/personalized feed**: Increases echo chambers in governance
  - Why it's bad: Citizens need to see proposals they disagree with
  - Creates filter bubbles → polarization → dysfunction
  - Use chronological or category-based feeds instead

- **Viral/sharing mechanics (share to earn bonus points)**: Spreads poor-quality ideas
  - Why it's bad: Ideas succeed by virality, not merit
  - Encourages clickbait-style proposal titles
  - Particularly bad for civic engagement

- **Recommendation engine (AI-driven "ideas you might like")**: See algorithmic feed concerns
  - Could fragment into subsections of civic sphere
  - Better to let users consciously choose categories/topics

---

### Complexity & Confusion

- **Complex identity verification (SMS, government ID)**: Hard to maintain; excludes marginal communities
  - Why it's bad: Implementation headaches; locks out undocumented residents, poor unbanked populations
  - Creates false sense of legitimacy (governments still ignore unverified proposals anyway)
  - Better: Keep email-based; let moderation handle bad actors

- **Cryptocurrency/blockchain integration**: Solves no real problem in civic context; adds technical debt
  - Why it's bad: Requires users to understand wallets; creates accessibility barriers
  - Civic engagement isn't about financial incentives
  - Better: Stick with simple vote-counting

- **Complex voting systems (quadratic voting, approval voting, ranked choice)**: Confuses users
  - Why it's bad: Users don't understand voting math → disengage or game it
  - Civic platforms need legitimacy from simple, understandable processes
  - Better: Stick with 1-vote-per-user until you have 10k+ active users

- **AI-generated moderation summaries**: Creates liability and trust issues
  - Why it's bad: AI can misrepresent user positions; opens platform to criticism of bias
  - Civic context requires human judgment
  - Better: Crowdsource summaries or hire moderators

---

### Governance Dysfunction

- **Proposal ownership/editing after votes cast**: Changes the voting target; breaks legitimacy
  - Why it's bad: If author edits proposal mid-voting, votes no longer correspond to same idea
  - Better: Lock proposals once voting starts; allow clarification comments instead

- **Private/hidden ideas**: Breaks transparency principle of civic engagement
  - Why it's bad: Defeats purpose; governance requires public discourse
  - Better: All ideas public by default; only hide spam/violations

- **Weighted voting (admin can give some votes more weight)**: Appears as favoritism
  - Why it's bad: Even if justified (e.g., government officials get 2x votes), erodes trust
  - Better: Separate "official response" feature instead; keep voting 1-person-1-vote

- **Curation/featured ideas by algorithmic ranking**: Concentrates visibility bias
  - Why it's bad: What appears "featured" is treated as endorsed; creates politics of promotion
  - Better: Use democratic selection (voted to featured) or time-based rotation

---

### Platform Dependency

- **Dependency on third-party payment systems**: Limits geographic deployment; creates jurisdiction issues
  - Why it's bad: Some regions have payment restrictions; not needed for civic engagement
  - Better: Fund platform through grants/government; no payment system required

- **Reliance on cloud proprietary platforms (AWS-only, Google-only)**: Locks in governments
  - Why it's bad: Governments should own their civic data; vendor lock-in is anti-democratic
  - Better: Decidim/Consul are self-hosted open source for reason
  - For IdeaHub: Plan for self-hosting option early

---

## Priority Matrix: What to Build Next

Based on impact + complexity analysis:

### DO FIRST (High impact, Low/Medium complexity)
1. **Search**: Mandatory at scale; enables discovery; prevents duplicates
2. **Categories/Topics**: Makes platform usable with 50+ ideas
3. **Sorting & Filtering**: Low complexity; huge UX improvement
4. **Mobile responsive**: Table stakes for modern apps
5. **Status tracking**: Shows accountability; builds platform credibility
6. **Notifications**: Increases retention with minimal complexity

### DO SECOND (High impact, Medium complexity)
7. **Duplicate detection**: Moderator tool; improves proposal quality
8. **Rich text formatting**: Improves proposal quality without new systems
9. **Idea attachments**: Evidence-driven proposals
10. **Multi-language support**: Essential if truly global
11. **Accessibility (WCAG AA)**: Legal + ethical requirement
12. **Related ideas linking**: Improves user understanding

### DO LATER (High impact, High complexity)
13. **Milestone/implementation tracking**: Creates accountability feedback loop
14. **Participatory budgeting**: Advanced engagement; separable product
15. **Deliberation phases**: Structural improvement; requires workflow redesign
16. **Government response system**: Requires government integration

### SKIP (Avoid entirely)
- Reputation systems, gamification, algorithmic feeds, complex identity verification, blockchain, AI moderation

---

## Key Takeaways for IdeaHub

1. **You have the core right** (voting, ideas, comments, moderation) but lack key scaling features (search, categories)

2. **Search + Categories should be v2 must-haves** — Without them, user experience degrades rapidly with volume

3. **Avoid the reputation/gaming trap** — Lots of civic platforms added scoring systems; they regret it. Keep it simple.

4. **Implementation tracking is your potential differentiator** — Most civic platforms stop at "idea accepted"; tracking implementation would show users ideas actually matter

5. **Stay lightweight on identity** — Email is right call; SMS/government ID creates more friction than value

6. **Plan for government integration early** — Official responses to ideas (even if negative) transforms platform from suggestion box to real governance tool

7. **Open source / self-hosted roadmap** — Governments/cities want to own their civic data; consider this for enterprise positioning
