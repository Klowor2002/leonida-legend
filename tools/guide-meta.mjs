// guide-meta.mjs — Leonida Legend: hand-written guide metadata for every trophy.
//
// The verbatim trophy names / grades / official descriptions live in
// TROPHIES.txt (the kit starter list). This module holds ONLY the parts this
// guide adds on top: which roadmap phase a trophy belongs to, how hard it is,
// roughly how long it takes, a one-line tip, a "basis" note saying what the
// guide text rests on, and the guide text itself, written for this guide.
//
// Keyed by trophy name so build-trophies.mjs can merge by exact match and
// fail loudly if a name drifts.

export const PHASE_ORDER = [
  "story",
  "strangers",
  "activities",
  "exploration",
  "combat",
  "partner",
  "grind",
  "platinum",
];

export const PHASE_LABEL = {
  story: "Story",
  strangers: "Strangers & Freaks",
  activities: "Activities & Sports",
  exploration: "Exploration",
  combat: "Combat & Crime",
  partner: "Partner Play",
  grind: "The Long Grind",
  platinum: "Platinum Path",
};

export const GUIDE_META = {
  "Vice Got a Price!": {
    phase: "platinum",
    difficulty: 4,
    time: "Total run",
    tips: "Work the roadmap top to bottom and this unlocks on its own.",
    source: "Official trophy list; platinum wrapper trophy.",
    guide:
      "The platinum is a wrapper: it pops the moment the other 54 trophies are all earned, with no extra task of its own. Plan around the two long poles instead — A Long Road (100% completion) and the grind trophies such as Cunning Stunts and You WAiNKer!. Use the tracker on this page to watch the per-grade counters; when Bronze reads 46/46, Silver 6/6 and Gold 2/2, the next trophy you earn is this one. Nothing on the list is missable, so a relaxed order works: story first, everything else after.",
  },
  "Just Like Paradise": {
    phase: "story",
    difficulty: 1,
    time: "~30 min",
    tips: "Just press start — the opening mission teaches the controls.",
    source: "Official trophy list; opening story mission.",
    guide:
      "Start a new game and play the opening mission, Gone Fishing, from the first cutscene to the last. It is the game's tutorial in disguise: expect short on-rails teaching beats for moving, driving and shooting, each introduced one at a time with on-screen prompts. There are no fail states worth worrying about — if a section goes wrong the checkpoint restarts a few seconds back. The trophy pops at the mission's end card, before free roam opens up. No preparation, collectibles or difficulty setting affect it.",
  },
  "Paradise Lost": {
    phase: "story",
    difficulty: 1,
    time: "~3 h",
    tips: "Follow the letter markers on the map; side content can wait.",
    source: "Official trophy list; story chapter 1.",
    guide:
      "Finish every main mission filed under Chapter 1. Main missions appear as letter or character markers on the map; after each one the next unlocks once you leave the area or a short in-game wait passes — sleeping at a safehouse advances the clock if a marker has not appeared. Chapter 1 is still teaching the world's systems, so take the free weapons and vehicles missions hand you rather than buying your own. The trophy unlocks as the chapter's closing cutscene ends. Side activities do not count toward it and can safely be ignored for now.",
  },
  "T**s Ass Drug Money": {
    phase: "story",
    difficulty: 2,
    time: "~3 h",
    tips: "Buy body armour before each new marker; it is cheap insurance.",
    source: "Official trophy list; story chapter 2.",
    guide:
      "Complete all of Chapter 2's main missions in marker order. The difficulty steps up here: expect longer shootouts and your first multi-stage escapes, so start treating armour and a full weapon wheel as part of the routine before you drive to a marker. If a mission keeps failing at the same beat, drop the difficulty in settings — story trophies do not care which difficulty you finish on. When the final Chapter 2 cutscene plays out, the trophy is yours. As with every chapter trophy, only main missions count; stranger strands and activities are separate lists.",
  },
  "Vice City, Baby!": {
    phase: "story",
    difficulty: 2,
    time: "~3 h",
    tips: "Keep a fast personal vehicle stored for the longer cross-map drives.",
    source: "Official trophy list; story chapter 3.",
    guide:
      "Work through Chapter 3's main missions until the chapter-end cutscene. By now the whole state of Leonida is open and missions start sending you on long drives between counties — a fast car in your garage cuts the dead time down a lot. Chapter 3 also tends to introduce the heavier weapon classes; pick up everything dropped in firefights so your wheel stays stocked for free. Finish the final mission of the chapter and the trophy pops. Nothing here is missable: any mission you skip past in the story flow can be replayed from the menu afterwards.",
  },
  "Top Of The World, Ma": {
    phase: "story",
    difficulty: 3,
    time: "~3 h",
    tips: "Stock max armour and snacks before the chapter finale.",
    source: "Official trophy list; story chapter 4.",
    guide:
      "Complete Chapter 4, the run-up to the endgame. Missions here chain bigger set pieces together — longer wanted-level escapes, more armoured enemies, and less cover in the open sections. Go in prepared: full armour, a stocked weapon wheel and a getaway vehicle you trust. If you are replaying for this trophy after finishing the story, use the mission replay menu; progress counts the same. The trophy unlocks when the chapter's last mission resolves. After this chapter only the final mission stands between you and the gold story trophy.",
  },
  "You Gotta Know When to Get Off": {
    phase: "story",
    difficulty: 3,
    time: "~2 h",
    tips: "The point of no return is signposted — finish side plans before it.",
    source: "Official trophy list; final story mission (gold).",
    guide:
      "Finish the final story mission. Games in this series signpost the point of no return clearly, and this is it: wrap up anything you want done with a particular character setup before you start it, although every trophy on this list stays earnable in the post-story free roam afterwards. The finale is the longest single mission in the game, so bring full armour, your best weapons and patience for several checkpointed stages. When the credits sequence begins, this gold trophy unlocks. Completing it also finishes the story phase of the platinum roadmap.",
  },
  "Trust": {
    phase: "story",
    difficulty: 1,
    time: "~20 min",
    tips: "A short early mission — it arrives as part of the Chapter 1 flow.",
    source: "Official trophy list; named story mission.",
    guide:
      "Complete the story mission Breakfast Run. It is one of the named one-off missions woven into the chapter flow rather than a chapter of its own, so it will appear as a marker during the early game. Play it when it appears: these named missions are short, scripted and built around one set piece each. There is nothing to prepare and nothing extra to collect inside it. If you have already passed it in the story, open the replay menu and finish it from there — the trophy counts a completion from either route.",
  },
  "Break the Bank": {
    phase: "story",
    difficulty: 2,
    time: "~30 min",
    tips: "Heist setup choices are flavour, not difficulty — pick what sounds fun.",
    source: "Official trophy list; named story heist mission.",
    guide:
      "Complete The Cartel Heist, the story's big bank job. Like the heists in earlier games in the series it comes in stages: approach options, a setup or two, then the job itself and the escape. Your approach pick changes the route, not the trophy — choose whichever your current gear supports. During the escape, switch vehicles once your heat peaks; the wanted level is scripted to cool after the final stage. The trophy pops at the mission complete screen. If you are replaying, any approach counts; you do not need to do them all.",
  },
  "Family Matters": {
    phase: "story",
    difficulty: 1,
    time: "~20 min",
    tips: "A character-driven mission; no special gear needed.",
    source: "Official trophy list; named story mission.",
    guide:
      "Complete the story mission Child's Play when its marker appears in the chapter flow. Named missions like this one are self-contained story beats — mostly driving, dialogue and one short action sequence. There are no optional objectives tied to the trophy; finishing the mission on any difficulty and with any outcome inside its scripted beats is enough. Missed it on your first pass? The replay menu lists it once the story has moved past it, and a replayed completion counts exactly the same as the first-time run.",
  },
  "DWNFALL": {
    phase: "story",
    difficulty: 2,
    time: "~25 min",
    tips: "Bring a scoped rifle if you have one; sightlines are long.",
    source: "Official trophy list; named story mission.",
    guide:
      "Complete the story mission Headliners. It sits inside the chapter flow as a named marker mission, so play it when it appears or pick it from the replay list later. Expect a more combat-forward mission than the other named beats — mid-range firefights where a scoped weapon and armour make the difference between a smooth run and checkpoint repeats. The trophy needs only a completion, not a medal or a clean run, so play conservatively and use cover. It unlocks at the mission end card like every other story trophy.",
  },
  "Hi-Jacked": {
    phase: "story",
    difficulty: 2,
    time: "~25 min",
    tips: "You will be back at VCIA for other trophies — learn the layout now.",
    source: "Official trophy list; named story mission at VCIA.",
    guide:
      "Complete VCIA Takedown, the story mission set around the airport. Airport missions in this series mix vehicle and on-foot sections with wide open ground, so keep to cover lines — hangars, parked aircraft, cargo stacks — during the on-foot parts. Finishing it also teaches you the airport's layout, which pays off later for Catch Me If You Can, the unscheduled-departure trophy set in the same place. The trophy pops when the mission completes; a replay-menu completion counts if you already rolled credits on the story.",
  },
  "Snow Storm": {
    phase: "story",
    difficulty: 3,
    time: "~30 min",
    tips: "The toughest named mission — full armour and your best rifle.",
    source: "Official trophy list; named story mission.",
    guide:
      "Complete Operation Savage Glory, the heaviest of the named story missions. Treat it like a mini-finale: go in with full armour, a topped-up weapon wheel and a vehicle you can fight from. The mission strings several combat stages together with thin checkpoint spacing, so the conservative line — cover, Combat Focus for clustered enemies, retreat to re-armour between stages — is the reliable one. Difficulty settings do not affect the trophy, so drop a level rather than stall. Completion by replay counts the same as in-flow.",
  },
  "A Long Road": {
    phase: "platinum",
    difficulty: 5,
    time: "40 h+",
    tips: "The in-game 100% checklist is the law — this page mirrors it.",
    source: "Official trophy list; 100% completion (gold).",
    guide:
      "Reach 100% completion on the in-game counter. This is the longest trophy in the game and the real spine of the platinum: the counter typically folds in the full story, every stranger strand, a set share of activities, races, collectibles, challenges and property ownership. Work from the in-game checklist screen rather than memory — it shows exactly which categories still owe you percentage. Most other trophies on this list are subsets of this counter, so a roadmap-order run (story, strangers, activities, exploration, combat, partner, grind) leaves only the tail of challenges and collectibles for the end. Pace it across sessions; nothing here is missable.",
  },
  "Cunning Stunts": {
    phase: "grind",
    difficulty: 3,
    time: "~6 h",
    tips: "Stunt jumps near your usual routes first; mop up the map later.",
    source: "Official trophy list; stunt count (silver).",
    guide:
      "Land 250 stunts. Stunts are the game's jump and stunt-course challenges scattered across Leonida — ramps, stunt rings and set-piece jumps that register a clean landing. The counter only needs completions, not golds, so a landed stunt at any quality counts. Work them opportunistically: whenever the map shows one near a mission route, take the detour. Save the mop-up for the endgame with a fast bike and a stunt map pass county by county. Failed attempts cost nothing but time, and re-approaching a ramp resets it instantly, so the grind is steady rather than hard.",
  },
  "Master of None": {
    phase: "activities",
    difficulty: 1,
    time: "~1 h",
    tips: "One attempt per activity type is enough — finishing is not required.",
    source: "Official trophy list; activity sampler.",
    guide:
      "Try each type of activity once. The official count is 9 activity types; the game tracks a 'tried' flag the first time you start each one, so you do not need to win or even finish — starting counts. Open the map's activity filter and work the list: a race, a range session, a drone race, a fishing challenge, an arcade cabinet and the rest of the icons the filter shows. If you are ever unsure which types remain, the stats screen lists activities attempted. This is one of the fastest trophies in the game and a good tour of what the side content offers.",
  },
  "The Shootist": {
    phase: "activities",
    difficulty: 4,
    time: "~5 h",
    tips: "Learn each challenge's target pattern before chasing the gold time.",
    source: "Official trophy list; shooting range golds (silver).",
    guide:
      "Earn a gold medal in all 42 Shooting Range challenges. Range challenges test one weapon class at a time against score and time targets, and gold demands near-flawless runs: memorise where targets appear, pre-aim the next spawn while the current one falls, and restart the instant a run goes sloppy — restarts are free and instant. Do a full pass for silvers first so every pattern is familiar, then hunt golds weapon by weapon. Sensitivity settings matter more here than anywhere else in the game; tune them on the range, not in a firefight. The trophy pops when the 42nd gold lands.",
  },
  "Top Fun": {
    phase: "activities",
    difficulty: 3,
    time: "~3 h",
    tips: "A loss still teaches the course — fly it once slow, then race it.",
    source: "Official trophy list; drone races at all locations.",
    guide:
      "Win a Top Fun drone race at every location — 14 in all. Each course is a checkpoint run through a fixed line of gates; the winning trick is line choice, not raw speed: cut inside on the marked corners and keep the drone low where the course dips under structures. Your first run at a new location is reconnaissance — finish it, learn the two or three gates that punish you, then immediately re-run while the line is fresh. Wins are per location, not cumulative, so one victory at each of the 14 sites is the whole job. The tracker in the activities stats shows which locations still owe you a win.",
  },
  "Earn Cash, Not Kudos": {
    phase: "activities",
    difficulty: 2,
    time: "~3 h",
    tips: "They must be DIFFERENT races — repeats do not advance the counter.",
    source: "Official trophy list; race wins.",
    guide:
      "Win 20 different races. The word that matters is 'different': the counter tracks unique race events won, so grinding one easy circuit 20 times does nothing. Leonida's race calendar spans street, off-road, water and air events across the map; open the activities filter and tick them off location by location. Bring the right vehicle class for each series and upgrade it modestly — rival times are tuned for a sensibly upgraded stock vehicle, not a maxed one. If a race keeps beating you, its rivals scale gently with your vehicle, so a slightly slower car can paradoxically make the win easier.",
  },
  "Baited My Tackle": {
    phase: "activities",
    difficulty: 2,
    time: "~30 min",
    tips: "Watch Cal's catches, not your own — beat his best fish, not the clock.",
    source: "Official trophy list; fishing challenge vs Cal.",
    guide:
      "Beat Cal in a fishing challenge. Cal is the game's fishing rival, met through the fishing strand; his challenge is a head-to-head catch-off at a set spot. Fishing resolves as a timing mini-game: cast toward the ripples, hook on the bite prompt, then keep the line tension in the green while reeling. Cal's score is a weight target rather than a fish count, so one heavy catch beats three small ones — stay patient on a big shadow instead of cashing in early tiddlers. If he wins, the challenge re-offers immediately with no penalty; learn his typical total and fish past it.",
  },
  "Stick Fiddler": {
    phase: "activities",
    difficulty: 1,
    time: "~15 min",
    tips: "Any cabinet, any game — pick the shortest one in the arcade.",
    source: "Official trophy list; arcade completion.",
    guide:
      "Complete one arcade game. Arcades and bars across Leonida have playable cabinets; walk up, pay the token fee and play any title through to its completion screen — a finished run, a game over after the final stage, or the cabinet's own 'complete' state all count. This is a participation trophy, not a high-score one, so choose the shortest cabinet you find. It pairs naturally with Master of None, since the arcade counts as one of the nine activity types to try. The trophy pops when you exit the cabinet after a completed game.",
  },
  "Road to Rehabilitation": {
    phase: "strangers",
    difficulty: 1,
    time: "~1 h",
    tips: "Strand missions chain — if the next marker is missing, sleep a day.",
    source: "Official trophy list; Andy stranger strand finale.",
    guide:
      "Complete the final mission of Andy's stranger strand. Stranger strands are chains: meet the character at their map icon, finish their first job, and the next appears after some in-game time passes — sleeping or simply playing other content advances it. Andy's strand ends with a clearly marked final mission; the trophy pops when that finale completes, not before. Strand finales are self-contained and no harder than mid-story missions. If you are cleaning up after the credits, every strand stays available — none of the stranger content in this game is missable.",
  },
  "This Was No Boat Accident": {
    phase: "strangers",
    difficulty: 1,
    time: "~1 h",
    tips: "Kenton's strand starts near the water — bring a boat-friendly route.",
    source: "Official trophy list; Kenton stranger strand finale.",
    guide:
      "Finish Kenton's stranger strand by completing its final mission. Find Kenton's icon on the map to open the chain, then work each job as it unlocks; strand steps sometimes wait on a phone call or a day passing, so check the phone and sleep if a chain seems stalled. The finale is a standard-length mission with no special requirements. Like every strand trophy, only the last mission triggers the unlock — earlier steps are progress, not partial credit. Post-story cleanup is fully supported if you are doing these after the credits.",
  },
  "The Lone Rider": {
    phase: "strangers",
    difficulty: 2,
    time: "~1 h",
    tips: "Vehicle-heavy strand — keep a bike you like in the garage.",
    source: "Official trophy list; Billy stranger strand finale.",
    guide:
      "Complete the final mission for Billy. Billy's strand leans on riding and driving, so the finale expects you to be comfortable on a bike at speed; a garage bike with decent handling upgrades smooths it out. Work the chain from Billy's first map icon, letting in-game days pass between steps when the next marker is slow to appear. The trophy unlocks at the finale's end screen. It is one of the six named stranger finales that together also feed the Strangers & Freaks silver — finishing Billy is progress on two trophies at once.",
  },
  "Strangers & Freaks": {
    phase: "strangers",
    difficulty: 2,
    time: "~8 h",
    tips: "Eight FULL strands — starting eight strangers is not enough.",
    source: "Official trophy list; eight stranger strands (silver).",
    guide:
      "Complete 8 full mission strands for strangers across Leonida. A strand counts only when its final mission is done, so track strands, not first meetings. The six named finales on this list — Andy, Kenton, Billy, Randy, Tyrone and one more of your choice — plus any two others make the eight. Strands unlock across the map as the story opens new areas, and each chain needs in-game time between steps. The in-game checklist shows strand completions; use it to pick your last two. This silver is also a chunk of the 100% counter, so it is never wasted effort.",
  },
  "Supply & Demand": {
    phase: "strangers",
    difficulty: 1,
    time: "~1 h",
    tips: "Standard strand rules: finish the chain, the finale pays the trophy.",
    source: "Official trophy list; Randy stranger strand finale.",
    guide:
      "Complete the final mission for Randy. Open Randy's strand from his map icon and follow the chain through its steps, allowing a day of in-game time between jobs when the next marker has not spawned. The finale is a self-contained mission of ordinary difficulty — no special vehicle, weapon or stat is required. The trophy unlocks on completion. If you are batching stranger clean-up after the story, Randy's strand is one of the six named finales that also count toward the Strangers & Freaks silver trophy.",
  },
  "Spin On This!": {
    phase: "strangers",
    difficulty: 1,
    time: "~1 h",
    tips: "If the chain stalls, check your phone — Tyrone calls, not texts.",
    source: "Official trophy list; Tyrone stranger strand finale.",
    guide:
      "Complete the final mission for Tyrone. Tyrone's strand advances through his map icon and follow-up contact between steps; if the chain seems to stop, play other content for an in-game day and watch for his call. The final mission is the only step the trophy checks, and it is tuned like the other strand finales — a focused, single-set-piece job. Finish it and the trophy pops. As with all stranger content here, the strand remains available after the credits, so there is no way to lock yourself out of it.",
  },
  "Positive Mental Attitude": {
    phase: "exploration",
    difficulty: 1,
    time: "~2 h",
    tips: "Meditation spots sit at scenic high points — take a helicopter for the sweep.",
    source: "Official trophy list; meditation spots.",
    guide:
      "Meditate at every meditation spot across Leonida — 18 in total. Spots are marked by small shrines or markers at scenic locations, usually viewpoints and high ground; walk up and use the prompt, then let the short meditation play out. You do not need to find them in any order, and the stats screen tracks how many you have used. The efficient route is a single endgame sweep with an aircraft, hopping spot to spot; the pleasant route is grabbing each one as story missions take you near it. Either way the 18th meditation unlocks the trophy.",
  },
  "Fair Game": {
    phase: "exploration",
    difficulty: 2,
    time: "~1 h",
    tips: "Bret gives the lead — follow his strand until the unique animal appears.",
    source: "Official trophy list; Bret hunting strand.",
    guide:
      "Hunt the unique animal for Bret. Bret is the hunting contact; his strand builds from ordinary hunts to one specific, unique animal — a named or marked specimen rather than a species. Follow his jobs in order: the unique hunt only opens once his earlier requests are done, and the animal appears at a set location during that mission. Bring a scoped rifle and approach downwind and crouched, as with the game's other hunting. The trophy pops when the unique animal is taken and the strand step resolves — ordinary animal kills elsewhere do not count toward it.",
  },
  "Don't Touch My Deck": {
    phase: "grind",
    difficulty: 3,
    time: "~6 h",
    tips: "Cards hide in interiors you already visit — search shops and bars as you pass.",
    source: "Official trophy list; collectible card sets (silver).",
    guide:
      "Complete 3 full Collectible Card sets. Cards are individual collectibles scattered through interiors and landmarks; a 'set' completes only when every card in its group is found, so this is really three mini-collection hunts. The deck screen in the menu shows set membership and how many of each set you hold — pick the three sets you are already closest to and finish those rather than starting fresh ones. Cards glow faintly and many sit in places missions already take you: counters, back rooms, motel desks. This is a natural endgame mop-up trophy once the map is fully open.",
  },
  "You WAiNKer!": {
    phase: "grind",
    difficulty: 3,
    time: "~5 h",
    tips: "WAiNK spots cluster in Vice City — sweep district by district.",
    source: "Official trophy list; WAiNK locations (silver).",
    guide:
      "Use WAiNK It at 100 locations. WAiNK points are interactive spots — marked installations where the prompt lets you 'WAiNK It' — spread across the state with a heavy cluster in Vice City itself. Each unique location counts once; the stats screen keeps your total. There is no fail state and each interaction takes seconds, so this is a pure sweep trophy: wait until the map is open, then clear district by district so none get stranded. Pair the sweep with other map clean-up (meditation spots, stunt jumps) and the hours overlap instead of stacking.",
  },
  "One Last Thing": {
    phase: "grind",
    difficulty: 2,
    time: "~4 h",
    tips: "Challenges are the short in-world tasks — your stats page lists them by name.",
    source: "Official trophy list; challenge count.",
    guide:
      "Complete 50 Challenges. Challenges are the game's short-form objectives — the named tasks the stats screen tracks across driving, combat, world interaction and activities. Fifty sounds like a grind, but ordinary play banks many of them unnoticed: check the challenge list early so the ones needing a small deliberate push (specific vehicle classes, specific stunt types) get done while you are already in the right place. The counter is completions, not golds. When you are close, the list shows exactly which cheap ones remain — finish those rather than starting long chains.",
  },
  "Hot Together": {
    phase: "partner",
    difficulty: 2,
    time: "~20 min",
    tips: "Raise the 4 stars somewhere open, then break line of sight together.",
    source: "Official trophy list; partner wanted-level escape.",
    guide:
      "With your partner beside you, earn a 4-star wanted level and then lose it completely. 'Partner' means the other protagonist — switch to or collect them first so you are together in the vehicle or on foot as a pair. Build exactly four stars with quick crimes in an open area, then escape properly: break line of sight, swap vehicles out of sight, and stay hidden until the stars drain. The trophy checks the escape, not the crime spree, so the moment the wanted level clears with your partner still with you, it pops. Doing it in a fast car near tunnels or a multi-storey car park makes the lose-them half simple.",
  },
  "Retail Therapy": {
    phase: "partner",
    difficulty: 3,
    time: "~30 min",
    tips: "Pick three small shops on one street so the chain stays tight.",
    source: "Official trophy list; partner shop-robbery chain.",
    guide:
      "Rob 3 shops back-to-back with your partner without losing your wanted level in between. The chain is the hard part: the wanted level must stay alive from the first robbery to the third, so dawdling until the stars fade breaks the run. Plan the route first — three small stores on the same stretch of road, car parked facing the exit, partner with you. In each shop, aim at the clerk, grab the till cash and leave fast; do not stop to fight the police, just keep moving to the next target. When the third till empties and the chain completes, the trophy unlocks — then lose the heat however you like.",
  },
  "Whip It Good": {
    phase: "exploration",
    difficulty: 1,
    time: "~3 h",
    tips: "Every new vehicle you sit in counts — steal variety, not duplicates.",
    source: "Official trophy list; vehicle discoveries.",
    guide:
      "Discover 100 vehicles. A vehicle is 'discovered' the first time you get in and drive it, and the game keeps the tally in the stats screen. One hundred sounds like a lot until you realise ordinary play covers most of it: missions, thefts and test drives all count. Speed it up deliberately by treating every parking lot as a buffet — take the model you have not sat in yet, drive ten metres, move on. Airports, docks and rich districts spawn the exotics that streets never show. If the counter stalls in the 90s, the vehicles page shows silhouettes of what is still missing.",
  },
  "Gunslinger": {
    phase: "combat",
    difficulty: 3,
    time: "~30 min",
    tips: "Five enemies, one activation — set the ambush up before you trigger it.",
    source: "Official trophy list; Combat Focus multi-kill.",
    guide:
      "Take down 5 enemies in a single use of Combat Focus, the game's slow-time combat ability. The trick is staging: you need five hostiles alive, close together and in your line of fire before you activate. Gang hideouts, illegal operations and mid-story firefights all offer clusters — walk in, let them group on your position, then trigger Focus and work left to right with a high-capacity weapon. Headshots drop targets fastest inside the window. If you fall short, the ability recharges by dealing damage, so a second attempt is never far away. The trophy pops on the fifth takedown inside one activation.",
  },
  "Catch Me If You Can": {
    phase: "combat",
    difficulty: 2,
    time: "~20 min",
    tips: "Steal a plane and simply fly away — that is the whole trophy.",
    source: "Official trophy list; VCIA departure.",
    guide:
      "Make an unscheduled departure at VCIA, the airport. In plain terms: get into an aircraft on the airfield and take off without it being part of a mission. Trespassing on the runway earns a wanted level, so move with purpose — drive straight to a parked plane or helicopter, board it and climb out before the response pins you down. Any aircraft counts and you do not need to escape the wanted level afterwards, only to get airborne. You learned this layout during the VCIA Takedown story mission; put it to use. The trophy unlocks as the wheels leave the ground.",
  },
  "Challenging Tank": {
    phase: "combat",
    difficulty: 3,
    time: "~30 min",
    tips: "You do not have to win pretty — survive the Rhino encounter and finish it.",
    source: "Official trophy list; Rhino encounter.",
    guide:
      "Deal with the Rhinos — the game's tanks. Rhino encounters arrive at high wanted levels and during certain late-game operations: the tank is slow, nearly immune to bullets, and kills you in one or two shells if you stand in the open. The reliable answers are explosives (sticky charges, RPG-class weapons), heavy vehicles of your own, or simply breaking away and letting the encounter end — read the moment: where a mission spawns one, destroying or disabling it is the objective; in free roam, escaping it counts as dealing with it once the encounter resolves. Keep moving laterally and never duel it head-on in a car you care about.",
  },
  "Sneakthief": {
    phase: "combat",
    difficulty: 3,
    time: "~20 min",
    tips: "Undetected means no alarm — case the store, enter quiet, leave quieter.",
    source: "Official trophy list; stealth jewellery robbery.",
    guide:
      "Rob a jewelry store without being detected. Detection is the only rule: no alarm, no clerk panic call, no wanted level during the job. Go at a quiet hour, wear nothing that draws attention, and enter calmly. Inside, the smash-and-grab must stay controlled — take the cases, keep any clerk covered so nobody reaches an alarm, and walk out rather than sprint. The moment you are in your car with the take and no wanted level ever appeared, the trophy unlocks. If an attempt goes loud, leave and let the store reset; a fresh quiet attempt is faster than salvaging a blown one.",
  },
  "Maximum Withdrawal": {
    phase: "combat",
    difficulty: 4,
    time: "~2 h",
    tips: "Vault jobs are the endgame robbery — armour, crew prep, exit car staged.",
    source: "Official trophy list; bank vault robberies (silver).",
    guide:
      "Rob 5 bank vaults and escape — five separate, successful vault jobs. Bank vaults are the heavyweight robberies: cased entrances, a drilled or breached vault, a big take and a serious police response on the way out. Prepare like a heist every time: full armour, your best weapons, and a fast, anonymous car staged a block away facing the escape route. The escape half is where runs die, so plan it before you go in — tunnels, car parks and vehicle swaps beat open-road chases. Only completed robberies with a clean getaway count; a busted or killed finish does not. Five escapes bank the silver.",
  },
  "A Classic Blitz Play": {
    phase: "combat",
    difficulty: 2,
    time: "~20 min",
    tips: "Block the truck, breach the back doors, be gone before backup lands.",
    source: "Official trophy list; armoured truck robbery.",
    guide:
      "Rob an armored truck and escape. Armored trucks run fixed routes and appear on the map as they move through the city. Stop one by blocking it with a heavy vehicle, then breach the rear doors — explosives or sustained fire on the doors do it — and grab the cash inside. The crew will fight and backup arrives quickly, so the whole job should take under a minute: doors, cash, car, gone. The trophy needs the escape, so once the money is in hand stop fighting and drive. Lose the wanted level and it pops. Trucks respawn on their routes, so a failed attempt just means waiting for the next one.",
  },
  "The Goodtime State": {
    phase: "exploration",
    difficulty: 2,
    time: "~4 h",
    tips: "Areas register as you enter them — a full-map road trip finishes this.",
    source: "Official trophy list; all areas of Leonida.",
    guide:
      "Explore all of Leonida — all 52 areas. An area counts as explored when you physically enter it; the map fills in as you go, and the stats screen shows your area count. Story play covers most of the map naturally, which leaves a mop-up list of outlying districts, islands and rural corners. The clean finish is a deliberate grand tour at the endgame: aircraft for the islands and far coast, a fast car for the inland towns, checking the count after each stop so no single missed pocket survives. When the 52nd area registers, the trophy unlocks.",
  },
  "Pest Control": {
    phase: "combat",
    difficulty: 3,
    time: "~3 h",
    tips: "One operation per gang — nine gangs, nine hits, any order.",
    source: "Official trophy list; gang operations.",
    guide:
      "Rob an Illegal Operation belonging to each gang — there are 9 gangs, so this is nine targeted hits. Gang operations appear as gang-coloured territory on the map once discovered: businesses, stash sites and fronts. You only need one operation per gang, and it must be robbed, not just visited — go in, take what the operation holds and get out. Work gang by gang so none are missed; the stats or map filter shows which gangs you have already hit. These sites are defended, so treat each like a small stronghold: scout, strike, leave. The ninth gang's operation completes the set.",
  },
  "In The Beginning…": {
    phase: "exploration",
    difficulty: 1,
    time: "~10 min",
    tips: "Ocean Beach, a bar with a view, one cocktail. That is the trophy.",
    source: "Official trophy list; Ocean Beach cocktail.",
    guide:
      "Enjoy a cocktail with a view on Ocean Beach. Head to the Ocean Beach strip in Vice City and find one of the beachfront bars or hotel terraces overlooking the water. Order a cocktail at the bar and let the drinking animation play out — the 'with a view' part is about the location, so an ocean-facing spot on the strip is what counts, not an inland bar. It costs a few in-game dollars and takes a minute. This is a deliberate breather trophy; if it does not pop at the first bar, try the next terrace along the beachfront.",
  },
  "Capital Offense": {
    phase: "combat",
    difficulty: 1,
    time: "~10 min",
    tips: "Steal a showroom car and drive it through the glass. Classic.",
    source: "Official trophy list; showroom escape.",
    guide:
      "Smash your way out of a vehicle showroom in classic style. Go to one of the city's vehicle showrooms — the glass-fronted dealerships — get into one of the display cars and drive it straight out through the storefront glass. No purchase, no mission, no wanted-level requirement: the trophy is the act itself. Pick a car with some weight to it so the glass definitely breaks, aim at the middle of the window line, and do not slow down. It unlocks as you burst out onto the street. The wanted level afterwards is your own problem to enjoy.",
  },
  "Let’s Go Bowling": {
    phase: "activities",
    difficulty: 1,
    time: "~15 min",
    tips: "Play a game at the Kolt & Associates alley — follow-through included.",
    source: "Official trophy list; bowling alley activity.",
    guide:
      "Play bowling at the Kolt & Associates' bowling alley — the trophy's wording asks for a 'follow-through', which is simply playing the bowling activity there properly: step up, bowl your frames at that specific alley. Other lanes in other places do not count; it has to be Kolt & Associates. Bowling plays as a simple aim-and-release timing game, and your score is irrelevant to the trophy. It also registers bowling as one of the activity types for Master of None if you have not tried it yet. Finish the game and the trophy is yours.",
  },
  "Personal Best": {
    phase: "partner",
    difficulty: 1,
    time: "Story beat",
    tips: "A partnership moment that arrives through play — keep both protagonists active.",
    source: "Official trophy list; partnership moment.",
    guide:
      "Described only as 'a partnership with mass appeal', this is one of the list's deliberately cryptic entries: a scripted-feeling partner moment rather than a grind. Trophies worded like this in the series unlock at a specific shared moment between the two protagonists — a scene, photo or joint activity the game flags as a partnership beat. The practical advice is simple: keep playing both characters, do the partner activities when they are offered, and do not skip shared scenes. If it has not popped by the credits, it is tied to a repeatable partner activity — work the partner list in free roam and it will surface. Nothing about it is missable.",
  },
  "Actions Speak Louder": {
    phase: "grind",
    difficulty: 3,
    time: "~8 h",
    tips: "PSN tracks the choice count to 500 — make every dialogue choice count.",
    source: "Official trophy list; tracked choice count (500).",
    guide:
      "Make choices — the PlayStation tracker counts them, up to 500. This is a cumulative counter over every decision the game offers: dialogue picks, approach choices, spare-or-fight outcomes, purchase and interaction decisions. Five hundred is far more than one story run offers, so this trophy is built for post-game life: activities, stranger replays, robberies and world interactions all feed it. Check the PSN tracker percentage rather than guessing — it is the authoritative counter. Play broadly, choose actively instead of letting prompts time out, and the count climbs steadily. It is a marathon, not a wall.",
  },
  "Bad Luck, I Guess": {
    phase: "grind",
    difficulty: 1,
    time: "Opportunistic",
    tips: "Fail something small on purpose, then succeed at it straight after.",
    source: "Official trophy list; second-attempt success.",
    guide:
      "'Second time's the charm': succeed at something on your second try after failing it once. The cleanest deliberate route is any repeatable scored activity — a race, a range challenge, a stunt: fail it once (a loss or a quit-out both register), then immediately re-run and succeed. The trophy checks the pattern, not the activity, so the smallest repeatable task in the game is the fastest trigger. Most players earn this accidentally long before they go looking for it; if your tracker shows it missing late in the run, manufacture it in two minutes at the shooting range.",
  },
  "The Truth Is Out There": {
    phase: "exploration",
    difficulty: 1,
    time: "Opportunistic",
    tips: "Witness something strange — Leonida's swamps at night are a good bet.",
    source: "Official trophy list; strange sighting.",
    guide:
      "'What the hell just happened?' — witness one of the game's strange events. Leonida hides scripted oddities in its out-of-the-way places: lights over the swamp, odd figures at the map's edges, encounters the game never explains. These are location-and-time triggers rather than random luck, and rural areas at night are where they concentrate. Exploration play (all 52 areas, meditation spots, hunting) puts you in the right places; keep free-roaming after dark in the wild counties and one will fire in front of you. The trophy pops the moment the event registers — no interaction needed beyond being there.",
  },
  "Ten Pin": {
    phase: "combat",
    difficulty: 2,
    time: "~15 min",
    tips: "Melee drive-by: swing from the car window as you pass a pedestrian target.",
    source: "Official trophy list; melee drive-by knockdown.",
    guide:
      "Knock someone down with a melee drive-by — 'bowl 'em over'. In a vehicle, your character can swing a melee weapon out of the window while driving; connect with a person at low speed so the hit lands as a knockdown rather than a run-over. A gang member or hostile is the sporting target, and doing it near an illegal operation gives you both targets and a quick exit. The timing is the only skill involved: start the swing just before you reach them. One clean knockdown is the whole trophy. Expect a wanted level if witnesses are around — drive away and forget it.",
  },
  "Dime on the Dollar": {
    phase: "grind",
    difficulty: 3,
    time: "~5 h",
    tips: "Marked Bills come from robberies — feed them to contacts steadily.",
    source: "Official trophy list; money laundering total.",
    guide:
      "Earn $250,000 laundering Marked Bills through your contacts. Marked Bills are the hot money some robberies pay in — they cannot be spent raw; they must pass through your laundering contacts, who take time and return clean cash. The trophy counts the clean total earned, so this is a pipeline to keep running all game: rob, bank the marked take with a contact, collect when it clears, repeat. Bigger scores (vault jobs especially) feed it fastest. The stats screen tracks your laundered total; when it crosses $250,000 the trophy unlocks. Start the habit early and it finishes quietly alongside the robbery trophies.",
  },
  "Treat Yo Self": {
    phase: "grind",
    difficulty: 1,
    time: "Across the run",
    tips: "Spend $100,000 across all shops — your normal upgrades nearly cover it.",
    source: "Official trophy list; total shop spending.",
    guide:
      "Spend $100,000 across all shops, cumulatively. Every till counts: weapons, ammunition, armour, clothes, vehicle parts, food, property furnishing where it applies. A normal platinum run spends most of this without trying — full weapon upgrades and a few garage builds add up quickly — so check your spent total in the stats before grinding anything. If you are short late in the game, the painless top-up is ammunition and armour restocks plus vehicle customisation on cars you actually drive. Money is plentiful by the endgame; this is a spending trophy, not an earning one, so enjoy it.",
  },
  "Little Boxes": {
    phase: "grind",
    difficulty: 2,
    time: "~2 h",
    tips: "All 8 garage properties — buy them as cash allows, cheapest first.",
    source: "Official trophy list; garage property ownership.",
    guide:
      "Purchase all garage properties — 8 in total, spread across Leonida. Garages are bought from the property market (the in-game real-estate site or the sign at the property itself) and each one also expands your vehicle storage, which Whip It Good and the race trophies quietly appreciate. Prices vary by district; buy cheapest-first as your robbery income grows so the set completes steadily rather than in one endgame splurge. The map's property filter shows what you own and what is still for sale. The eighth purchase unlocks the trophy — and garages also count toward the 100% completion counter.",
  },
  "On the Spot": {
    phase: "exploration",
    difficulty: 2,
    time: "~1 h",
    tips: "Register vehicles you already drive — ten registrations, any ten.",
    source: "Official trophy list; Scooter Bros app registrations.",
    guide:
      "Register 10 vehicles to the Scooter Bros app. The app is the in-game vehicle registry on your phone: when you are in a vehicle you own or have just taken, open the app and register it — each unique vehicle registered adds one to the counter. Ten is a small number against a full playthrough; the only trap is forgetting, since vehicles you merely drive without registering do not count. Make it a habit from the first hour: new car, open phone, register, drive on. The tenth registration unlocks the trophy, and your registered list doubles as a handy record of your collection.",
  },
};
