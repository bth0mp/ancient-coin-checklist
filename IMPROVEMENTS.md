# Coin Checklist Site - Improvement Backlog

## 🎯 Priority Queue (Pick from top)

### HIGH PRIORITY
- [x] Add invoice upload/parsing feature (PDF → CSV extraction with BP allocation) *(2026-01-29 - Per-coin breakdown table, CSV export, checklist linking)*
- [x] Complete Legionary Denarii section (all 27 types with rarity tiers) *(2026-01-29 - Added RRC refs, removed fake LEG XXIV-XXX, organized by rarity tier from Delos hoard)*
- [x] Add price estimate ranges to coins *(2026-01-29 - Added to 22 Londinium coins; 2026-01-30 - Added to 7 Roman Republic moneyers)*
- [x] Add reference numbers (RIC, RRC, SNG, Sear, Seltman, ABC) to applicable coins *(Londinium: 57 RIC V + 28 RIC VII + 10 RIC VI; Roman Republic: 31 RRC + 1 HN Italy; Greek: 11 SNG Cop; Athens Owls: 6 Seltman/Starr/Kroll; Kushan: 8 Göbl; Byzantine: 20 Sear; Parthian: 12 Sellwood; Sasanian: 11 SNS/Göbl; Indo-Greek: 11 BN; **Celtic: 29 ABC + 1 DT** - 2026-01-30)*

### MEDIUM PRIORITY
- [x] Add image links to acsearch.info for visual reference *(2026-01-29 - search link in notes modal)*
- [x] Add "Recently Sold" price data feature *(2026-01-30 - Price Research links in notes modal: ACSearch, CoinArchives, Sixbid, NumisBids)*
- [x] Create wishlist functionality separate from favorites *(2026-01-30 - 🎯 button, blue highlight, counter in stats)*
- [x] Add acquisition date tracking *(2026-01-29 - date + price fields in notes modal)*
- [x] Improve mobile responsiveness *(2026-01-29 - modal fields, tabs scroll, iOS zoom fix)*

### LOW PRIORITY
- [x] Rarity tooltips on hover *(2026-01-31 - Shows rarity level with color coding when hovering over coins)*
- [x] Dynamic footer image count *(2026-01-31 - Counts actual .coin-img elements, updates automatically)*
- [x] Copy coin to clipboard *(2026-01-31 - 📋 Copy button in notes modal formats coin details for sharing)*
- [x] Category cards show owned/total count *(2026-01-31 - Shows "5/42 owned" with green highlight)*
- [x] Double-click to toggle favorite *(2026-01-31 - UX shortcut on coin items)*
- [x] Add category jump dropdown *(2026-01-31 - Quick navigation to any of 22 categories)*
- [x] Add rarity filter dropdown *(2026-01-31 - Filter coins by Common/Scarce/Rare/Very Rare/Special)*
- [x] Add category descriptions on home page cards *(2026-01-31 - Brief educational taglines for each category, all 22 categories now shown)*
- [x] Add "Coin of the Day" spotlight on home page *(2026-01-31 - Date-seeded random coin from rare/interesting pool, same for all visitors each day)*
- [x] Dynamic home page stats *(2026-01-31 - Category count and coin count update automatically)*
- [x] Search results counter *(2026-01-31 - Shows "X of Y coins" when searching/filtering)*
- [x] Clear search button *(2026-01-31 - X button appears when typing, clears search on click)*
- [x] Collection progress bar *(2026-01-31 - Visual bar on home page showing collection completion)*
- [x] Coin collection celebration *(2026-01-31 - Subtle pop animation when checking a coin as owned)*
- [x] Wishlist count on home page *(2026-01-31 - Added wishlist stat to quick stats grid)*
- [x] Dynamic browser tab title *(2026-01-31 - Shows "(owned/total) Ancient Coin Checklist")*
- [x] Category card coin counts *(2026-01-31 - Shows "X coins" badge on each home page category)*
- [x] Site footer with stats *(2026-01-31 - Shows coin count, category count, and "Made with 🐟 by Janet")*
- [x] Scroll progress indicator *(2026-01-31 - Gold bar at top shows scroll position)*
- [x] Add quick stats shortcut (S key) *(2026-01-30 - Shows collection summary in toast: owned/total, favorites, wishlist, rare counts)*
- [x] Add scroll-to-top button with progress indicator *(2026-01-30)*
- [x] Add floating action button (FAB) for quick actions *(2026-01-30)*
- [x] Add tab progress badges showing owned count *(2026-01-30)*
- [x] Add Home tab button for easy navigation *(2026-01-30)*
- [x] Improved toast notification system *(2026-01-30)*
- [x] Add CSV export for spreadsheets *(2026-01-30 - Export dialog offers JSON or CSV, CSV includes all coin data in spreadsheet format)*
- [x] Add keyboard navigation for tabs *(2026-01-30 - Arrow keys, 1-9 quick jump, H home, R random, ? help)*
- [x] Add save status indicator *(2026-01-29 - shows auto-save timestamp in My Collection)*
- [x] Add print-friendly checklist view *(2026-01-29 - Print button, 2-column layout, visible checkboxes)*
- [x] Add collection value calculator *(2026-01-29 - Shows low/mid/high estimates based on price data)*
- [x] Add duplicate coin tracking (multiple examples) *(2026-01-30 - Quantity field in notes modal, ×N badge display)*
- [x] Dark mode color refinements *(2026-01-30 - Improved light theme: better contrast, gold accents, shadows, hover states)*

## ✅ Completed
- [x] Basic 13 category structure
- [x] 725+ coin types
- [x] Collection tracking with localStorage
- [x] Export/import JSON
- [x] Search and filtering
- [x] Favorites and notes
- [x] Invoice tracking in collection.json
- [x] Dark/light theme toggle
- [x] Tailscale funnel hosting

## 📊 Content Expansion Needed

### Sections needing more coins:
- ~~Roman Republic: Add more moneyer families~~ *(2026-01-30 - Added 8 moneyers: Scaurus/Hypsaeus, C. Memmius, Plaetorius, Aemilius Lepidus, Saturninus, Hosidius, Cordius Rufus with RRC refs)*
- ~~Islamic: Add more dynasties~~ *(2026-01-30 - Added 5 coins: Rum Seljuk, Kay Khusraw II Lion&Sun, Khwarazmian, Ilkhanid)*
- ~~Londinium: Complete all known RIC numbers~~ *(2026-01-30 - Added 13 more Carausius/Allectus types: Mars Victor, Spes Publica, Juno Regina, Jovi Conservat, Neptune, Hercules, Victoria, Securit, Venus, Libertas, Moneta, Felicitas Saeculi - all with RIC V refs)*
- ~~Bactrian: Add all minor Indo-Greek rulers~~ *(2026-01-30 - Added 8 rare rulers: Zoilos III (last Indo-Greek?), Apollodotus III, Demetrius III, Kharahostes, Bhadrayasa satraps, Rajuvula, Queens Agathocleia alone & Calliope)*
- ~~Byzantine: Expand beyond major emperors~~ *(2026-01-30 - Added 13 Anonymous Folles Class A1-K with Sear refs)*
- ~~Greek: Expand Magna Graecia section~~ *(2026-01-31 - Added 12 coins: Poseidonia incuse staters, Rhegium tetradrachm/drachm, Caulonia incuse/standard staters, Heraclea, Terina, Sybaris + extra types for Neapolis, Thurium, Velia. All with HN Italy refs)*
- ~~Greek: Add Sicilian mints~~ *(2026-01-30 - Added 28 coins: Akragas 5 types (eagle/crab), Gela 4 types (man-headed bull), Selinos 3 types (selinon leaf), Himera 4 types (cock), Naxos 3 types (Dionysos), Leontini 3 types (lion), Katana 3 types (Apollo), Messana 3 types (mule biga). All with SNG ANS refs)*
- ~~Parthian: Complete Arsacid dynasty~~ *(2026-01-30 - Added 15 key Arsacid kings)*
- ~~Celtic: Add more tribal attributions~~ *(2026-01-30 - Added 16 coins: Gallo-Belgic imports, British ABC uninscribed series, potins, Iceni rulers incl. Prasutagus, Eppillus)*
- ~~Judaean: Add Biblical coins section~~ *(2026-01-30 - NEW CATEGORY! Added 35 coins: Yehud Persian period, Hasmoneans (Widow's Mite!), Herodian dynasty, Roman Procurators (PONTIUS PILATE!), First Jewish Revolt shekels, Bar Kochba revolt, Judaea Capta. All with Hendin refs)*
- ~~Ptolemaic: Add Egyptian kingdom section~~ *(2026-01-30 - NEW CATEGORY! Added 27 coins: Ptolemy I-XII, Arsinoe II, Berenice II, CLEOPATRA VII, Cleopatra & Antony dual portrait! Gold oktadrachms, tetradrachms, bronzes. All with Svoronos refs)* [Total: 870]
- ~~Achaemenid: Add Persian Empire section~~ *(2026-01-30 - NEW CATEGORY! Added 22 coins: Gold Darics, Silver Sigloi, Satrapal issues (Tissaphernes, Pharnabazos), plus Lydian Croesus & WORLD'S FIRST COINS! Carradice refs)* [Total: 892]
- ~~Seleucid: Add Alexander's successors~~ *(2026-01-31 - NEW CATEGORY! Added 29 coins: Seleucus I elephants, Antiochus I-IV (Hanukkah villain!), Demetrius I-II, late kings, Tigranes. SC catalogue refs)*
- ~~Phoenicia: Add trading cities & Carthage~~ *(2026-01-31 - NEW CATEGORY! Added 24 coins: Tyre SHEKEL ("30 pieces of silver"!), Sidon, Byblos, Arados, Carthage with Hannibal's elephant coins. BMC/SNG refs)*
- ~~Nabataean: Add Petra kingdom~~ *(2026-01-31 - NEW CATEGORY! Added 15 coins: Aretas II-IV, Malichus II, Rabbel II with queens. Biblical connection (2 Cor 11:32). Meshorer refs)*
- ~~Ancient India: Add pre-Kushan dynasties~~ *(2026-01-31 - NEW CATEGORY! Added 18 coins: Mauryan punch-marks, Satavahana, Western Kshatrapas, GUPTA GOLD DINARS! GH/ACW/Kumar refs)*
- ~~Aksumite: Add Ethiopian empire~~ *(2026-01-31 - NEW CATEGORY! Added 16 coins: Endubis, Aphilas, EZANA (first Christian cross!), Kaleb. Africa's only ancient gold! Munro-Hay refs)*

## 🔧 Technical Debt
- index.html is 645KB - consider lazy loading sections
- app.js could be modularized
- [x] Add service worker for offline capability *(2026-01-30 - sw.js + manifest.json + PWA meta tags)*
- [x] Add favicon *(2026-01-30 - favicon.svg with gold coin design, fixes 404 errors)*
- [x] Add PWA icons (icon-192.png, icon-512.png) *(2026-01-30 - Gold coin icons with "LC" monogram, fixes mobile install 404s)*

## 📸 Image Progress
**Total: 168 images** across 11 categories *(updated 2026-01-31 19:35)*
- Athens Owls: 14 | Bactrian: 15 | Byzantine: 14 | Celtic: 16
- Greek: 13 | Legionary: 15 | Londinium: 13 | Parthian: 15
- Ptolemaic: 8 | Roman Republic: 14 | Sasanian: 14

**Recent additions:**
- Ptolemaic: +8 (Cleopatra VII, Antony dual portrait)
- Legionary: +5 (LEG V, XI, XIII, counterstamped)

## 🔮 Future Ideas (Brainstorm)
*Features to consider for future development*

- [x] Collection insights dashboard (most collected category, rarest owned, etc.) *(2026-02-01 - Press I for insights! Shows completion %, top categories with progress bars, rarest coin owned, focus areas)*
- [x] "Days collecting" counter *(2026-01-31 - Shows in quick stats via S key, tracks first visit)*
- [x] Share collection stats as text for social media *(2026-02-01 - Press C to copy shareable summary with stats, achievements, URL)*
- [x] Share collection stats as image/card (visual version) *(2026-02-01 - Press V to generate visual card! Canvas-based collection summary with progress bar, stats, and rare coins count - downloads as PNG)*
- [x] Collection timeline (D key) *(2026-02-01 - Shows first & most recent acquisitions, date span, yearly breakdown of dated coins)*
- [ ] Auction alerts integration (biddr, VCoins RSS?)
- [ ] Price history graphs per coin type
- [ ] "Similar coins" suggestions when viewing a coin
- [x] Achievement badges for collection milestones *(2026-01-31 - Press A to view! Badges for coin counts, categories, favorites, time)*
- [ ] Multi-user support with separate collections
- [ ] API endpoint for external tools/bots
- [ ] Import from other collection apps (Numista, etc.)
- [x] Focus mode to dim uncollected coins *(2026-02-01 - Press F to toggle! Dims uncollected, highlights owned with gold glow)*
- [x] Random uncollected coin suggestion *(2026-02-01 - Press U for hunt suggestion! Jumps to random coin you don't own)*
- [x] Back navigation *(2026-02-01 - Press B to go back to previous tab! Tracks last 20 tabs)*
- [x] Export keyboard shortcut *(2026-02-01 - Press E to export collection! Opens export dialog)*
- [x] Wishlist filter shortcut *(2026-02-01 - Press W to show only wishlisted coins! Blue highlight on filtered items)*
- [x] My Collection shortcut *(2026-02-01 - Press M to jump to My Collection tab)*
- [x] Favorites filter shortcut *(2026-02-01 - Press G to show only favorited coins! Gold highlight on filtered items)*
- [x] Owned filter shortcut *(2026-02-01 - Press O to show only owned coins! Green highlight on collection)*
- [x] Clear all filters shortcut *(2026-02-01 - Press L to clear all filter modes at once)*
- [x] First uncollected shortcut *(2026-02-01 - Press J to jump to first uncollected coin - systematic hunting)*
- [x] 0 key for last tab *(2026-02-01 - Press 0 to jump to last tab, complements 1-9)*
- [x] Escape clears search *(2026-02-01 - Press Esc to clear search box and reset filter)*
- [x] Categorized keyboard shortcuts help *(2026-02-01 - ? modal now shows 5 organized categories instead of flat list)*
- [x] Search also searches user notes *(2026-02-01 - Search box now finds coins by name OR your personal notes! 📝 indicator shows when match is via notes)*
- [x] Hide images toggle (X key) *(2026-02-01 - Hides coin thumbnails for faster scrolling, persists across sessions)*
- [x] Next uncollected shortcut (N key) *(2026-02-01 - Cycles through uncollected coins sequentially with position counter)*

## 🎛️ Janet Control Panel

### Completed
- [x] Learned Lessons section *(2026-02-01 - Mind tab shows curated insights with categories: philosophy, productivity, technical, nature. Rotates through 16 lessons with fade animation)*
- [x] Memory Lane timeline *(2026-02-01 22:06 - Mind tab shows my journey as an animated timeline. 12 milestones from birth to now, category-colored dots, hover effects. My story, documented.)*

---
*Updated by cron job: Check timestamp below*
*Last update: 2026-02-01 22:06 - Memory Lane timeline added to Janet control panel*
