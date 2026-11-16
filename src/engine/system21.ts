// The base system: 2/1 Game Force, written as rule lines.
// Line format:  auction so far | call | hand needed | meaning | flags
// Within one auction the first line that fits the hand wins, so order matters.
// Suit letters: C D H S.  M = a major, oM = the other major, m = a minor, om = the other minor,
// X Y Z = any suits (different letters are different suits).  Opponents' calls are in brackets.
import { Rule, SystemCard, parseRules } from './rules';

export interface Convention {
  id: string;
  name: string;
  on: boolean;
  blurb: string;
}
export const CONVENTIONS: Convention[] = [
  { id: 'stayman', name: 'Stayman', on: true, blurb: '2♣ over 1NT (3♣ over 2NT) asks for a four-card major.' },
  { id: 'transfers', name: 'Jacoby transfers', on: true, blurb: 'Over 1NT, 2♦ shows hearts and 2♥ shows spades.' },
  { id: 'forcing1nt', name: 'Forcing 1NT', on: true, blurb: '1NT over a major is forcing. Off = semi-forcing: opener may pass a balanced minimum.' },
  { id: 'jacoby2nt', name: 'Jacoby 2NT', on: true, blurb: '2NT over a major: four-card support, game forcing.' },
  { id: 'bergen', name: 'Bergen raises', on: false, blurb: '3♣ and 3♦ over a major show four trumps; 3 of the major is weak.' },
  { id: 'drury', name: 'Reverse Drury', on: true, blurb: '2♣ by a passed hand over a major shows a fit and 10–12.' },
  { id: 'nmf', name: 'New minor forcing', on: true, blurb: 'After 1 minor – 1 major – 1NT, the other minor asks about the major.' },
  { id: 'inverted', name: 'Inverted minors', on: false, blurb: 'A single raise of a minor is strong; a jump raise is weak.' },
  { id: 'negdbl', name: 'Negative doubles', on: true, blurb: 'Double of an overcall shows the unbid majors, not penalty.' },
  { id: 'michaels', name: 'Michaels cue bid', on: true, blurb: 'Bidding their suit shows two five-card suits.' },
  { id: 'unusual', name: 'Unusual 2NT', on: true, blurb: 'A jump to 2NT over their opening shows the two lowest unbid suits.' },
  { id: 'rkcb', name: 'Roman Key Card 1430', on: true, blurb: '4NT asks for the five key cards. Off = plain Blackwood (aces only).' },
];

export function defaultCard(name = '2/1 Game Force'): SystemCard {
  const conv: Record<string, boolean> = {};
  for (const c of CONVENTIONS) conv[c.id] = c.on;
  return { name, conv, own: [] };
}

/** Section titles for the rule browser, keyed by the first rule of each section. */
export const SECTIONS: [string, string][] = [];

const TEXT = `
# ================= OPENING BIDS
open | 2C | hcp 22+ | Strong and artificial: 22 or more points, any shape | F
open | 2N | hcp 20-21, bal | 20–21 points, balanced
open | 1N | hcp 15-17, bal | 15–17 points, balanced. May include a five-card major
open | 1S | hcp 11-21, pts 13+, S5+, S>=H, S>=D, S>=C | Five or more spades, 12–21 points (11 with extra length)
open | 1H | hcp 11-21, pts 13+, H5+, H>=D, H>=C | Five or more hearts, 12–21 points (11 with extra length)
open | 1S | hcp 10-11, S5+, good S, seat3 | Light opening in third seat on a good five-card suit
open | 1H | hcp 10-11, H5+, good H, seat3 | Light opening in third seat on a good five-card suit
open | 1D | hcp 12-21, D4+, D>=C | Four or more diamonds, 12–21 points
open | 1D | hcp 12-21, D3, C2- | 12–21 points; only three diamonds when the shape is 4-4-3-2
open | 1C | hcp 12-21, C3+ | Three or more clubs, 12–21 points
open | 1D | hcp 11, pts 13+, D5+, D>=C | Diamonds, 11 points with extra length
open | 1C | hcp 11, pts 13+, C5+ | Clubs, 11 points with extra length
open | 2S | hcp 5-10, S6, good S | Weak two: a good six-card suit, 5–10 points
open | 2H | hcp 5-10, H6, good H | Weak two: a good six-card suit, 5–10 points
open | 2D | hcp 5-10, D6, good D | Weak two: a good six-card suit, 5–10 points
open | 3X | hcp 5-10, X7+, good X | Pre-empt: a seven-card suit, 5–10 points
open | P | hcp 0-11 | Not enough to open

# ================= OUR 1NT OPENING
1N | 2H | S5+, S>=H | Transfer: five or more spades, any strength | F conv:transfers
1N | 2D | H5+ | Transfer: five or more hearts, any strength | F conv:transfers
1N | 2C | hcp 8+, anymaj4 | Stayman: asks for a four-card major, 8+ points | F conv:stayman
1N | 3S | S5+, hcp 10+ | Five or more spades, forcing to game | GF !conv:transfers
1N | 3H | H5+, hcp 10+ | Five or more hearts, forcing to game | GF !conv:transfers
1N | 2S | S5+, hcp 0-7 | To play | !conv:transfers
1N | 2H | H5+, hcp 0-7 | To play | !conv:transfers
1N | 6N | hcp 18-19 | To play
1N | 4N | hcp 16-17 | Invites slam: 16–17 points, no major to show
1N | 3N | hcp 10-15 | To play
1N | 2N | hcp 8-9 | Invites game: 8–9 points
1N | P | hcp 0-7 | Nothing to add
1N 3M | 4M | M3+ | Three-card support | !conv:transfers
1N 3M | 3N | | No fit | !conv:transfers
1N 2C | 2H | H4+ | Four hearts (may also hold four spades)
1N 2C | 2S | S4+ | Four spades, not four hearts
1N 2C | 2D | | No four-card major
1N 2D | 3H | H4+, hcp 17 | Super-accept: four hearts and a maximum | conv:transfers
1N 2D | 2H | | Completes the transfer | conv:transfers
1N 2H | 3S | S4+, hcp 17 | Super-accept: four spades and a maximum | conv:transfers
1N 2H | 2S | | Completes the transfer | conv:transfers
1N 2C 2D | 6N | hcp 18+ | To play
1N 2C 2D | 4N | hcp 16-17 | Invites slam
1N 2C 2D | 3N | hcp 10-15 | To play
1N 2C 2D | 2N | hcp 8-9 | Invites game, no major fit
1N 2C 2M | 4M | M4+, hcp 10-15 | To play: a 4-4 fit
1N 2C 2M | 3M | M4+, hcp 8-9 | Invites game with four-card support
1N 2C 2M | 3N | hcp 10-15, M3- | To play; holds four of the other major
1N 2C 2M | 2N | hcp 8-9, M3- | Invites game; holds four of the other major
1N 2C 2D 2N | 3N | hcp 16-17 | Accepts
1N 2C 2D 2N | P | | Declines
1N 2C 2H 2N | 4S | S4+, hcp 16-17 | Accepts in the spade fit
1N 2C 2H 2N | 3S | S4+ | Declines, but shows four spades
1N 2C 2H 2N | 3N | hcp 16-17 | Accepts
1N 2C 2H 2N | P | | Declines
1N 2C 2S 2N | 3N | hcp 16-17 | Accepts
1N 2C 2S 2N | P | | Declines
1N 2C 2H 3N | 4S | S4+ | Corrects to the spade fit
1N 2C 2H 3N | P | | To play
1N 2C 2M 3M | 4M | hcp 16-17 | Accepts
1N 2C 2M 3M | P | | Declines
1N 2N | 3N | hcp 16-17 | Accepts
1N 2N | P | | Declines
1N 4N | 6N | hcp 17 | Accepts
1N 4N | P | | Declines
1N 2D 2H | P | hcp 0-7 | To play
1N 2D 2H | 3H | hcp 8-9, H6+ | Invites game with six hearts
1N 2D 2H | 2N | hcp 8-9 | Invites game with exactly five hearts
1N 2D 2H | 4H | hcp 10-15, H6+ | To play
1N 2D 2H | 3N | hcp 10-15 | Choice of games: exactly five hearts
1N 2H 2S | P | hcp 0-7 | To play
1N 2H 2S | 3S | hcp 8-9, S6+ | Invites game with six spades
1N 2H 2S | 2N | hcp 8-9 | Invites game with exactly five spades
1N 2H 2S | 4S | hcp 10-15, S6+ | To play
1N 2H 2S | 3N | hcp 10-15 | Choice of games: exactly five spades
1N 2D 3H | 4H | hcp 6+ | Accepts
1N 2D 3H | P | | Too weak for game
1N 2H 3S | 4S | hcp 6+ | Accepts
1N 2H 3S | P | | Too weak for game
1N 2D 2H 2N | 4H | H3+, hcp 16-17 | Accepts with three hearts
1N 2D 2H 2N | 3H | H3+ | Declines, prefers hearts
1N 2D 2H 2N | 3N | hcp 16-17 | Accepts with two hearts
1N 2D 2H 2N | P | | Declines
1N 2D 2H 3N | 4H | H3+ | Prefers the 5-3 heart fit
1N 2D 2H 3N | P | | Only two hearts
1N 2D 2H 3H | 4H | hcp 16-17 | Accepts
1N 2D 2H 3H | P | | Declines
1N 2H 2S 2N | 4S | S3+, hcp 16-17 | Accepts with three spades
1N 2H 2S 2N | 3S | S3+ | Declines, prefers spades
1N 2H 2S 2N | 3N | hcp 16-17 | Accepts with two spades
1N 2H 2S 2N | P | | Declines
1N 2H 2S 3N | 4S | S3+ | Prefers the 5-3 spade fit
1N 2H 2S 3N | P | | Only two spades
1N 2H 2S 3S | 4S | hcp 16-17 | Accepts
1N 2H 2S 3S | P | | Declines

# ================= OUR 2NT AND 2♣ OPENINGS
2N | 3H | S5+, S>=H | Transfer to spades | F conv:transfers
2N | 3D | H5+ | Transfer to hearts | F conv:transfers
2N | 3C | hcp 4+, anymaj4 | Stayman | F conv:stayman
2N | 4N | hcp 11-12 | Invites slam
2N | 3N | hcp 4-10 | To play
2N | P | hcp 0-3 | Nothing to add
2N 3C | 3H | H4+ | Four hearts
2N 3C | 3S | S4+ | Four spades
2N 3C | 3D | | No four-card major
2N 3C 3D | 3N | | To play
2N 3C 3M | 4M | M4+ | To play: a 4-4 fit
2N 3C 3M | 3N | | To play; holds the other major
2N 3C 3H 3N | 4S | S4+ | Corrects to the spade fit
2N 3C 3H 3N | P | | To play
2N 3D | 3H | | Completes the transfer | conv:transfers
2N 3H | 3S | | Completes the transfer | conv:transfers
2N 3D 3H | 4H | H6+ | To play
2N 3D 3H | 3N | hcp 4+ | Choice of games
2N 3D 3H | P | | To play
2N 3H 3S | 4S | S6+ | To play
2N 3H 3S | 3N | hcp 4+ | Choice of games
2N 3H 3S | P | | To play
2N 3D 3H 3N | 4H | H3+ | Prefers the heart fit
2N 3D 3H 3N | P | | Only two hearts
2N 3H 3S 3N | 4S | S3+ | Prefers the spade fit
2N 3H 3S 3N | P | | Only two spades
2C | 2D | | Waiting: says nothing about the hand yet | F
2C 2D | 3N | hcp 25-27, bal | 25–27 points, balanced
2C 2D | 2N | hcp 22-24, bal | 22–24 points, balanced
2C 2D | 2S | S5+, S>=H | Five or more spades, forcing to game | GF
2C 2D | 2H | H5+ | Five or more hearts, forcing to game | GF
2C 2D | 3D | D5+, D>=C | Five or more diamonds, forcing to game | GF
2C 2D | 3C | C5+ | Five or more clubs, forcing to game | GF
2C 2D | 2N | | 22+ points, no five-card suit
2C 2D 2N | 3N | hcp 3-10 | To play
2C 2D 2N | P | hcp 0-2 | Nothing at all

# ================= PARTNER OPENS 1♥ OR 1♠
1M | 2N | M4+, hcp 13+, !ph | Jacoby 2NT: four-card support, forcing to game | GF conv:jacoby2nt
1M | 2C | M3+, sup 10+, hcp 0-12, ph | Drury: a passed hand with a fit and 10–12 | F conv:drury
1M | 4M | M5+, hcp 0-9 | Weak raise to game on five trumps
1M | 3D | M4+, sup 10+, hcp 0-12 | Bergen: four trumps, 10–12 | F conv:bergen
1M | 3C | M4+, sup 7-9 | Bergen: four trumps, 7–9 | F conv:bergen
1M | 3M | M4+, hcp 0-6 | Bergen: four trumps and a weak hand | conv:bergen
1M | 3M | M4+, sup 10+, hcp 0-12 | Limit raise: four trumps, 10–12 | !conv:bergen
1M | 2M | M3+, sup 6-9 | Single raise: three or more trumps, 6–9
1S | 2H | H5+, hcp 13+, !ph | Five or more hearts, forcing to game | GF
1M | 2D | D5+, hcp 13+, !ph | Five or more diamonds, forcing to game | GF
1M | 2C | C5+, hcp 13+, !ph | Five or more clubs, forcing to game | GF
1H | 1S | S4+, hcp 6+ | Four or more spades, 6+ points | F
1M | 2D | D4+, D>C, hcp 13+, !ph | Diamonds, forcing to game | GF
1M | 2C | hcp 13+, !ph | Forcing to game: clubs, or a balanced hand with nothing better to bid | GF
1M | 1N | hcp 6-12 | Forcing for one round: 6–12 points, no better bid | F conv:forcing1nt
1M | 1N | hcp 6-12 | Semi-forcing: 6–12 points. Opener may pass with a balanced minimum | !conv:forcing1nt
1M | P | hcp 0-5 | Too weak to respond
1M 2M | 4M | pts 19+ | To play
1M 2M | 3M | pts 16-18 | Invites game
1M 2M | P | pts 0-15 | Content
1M 2M 3M | 4M | sup 8+ | Accepts
1M 2M 3M | P | | Declines
1M 3M | 4M | pts 14+ | Accepts the limit raise | !conv:bergen
1M 3M | 4M | pts 19+ | To play | conv:bergen
1M 3M | P | | Content
1M 3C | 4M | pts 17+ | To play | conv:bergen
1M 3C | 3M | | Sign-off | conv:bergen
1M 3C 3M | P | | As asked | conv:bergen
1M 3D | 4M | pts 14+ | Accepts | conv:bergen
1M 3D | 3M | | Declines | conv:bergen
1M 3D 3M | P | | As asked | conv:bergen
1M 4M | P | | Content
1M 2C | 4M | hcp 15+, pph | Drury reply: to play | conv:drury
1M 2C | 3M | hcp 13-14, pph | Drury reply: a sound opening, invites game | conv:drury
1M 2C | 2M | pph | Drury reply: minimum or light opening | conv:drury
1M 2C 2M | P | ph | Content | conv:drury
1M 2C 3M | 4M | sup 11+, ph | Accepts | conv:drury
1M 2C 3M | P | ph | Declines | conv:drury
1M 2N | 3C | C1- | Shortness: a singleton or void in clubs | conv:jacoby2nt
1M 2N | 3D | D1- | Shortness: a singleton or void in diamonds | conv:jacoby2nt
1M 2N | 3oM | oM1- | Shortness: a singleton or void in the other major | conv:jacoby2nt
1M 2N | 3M | hcp 18+ | Strong hand, no shortness | conv:jacoby2nt
1M 2N | 3N | hcp 15-17 | Medium hand, no shortness | conv:jacoby2nt
1M 2N | 4M | | Minimum, no shortness | conv:jacoby2nt
1M 1N | P | hcp 11-13, bal | Balanced minimum: passes the semi-forcing 1NT | !conv:forcing1nt
1M 1N | 4M | M6+, hcp 19+ | To play
1M 1N | 3M | M6+, hcp 16-18 | Six-card suit, invites game
1M 1N | 2M | M6+, hcp 10-15 | Six-card suit, minimum
1S 1N | 3H | H4+, hcp 19+ | Jump shift: forcing to game | GF
1M 1N | 3D | D4+, hcp 19+ | Jump shift: forcing to game | GF
1M 1N | 3C | C4+, hcp 19+ | Jump shift: forcing to game | GF
1H 1N | 2S | S4+, hcp 17+ | Reverse: four spades and extra strength | F
1M 1N | 2N | hcp 18-19, bal | 18–19 points, balanced
1S 1N | 2H | H4+, hcp 10-18 | Four or more hearts
1M 1N | 2D | D4+, D>C, hcp 10-18 | Four or more diamonds
1M 1N | 2C | C3+, hcp 10-18 | Clubs; may be only three
1M 1N | 2D | D3+, hcp 10-18 | Diamonds; may be only three
1M 1N | 2M | hcp 10-15 | Nothing better to bid
1M 1N 2m | 3M | M3+, sup 10+ | Three-card limit raise
1M 1N 2m | 2N | hcp 10-12 | Invites game, no fit
1M 1N 2m | 2M | M2 | Preference with a doubleton
1M 1N 2m | P | m4+ | Prefers the minor
1M 1N 2m | 2Z | Z6+ | Own six-card suit, weak
1M 1N 2m | 2M | | Preference
1S 1N 2H | 3S | S3+, sup 10+ | Three-card limit raise
1S 1N 2H | 3H | H4+, hcp 10-12 | Invites game in hearts
1S 1N 2H | 2N | hcp 10-12 | Invites game, no fit
1S 1N 2H | P | H3+, S1- | Prefers hearts
1S 1N 2H | 2S | | Preference
1M 1N 2M | 3M | M2+, hcp 10-12 | Invites game
1M 1N 2M | P | | Content
1M 1N 3M | 4M | hcp 8+ | Accepts
1M 1N 3M | P | | Declines
1M 1N 2N | 3N | hcp 7+ | Accepts
1M 1N 2N | P | | Declines
1S 2H | 3H | H3+, !pph | Heart support
1M 2m | 3m | m4+, !pph | Support for partner's minor
1S 2C | 2H | H4+, !pph | Four or more hearts
1M 2C | 2D | D4+, !pph | Four or more diamonds
1S 2D | 2H | H4+, !pph | Four or more hearts
1H 2m | 2S | S4+, !pph | Four spades
1M 2X | 2N | bal, hcp 11-14, !pph | Balanced minimum
1M 2X | 3N | bal, hcp 15-17, !pph | Balanced, 15–17
1M 2X | 2N | bal, hcp 18+, !pph | Balanced, 18–19
1S 2H | 3D | D4+, hcp 15+, !pph | Diamonds, extra strength
1M 2X | 3C | C4+, hcp 15+, C>D, !pph | Clubs, extra strength
1M 2X | 2M | !pph | Five or more; says nothing new and does not promise six
1M 2X * | 3M | M3+, hcp 16+, !ph | Sets trumps with interest in slam | F
1M 2X * | 4M | M3+, !ph | Fast arrival: support, but a minimum game force

1H 1S | 4S | S4+, pts 19+ | Four-card support, to play
1H 1S | 3S | S4+, pts 16-18 | Four-card support, invites game
1H 1S | 2S | S4+, hcp 10-15 | Four-card support, minimum
1H 1S | 3H | H6+, hcp 16-18 | Six-card suit, invites game
1H 1S | 3D | D4+, hcp 19+ | Jump shift: forcing to game | GF
1H 1S | 3C | C4+, hcp 19+ | Jump shift: forcing to game | GF
1H 1S | 2N | hcp 18-19, bal | 18–19 points, balanced
1H 1S | 1N | hcp 10-14, bal | Minimum, balanced
1H 1S | 2H | H6+, hcp 10-15 | Six-card suit, minimum
1H 1S | 2D | D4+, D>C, hcp 10-18 | Four or more diamonds
1H 1S | 2C | C4+, hcp 10-18 | Four or more clubs
1H 1S | 2S | S3, hcp 10-15 | Three-card support, minimum
1H 1S | 2H | hcp 10-15 | Minimum, nothing better
1H 1S | 2N | | Extra strength, nothing better
1H 1S 1N | 4S | S6+, hcp 12-17 | To play
1H 1S 1N | 3S | S6+, hcp 10-11 | Invites game with a six-card suit
1H 1S 1N | 2S | S5+, hcp 0-10 | To play
1H 1S 1N | 2H | H3+, hcp 0-10 | Preference for hearts
1H 1S 1N | 3H | H3+, hcp 11-12 | Invites game in hearts
1H 1S 1N | 4H | H3+, hcp 13-17 | To play
1H 1S 1N | 3N | hcp 13-17 | To play
1H 1S 1N | 2N | hcp 11-12 | Invites game
1H 1S 1N | P | | Content
1H 1S 1N 2N | 3N | hcp 14 | Accepts
1H 1S 1N 2N | P | | Declines
1H 1S 2N | 3N | | To play

# ================= PARTNER OPENS 1♣ OR 1♦
1m | 1S | S5+, S>=H, hcp 6+ | Four or more spades, 6+ points | F
1m | 1H | H4+, hcp 6+ | Four or more hearts, 6+ points | F
1m | 1S | S4+, hcp 6+ | Four or more spades, 6+ points | F
1C | 1D | D4+, hcp 6+ | Four or more diamonds, 6+ points, no four-card major | F
1D | 2C | C5+, hcp 13+, !ph | Five or more clubs, forcing to game | GF
1D | 2D | D4+, hcp 10+ | Inverted raise: a fit and 10+ points | F conv:inverted
1C | 2C | C5+, hcp 10+ | Inverted raise: a fit and 10+ points | F conv:inverted
1m | 3m | m5+, hcp 0-9 | Inverted raise: a fit and a weak hand | conv:inverted
1m | 3N | hcp 13-15, bal | 13–15 points, balanced, no major
1m | 2N | hcp 11-12, bal | 11–12 points, balanced, no major
1m | 3m | m5+, hcp 10-12 | Limit raise: five-card support, 10–12 | !conv:inverted
1D | 2D | D4+, hcp 6-9 | Single raise, 6–9 | !conv:inverted
1C | 2C | C5+, hcp 6-9 | Single raise, 6–9 | !conv:inverted
1m | 1N | hcp 6-10 | 6–10 points, no major
1m | 2N | hcp 11-12 | 11–12 points, no major
1m | 3N | hcp 13-17 | To play
1m | P | hcp 0-5 | Too weak to respond
1m 1M | 4M | M4+, pts 19+ | Four-card support, to play
1m 1M | 3M | M4+, pts 16-18 | Four-card support, invites game
1m 1M | 2M | M4+, hcp 11-15 | Four-card support, minimum
1m 1H | 1S | S4+, hcp 11-18 | Four spades
1m 1M | 2N | hcp 18-19, bal | 18–19 points, balanced
1m 1M | 1N | hcp 12-14, bal | 12–14 points, balanced
1C 1M | 2D | D4+, C5+, hcp 17+ | Reverse: extra strength, clubs longer than diamonds | F
1m 1S | 2H | H4+, m5+, hcp 17+ | Reverse: extra strength | F
1m 1M | 3m | m6+, hcp 16-18 | Six-card suit, invites game
1D 1M | 2C | C4+, hcp 11-18 | Four or more clubs
1m 1M | 2m | m5+, hcp 11-15 | Rebids the suit: minimum
1m 1M | 1N | hcp 11-15 | Minimum, nothing better
1m 1M | 2N | | Extra strength, nothing better
1C 1D | 1H | H4+, hcp 11-18 | Four hearts
1C 1D | 1S | S4+, hcp 11-18 | Four spades
1C 1D | 2N | hcp 18-19, bal | 18–19 points, balanced
1C 1D | 1N | hcp 12-14, bal | 12–14 points, balanced
1C 1D | 3D | D4+, pts 16-18 | Four-card support, invites
1C 1D | 2D | D4+, hcp 11-15 | Four-card support
1C 1D | 2C | C5+, hcp 11-15 | Rebids the suit
1C 1D | 1N | hcp 11-15 | Minimum, nothing better
1C 1D | 2N | | Extra strength, nothing better
1m 1M 1N | 2om | M5+, hcp 11+ | New minor forcing: five-card major, invitational or better | F conv:nmf
1m 1M 1N | 4M | M6+, hcp 12-17 | To play
1m 1M 1N | 3M | M6+, hcp 10-11 | Invites game with a six-card suit
1m 1M 1N | 2M | M5+, hcp 0-10 | To play
1m 1M 1N | 3N | hcp 13-17 | To play
1m 1M 1N | 2N | hcp 11-12 | Invites game
1m 1M 1N | P | | Content
1m 1M 1N 2om | 3M | M3+, hcp 14 | Three-card support, maximum | conv:nmf
1m 1M 1N 2om | 2M | M3+ | Three-card support, minimum | conv:nmf
1m 1M 1N 2om | 2oM | oM4+ | Four cards in the other major | conv:nmf
1m 1M 1N 2om | 2N | | No help in the majors | conv:nmf
1m 1M 1N 2N | 3N | hcp 14 | Accepts
1m 1M 1N 2N | P | | Declines
1m 1M 2N | 3N | | To play
1m 1N | 3N | hcp 19-21 | To play
1m 1N | 2N | hcp 17-18 | Invites game
1m 1N | 2m | m6+, hcp 11-16 | Six-card suit
1m 1N | P | hcp 11-16 | Content
1m 1N 2N | 3N | hcp 8+ | Accepts
1m 1N 2N | P | | Declines
1m 2N | 3N | hcp 14+ | Accepts
1m 2N | P | | Declines
1m 3N | P | | Content
1m 3m | 3N | hcp 14+, bal | To play | !conv:inverted
1m 3m | P | | Content
1m 2m | 3N | hcp 18-19, bal | To play | !conv:inverted
1m 2m | P | | Content | !conv:inverted

# ================= OUR WEAK TWOS AND PRE-EMPTS
2M | 4M | M3+, hcp 14+ | To play
2M | 4M | M4+ | Raises the pre-empt
2M | 3M | M3+ | Raises the pre-empt; not an invitation
2M | 2N | hcp 16+ | Asks about the weak two | F
2M | P | | Content
2M 2N | 4M | hcp 8-10 | Maximum
2M 2N | 3M | | Minimum
2M 2N 3M | 4M | hcp 18+ | To play
2M 2N 3M | P | | Content
2D | 3N | hcp 16+, bal | To play
2D | 3D | D3+ | Raises the pre-empt
2D | P | | Content
3M | 4M | M2+, hcp 14+ | To play
3X | P | | Content

# ================= THEY INTERFERE AFTER WE OPEN
1X (X) | XX | hcp 10+ | 10 or more points | F
1M (X) | 3M | M4+, hcp 0-9 | Pre-emptive raise
1M (X) | 2M | M3+, hcp 5-9 | Single raise
1X (X) | 1Z | Z4+, hcp 6+ | Four or more cards, 6+ points | F
1X (X) | 1N | hcp 6-9 | 6–9 points
1X (X) | P | | Nothing to say
1X (1N) | X | hcp 10+ | Penalty: 10 or more points
1X (1N) | P | | Nothing to say
1M (1Y) | 4M | M5+, hcp 0-9 | Weak raise to game
1M (1Y) | 3M | M4+, sup 10+, hcp 0-12 | Limit raise
1M (1Y) | 2M | M3+, sup 6-10 | Single raise
1M (1Y) | 2Z | Z5+, hcp 10+, nojump | New suit: five cards, 10+ points. Forcing one round, not to game | F
1M (1Y) | 3N | hcp 13-15, stopopp | To play
1M (1Y) | 2N | hcp 11-12, stopopp | Invites game with a stopper
1M (1Y) | 1N | hcp 7-10, stopopp | 7–10 points with a stopper
1M (1Y) | P | | Nothing to say
1M (2Y) | 4M | M5+, hcp 0-9 | Weak raise to game
1M (2Y) | 3M | M4+, sup 10+, hcp 0-12 | Limit raise
1M (2Y) | 2M | M3+, sup 6-10 | Single raise
1M (2Y) | 3M | M3+, sup 8-10 | Competitive raise
1M (2Y) | X | hcp 8+, umaj4 | Negative double: four cards in the other major | F conv:negdbl
1M (2Y) | 2Z | Z5+, hcp 10+, nojump | New suit: five cards, 10+ points. Forcing one round | F
1M (2Y) | 3N | hcp 13-15, stopopp | To play
1M (2Y) | 2N | hcp 11-12, stopopp | Invites game with a stopper
1M (2Y) | P | | Nothing to say
1m (1Y) | 1Z | Z5+, hcp 6+ | Five or more cards, 6+ points | F
1m (1Y) | X | hcp 6+, umaj4 | Negative double: four cards in each unbid major | F conv:negdbl
1m (1Y) | 1Z | Z4+, hcp 6+ | Four or more cards, 6+ points | F
1m (1Y) | 2Z | Z5+, hcp 10+, nojump | New suit: five cards, 10+ points. Forcing one round | F
1m (1Y) | 3N | hcp 13-15, stopopp | To play
1m (1Y) | 2N | hcp 11-12, stopopp | Invites game with a stopper
1m (1Y) | 1N | hcp 7-10, stopopp | 7–10 points with a stopper
1m (1Y) | 3m | m5+, hcp 10-12 | Limit raise
1m (1Y) | 2m | m5+, hcp 6-9 | Single raise
1m (1Y) | P | | Nothing to say
1m (2Y) | X | hcp 8+, umaj4 | Negative double: four cards in each unbid major | F conv:negdbl
1m (2Y) | 2Z | Z5+, hcp 10+, nojump | New suit: five cards, 10+ points. Forcing one round | F
1m (2Y) | 3N | hcp 13-15, stopopp | To play
1m (2Y) | 2N | hcp 11-12, stopopp | Invites game with a stopper
1m (2Y) | 3m | m5+, hcp 8-11 | Competitive raise
1m (2Y) | P | | Nothing to say

# ================= THEY OPEN
(1X) | 1N | hcp 15-18, bal, stop X | 15–18 points, balanced, with a stopper in their suit
(1m) | 2m | H5+, S5+, hcp 6+ | Michaels: at least five cards in each major | F conv:michaels
(1M) | 2M | oM5+, min5, hcp 6+ | Michaels: five of the other major and a five-card minor | F conv:michaels
(1M) | 2N | C5+, D5+, hcp 6+ | Unusual: at least five cards in each minor | F conv:unusual
(1C) | 2N | D5+, H5+, hcp 6+ | Unusual: diamonds and hearts, at least 5-5 | F conv:unusual
(1D) | 2N | C5+, H5+, hcp 6+ | Unusual: clubs and hearts, at least 5-5 | F conv:unusual
(1X) | X | hcp 18+ | Double: too strong to overcall
(1X) | 1Z | Z5+, hcp 8-17 | Overcall: five or more cards, 8–17 points
(1X) | 2Z | Z6+, hcp 10-17, nojump | Overcall: a six-card suit, 10–17 points
(1X) | 2Z | Z5+, hcp 11-17, good Z, nojump | Overcall: a good five-card suit, 11–17 points
(1X) | 2Z | Z6, hcp 5-10, good Z, jump | Weak jump overcall: a good six-card suit
(1X) | 3Z | Z7+, hcp 5-10, jump | Pre-emptive jump overcall
(1X) | X | hcp 12+, tox | Takeout double: opening values, short in their suit, support for the rest | F
(1X) | P | | Nothing to say
(1X) 1Z | 3Z | Z3+, sup 11-13 | Invites game with support
(1X) 1Z | 2Z | Z3+, sup 6-10 | Single raise
(1X) 1Z | 2N | hcp 12-13, stop X | Invites game with a stopper
(1X) 1Z | 1N | hcp 8-11, stop X | 8–11 points with a stopper
(1X) 1Z | P | | Nothing to say
(1X) 2Z | 3N | hcp 13+, stop X | To play
(1X) 2Z | 3Z | Z3+, hcp 8-11 | Raise
(1X) 2Z | 2N | hcp 10-12, stop X | Invites game with a stopper
(1X) 2Z | P | | Nothing to say
(1X) X | 4M | M4+, hcp 12+ | To play
(1X) X | 3N | hcp 13+, stop X | To play
(1X) X | 2Z | Z4+, hcp 9-11, jump | Jump: invitational, 9–11 points
(1X) X | 3Z | Z4+, hcp 9-11, jump | Jump: invitational, 9–11 points
(1X) X | 2N | hcp 10-12, stop X | Invites game with a stopper
(1X) X | 1N | hcp 6-9, stop X | 6–9 points with a stopper
(1X) X | 1Z | nojump | Forced reply to the double: longest suit, 0–8 points
(1X) X | 2Z | nojump | Forced reply to the double: longest suit, 0–8 points
(1m) 2m | 2H | H>=S | Prefers hearts | conv:michaels
(1m) 2m | 2S | | Prefers spades | conv:michaels
(1M) 2M | 2oM | | Takes the major | conv:michaels
(1M) 2M | 3oM | | Takes the major | conv:michaels
(1M) 2N | 3C | C>=D | Prefers clubs | conv:unusual
(1M) 2N | 3D | | Prefers diamonds | conv:unusual
(1C) 2N | 3H | H>D | Prefers hearts | conv:unusual
(1C) 2N | 3D | | Prefers diamonds | conv:unusual
(1D) 2N | 3H | H>C | Prefers hearts | conv:unusual
(1D) 2N | 3C | | Prefers clubs | conv:unusual
(1X) P | 1N | hcp 11-14, bal, stop X | Balancing: 11–14 points, balanced
(1X) P | 1Z | Z5+, hcp 7-15 | Balancing overcall
(1X) P | 2Z | Z5+, hcp 9-15, nojump | Balancing overcall
(1X) P | X | hcp 9+, tox | Balancing takeout double | F
(1X) P | P | | Nothing to say
(2C) | P | | Stays out of their strong auction
(2X) | 2N | hcp 15-18, bal, stop X | 15–18 points, balanced, with a stopper
(2X) | 2Z | Z5+, hcp 12-17, good Z, nojump | Overcall: a good suit and opening values
(2X) | 3Z | Z5+, hcp 12-17, good Z, nojump | Overcall: a good suit and opening values
(2X) | X | hcp 13+, tox | Takeout double | F
(2X) | X | hcp 19+ | Double: a very strong hand | F
(2X) | P | | Nothing to say
(2X) X | 4M | M4+, hcp 11+ | To play
(2X) X | 3N | hcp 11+, stop X | To play
(2X) X | 2Z | nojump | Forced reply to the double: longest suit
(2X) X | 3Z | nojump | Forced reply to the double: longest suit
(3X) | 3N | hcp 16+, stop X | To play
(3X) | 3Z | Z6+, hcp 12+, nojump | Overcall: a long suit and opening values
(3X) | X | hcp 15+, tox | Takeout double | F
(3X) | P | | Nothing to say
(3X) X | 4M | M4+, hcp 8+ | To play
(3X) X | 3N | hcp 8+, stop X | To play
(3X) X | 3Z | nojump | Forced reply to the double: longest suit
(3X) X | 4Z | nojump | Forced reply to the double: longest suit
(1N) | 2Z | Z6+, hcp 9-14 | Natural overcall on a six-card suit
(1N) | P | | Nothing to say
`;

let cached: Rule[] | null = null;
export function baseRules(): Rule[] {
  if (!cached) cached = parseRules(TEXT);
  return cached;
}
