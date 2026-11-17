# Setu — a Bridge strategy lab and practice table

*Working name: "Setu" (Sanskrit for bridge). Plan and design, written 2026-11-14. Nothing is built yet.*

## 1. Is this possible?

Yes. Every piece she asked for can be built, and most of it rests on well-understood bridge software techniques. The honest picture:

| She wants | Possible? | How |
|---|---|---|
| Feed in her ideas and agreements | Yes | Her system is stored as plain-language rule cards on top of a ready-made base system |
| Have them critically analysed, holes found | Yes — this is the strongest part | Mechanical checks over millions of hands; a computer is far better at this than a person |
| Test them out | Yes | Deal thousands of hands, bid them with her system, score every result against the best possible contract |
| Play with a bot partner who uses her system | Yes | The bot bids and signals strictly from her rule cards and explains every call |
| Review how she played and how the system did | Yes | Each board's loss is split into system, judgment, card play, or luck |
| Help her improve over time | Yes | A leak tracker across sessions, plus drills built from her own mistakes |

Two things to be straight about:

- **The bot partner will be a solid, disciplined club player, not a champion.** It will never forget the system, which makes it a good test partner, but it will not bluff, read a hesitation, or play the opponents.
- **Test results are evidence, not proof.** The app will always show how sure it is ("+0.4 IMPs a board, give or take 0.3 — run more deals") and never a bare number.

## 2. The loop she works in

```
 WRITE an idea  ->  CRITIQUE it  ->  TEST it on thousands of deals
       ^                                        |
       |                                        v
 REFINE the idea  <-  REVIEW what happened  <-  PLAY it with the bot
```

The whole app is this loop. Each screen is one step of it.

## 3. What counts as a "strategy"

Her ideas fall into three kinds, and the app handles each differently:

1. **Agreements** — the bidding system and conventions ("after 1NT, 2♣ is Stayman", "we play weak twos in three suits"), plus carding (leads, signals, discards). These are exact rules. The bot follows them to the letter.
2. **Style** — judgment dials ("open light in third seat", "pre-empt aggressively when not vulnerable", "overcall on a good five-card suit with 8 points"). These are thresholds she can slide up and down and test.
3. **Card-play ideas** — how to play a suit combination, what to lead against a given auction, a plan for a specific hand. These are tested against every possible lie of the cards.

## 4. How she feeds in her ideas

She never writes a system from scratch. She:

1. Picks a **base system** she already plays (Standard American, 2/1, Acol, Precision — see decision A).
2. Flips **convention switches** on or off (Stayman, transfers, Jacoby 2NT, RKCB, Michaels, and so on).
3. Adds **her own rule cards** for anything special. A rule card reads like a convention card, not like code:

```
After:    1NT – (pass)
Bid:      2♣  "Stayman"
Shows:    8+ points, at least one four-card major
Forcing:  one round
Partner replies:  2♦ no major · 2♥ four hearts · 2♠ four spades, not four hearts
```

4. Later (Phase 5), she can simply type or dictate an idea in her own words — "I want to try opening 1NT with 12–14 when not vulnerable" — and the coach turns it into rule cards for her to confirm.

Each version of her system is saved, so she can always compare "my system in October" against "my system with the new idea".

## 5. How the critique works

When she adds or changes a rule, the app deals a very large number of random hands and reports, in plain words:

- **Gaps** — hands her system has no bid for. "With 11 points and 4-4-4-1 shape you have no opening. This comes up once in 60 deals."
- **Overlaps** — hands two rules both claim, so partner cannot know which she holds.
- **Dead ends** — auctions where one partner has no sensible continuation, or a forcing bid has no defined reply.
- **Interference holes** — "You have agreed what 2♣ means, but not what happens if they double it or overcall 2♠." This is where most real partnerships leak.
- **What it costs** — the natural bid given up to make room for the convention, and how often that bid would have been wanted.
- **Memory load** — "This sequence comes up once in 900 deals. Rare agreements get forgotten at the table."
- **Wrong-siding and leakage** — whether the convention tends to make the weaker hand declarer, or tells the opponents what to lead.

Every finding comes with example hands she can deal out and look at.

## 6. How testing works (the Lab)

- She sets a situation — "we open 1NT", "they pre-empt 3♠ over our 1♥", or just "any deal".
- The app deals a few thousand hands that fit, bids each one with her system (bots in all four seats; opponents play a standard field system), and uses a solver to find the result of every final contract.
- **A/B test:** the same deals are bid twice — once with her current system, once with the new idea — so luck cancels out. Scoring is in IMPs or matchpoints (decision D).
- The report says: how often the idea came up, how much it gained or lost when it did, the ten biggest wins, the ten biggest disasters, and each one opens as a full deal.

Card-play ideas get their own small tool: enter a suit combination and the number of tricks needed, and it shows the success rate of each line of play.

## 7. Playing with the bot partner (the Table)

- She sits South. Partner and both opponents are bots. Partner plays **her** system and **her** carding.
- Every bot call can be tapped to see what it promised under her agreements — like a self-alerting partner.
- Deals can be random, drawn from a situation she wants to practise, or a replay of a disaster the Lab found.
- **Bidding-only mode:** bid the hand, then the solver shows what the contract would make. Twenty boards in ten minutes — the fastest way to drill a new agreement.
- **Full play mode:** she declares or defends. The bots choose plays by imagining many layouts consistent with the auction and picking the card that works most often.
- When the system has no rule for a hand, the bot says so ("no agreement — I bid naturally") and logs it as a gap.

## 8. Review

After each board and each session, every lost trick or lost score is put in one of four boxes:

| Box | Meaning | Example |
|---|---|---|
| **System** | Both followed the agreements; the agreements led to a poor contract | "Your methods cannot find the 4-4 spade fit here" |
| **Judgment** | She departed from the system or chose badly between allowed bids | "System says pass; you bid 3♥. It cost 5 IMPs on average" |
| **Card play** | A play that loses on most layouts she could not rule out | "Finesse wins 50%; the drop you chose wins 34%" |
| **Luck** | Right decision, bad layout | "Slam was 78% and failed. Bid it again" |

The "luck" box matters: play is graded against what she could know, not against seeing all four hands, so she is never blamed for a correct play that happened to fail.

She can also **import her real hands from Bridge Base Online** (BBO lets players download their hand records) and get the same review on games she played with human partners.

Over weeks, a **leak tracker** shows where points keep going — "slam bidding after a 2♣ opening", "opening leads against no-trumps" — and offers drills on exactly that.

## 9. Screens

Five rooms, one job each. Large cards and large text throughout; plain language; nothing hidden behind small icons.

| Room | What is on it |
|---|---|
| **Table** | Her hand, dummy, the auction box, the trick in progress. Tap any bid for its meaning. Buttons: bidding-only / full play, new deal, choose situation |
| **System** | Her convention card as a tidy notebook: base system, switches, her rule cards, style dials. A "Check this" button runs the critique. Version history down the side |
| **Lab** | Pick a situation, pick version A and version B, press Run. Result headline, confidence, best and worst deals |
| **Review** | Board-by-board list with the four boxes colour-marked, card-by-card replay, "what if I had bid/played this instead" |
| **Progress** | Leak tracker, sessions played, suggested drill for today |

Look: the Instrument paper/backlit style, with the card table as the one place colour is used freely (suits, vulnerability). A clickable mockup of all five rooms comes before any real code.

## 10. How it is built

- **A web app she installs** on her laptop or tablet, working fully offline. Her system, hands and history stay on her device, with one-button export for backup.
- **The solver:** the open-source double-dummy solver used by most bridge software, running inside the app. It gives the exact trick count of any contract on any deal.
- **Her system as data:** rule cards are stored in a structured form the bot, the critic and the Lab all read. One source of truth — the bot cannot play a different system from the one being critiqued.
- **Standard hand formats** (PBN, and BBO's own format) for import and export, so hands move freely between this app, BBO and her club's records.
- **An AI coach, optional and added last.** Its job is language only: turning her words into rule cards and turning numbers into explanations. It never decides what the right bid or play is — the solver and the simulations do that, because language models are unreliable at card play.

## 11. Build phases

Each phase ends with something she can use.

| Phase | Delivers | She can |
|---|---|---|
| **0 Mockup and proof** | Clickable mockup of all five rooms; solver speed measured; licences checked | React to the look and flow before anything is built |
| **1 System and bidding table** | One base system, convention switches, rule cards; bidding-only table with a bot partner; solver verdict on each contract | Drill her agreements with a partner who never forgets |
| **2 Critic and Lab** | Gap / overlap / interference checks; situation dealer; A/B tests with confidence | Find the holes and test a new idea in minutes |
| **3 Card play** | Full play as declarer and defender; bots that follow her leads and signals; suit-combination tool | Play whole boards |
| **4 Review** | Four-box review, replay, "what if"; BBO import; leak tracker | Learn from both practice and real games |
| **5 Coach** | Ideas entered in her own words; plain-English explanations; drills from her leaks | Work with it like a patient teacher |

Phases 1 and 2 are the heart: they already answer "is my idea sound?" without her playing a single card.

## 12. Limits to know before starting

- The bots are honest and methodical. A convention designed to confuse human opponents will look weaker here than it is at the club.
- Opponents play one standard system at first. Testing against unusual opposing methods comes later.
- Solver-based scoring assumes perfect play by everyone after the auction. That is unfair to any single deal but fair for comparing two systems on the same deals, which is how the Lab uses it.
- Covering one base system well is real work. Each further base system (say, Precision after Standard) is a separate chunk.
- Deep competitive auctions are the hardest area for any bidding program. Expect the bot to be sound rather than inspired there.

## 13. Decisions (answered 2026-11-14)

- **A. System:** 2/1 Game Force. This is the base system built first.
- **B. Devices:** her MacBook Neo laptop and her Android phone. So it is a web app that works in the browser on both, installable on the phone's home screen, with a phone layout as a first-class design (bottom tab bar, one column).
- **C. Scoring:** pairs (matchpoints) is the default everywhere; IMPs stays available as a switch in the Lab.
- **D. AI coach:** decide at Phase 5. Nothing before that depends on AI.
- **E. Convention card:** she has one, not yet to hand. Phase 1 starts from stock 2/1; her card is entered when it arrives.
- **F. Partner:** just her. No sharing between devices is planned.
- **G. Name:** Setu.

### Still open

- **H. Hosting — decided 2026-11-14: Setu is hosted separately, at its own address, not on adityagovilkar.com.** The personal site keeps its download/export-only rule untouched. Setu gets its own repository and its own deployment, so file import (BBO hand records, backup restore, later the convention card) is allowed there. Files are still read inside her browser and not sent to a server.
- **I. Laptop and phone in step.** With no server, her system and history live separately on each device. Either she moves them with export/import (touches H), or she treats the laptop as the workbench and the phone as a practice table.

## 15. Progress

**Phase 1 — built 2026-11-16.** Run it with the `setu` launch config (port 8221), or `npm run dev` in `setu/`.

What works:

- **Table (bidding only).** A deal is dealt, the bots bid, she bids from South with a bidding box. Any call can be tapped for its meaning, its source (base card, her own rule card, or the bot's judgment where the card is silent) and what each player has shown so far. "What does my card say?" gives a hint. She can ask for a kind of deal: I open, partner opens, we open a major, we open 1NT, they open, game values, slam values.
- **Result.** All four hands, the solver's trick count for every contract, her score against the best contract her side could make, and each of her calls marked as on the card, different from the card, or made where the card is silent.
- **System.** Twelve convention switches that really change how partner bids. Her own rule cards (auction, call, points, suit lengths, shape, forcing, meaning) which take priority over the base card. Saved versions with restore. Save to and load from a file. The whole card can be read and looked up by typing an auction.
- **Engine.** About 410 rule lines for 2/1 in `src/engine/system21.ts`, written in a plain line format. Tests bid 3,000 random deals with no illegal call; against the solver about 70% of the bots' contracts make.

Not in Phase 1 (as planned): card play, the critic, the Lab, review of imported hands, the leak tracker, style dials.

Known limits of the bot today:

- Past the first two or three rounds of bidding it places the contract on points and fit rather than exploring, so it will miss some slams and some thin games.
- It never makes a penalty double below game values and never sacrifices.
- Opponents overcalling our 1NT, and most auctions after both sides have bid twice, are judged, not rule-driven. The Phase 2 critic will list exactly these.
- Hosted since 2026-11-16 at https://adityagovilkar-debug.github.io/setu/ (GitHub Pages, `npm run deploy`). Works offline after the first visit and can be added to the Dock or the phone home screen. Not yet tried on a real Mac or in Safari.

**Phase 2 — built 2026-11-17.**

- **Critic** ("Check this system" in the System room). Bids 10,000 random deals with her card for both partners and the stock card for the opponents. Reports the share of bids made on judgment, the gaps (auctions where a bid had to be made with no rule), most frequent first and marked when they arise after opponents' action, with an example hand, "bid this deal at the Table", and "write a rule for this" (opens the rule editor with the auction filled in). For her own rule cards: how often each fires, what the base card would have bid instead, clashes between two of her cards, cards that never come up, cards that cannot be read. Convention usage, with rare ones flagged as easy to forget.
- **Lab.** A against B, where each is "my card now", a saved version, or stock 2/1. Situation filter, 500 / 2,000 / 5,000 deals, matchpoints or IMPs. Bids every deal both ways; deals with the same contract are ties and skipped; the rest are solved double-dummy in a pool of Web Workers. Verdict only when the difference is outside a 95% margin and at least 30 deals differed; otherwise "no clear winner" or "too few deals". Dot matrix, biggest gains and losses, full deal with both auctions side by side, and a link to bid the deal at the Table.
- Guide updated (parts 7 and 8).

What the critic found in the base card on first run (2026-11-17): about 17% of the partnership's bids are made on judgment. The most frequent gaps are opener's rebid after partner's negative double, and responder's second bid after 1m – 1♥ – 1♠ and 1m – 1♠ – 2♣. These are in my base card, not her system; filling them is a good next step for the base card.

Lab, semi-forcing against forcing 1NT, 2,000 deals where we open a major: 35 deals differed, B 51.4% ± 13.6 — no clear winner, as expected for a small change.

## 14. Mockup

`setu/mockup/index.html` — clickable preview of all five rooms with sample figures (launch config `setu-mockup`, port 8220). Nothing in it is calculated.
