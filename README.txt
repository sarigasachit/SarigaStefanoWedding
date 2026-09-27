SARIGA & STEFANO — UPDATE 5 LIVING ART 2027

Protected Update 4 baseline retained for the zeroth page and homepage interactions.
New in this build:
- wedding year content corrected to 2027
- Three Days rebuilt as separate 03 / 04 / 05 tabs
- event descriptions open on click
- buffet items shown as a quieter hospitality thread
- selected uploaded art videos integrated as silent living backgrounds
- hidden-page videos are paused; reduced-motion fallback supported
- Creator Mode expanded to edit/reorder/add/delete programme events
- other page titles/kickers/text remain editable
- unique localhost port 8772 avoids loading an older build

Run START_WEBSITE.bat.
Creator password remains: saggu-stefano

Creator update:
- top navigation/sub-page names are now editable in Creator Mode
- sub-page navigation order can be moved up/down
- page titles/kickers/body remain editable in Other Pages


UPDATE 7 — LOCKED APPROVED HOMEPAGE
- The approved homepage image is now the locked baseline and is not altered.
- Top navigation tab names remain editable in Creator Mode.
- Homepage arch menu card number, title, and sub-description are editable in Creator Mode.
- Individual page title, kicker, and body text remain editable.
- Three Days tabs/events remain editable.
- Creator password: saggu-stefano
- This build uses localhost port 8776 to avoid stale older versions.


UPDATE 9 — LOCKED APPROVED HOMEPAGE
- Exact approved homepage PNG copied unchanged into assets/home_locked.png.
- NOTHING is painted, masked, or written over the homepage background.
- Homepage navigation, five arch cards, A Note From Us and A Short Film use invisible click zones only.
- The baked homepage wording is therefore never duplicated.
- Creator Mode continues to edit the interior page content and Three Days content.
- Creator password: saggu-stefano
- Local test port: 8778


BASELINE V6 — FINAL FRESCO
- Approved homepage artwork locked exactly as assets/home_locked.png (1585×992).
- Original-style frescoes and shadow composition approved by user.
- TREASURE is baked into the approved artwork; no patch is used.
- No homepage text overlays are drawn.
- Existing Place / River Retreat information, interior pages, Creator Mode and Three Days content preserved.
- Port: 8783


BASELINE V7 — DEDICATED CREATOR PAGES + VIDEO/SUBTITLES
- Homepage artwork remains byte-for-byte identical to V6.
- Dedicated Creator editor for Love, The Place, The Three Days, Kerala & Beyond, Guest Care, and Treasure.
- Each sub-page title, kicker, body text, video caption, reference text, and reference URL is editable.
- Each sub-page accepts a local video upload and subtitle upload.
- Subtitle uploads support .vtt and .srt; .srt is converted automatically to WebVTT.
- Uploaded videos/subtitles are stored in IndexedDB in the browser and do not overwrite the locked artwork.
- The Place defaults to an empty body and the video caption "Talking Hands of Travancore (1981)".
- Three Days has dedicated text/event editors and day-specific video/subtitle upload.
- Port: 8784


V7.1 — HOMEPAGE FILMS
- V7 remains the baseline architecture.
- Added Creator Mode upload controls for:
  * A Note From Us
  * A Short Film
- Both support video upload plus optional .vtt/.srt subtitles.
- Uploaded homepage films use the same IndexedDB mechanism as V7 sub-page videos.
- Homepage hotspots now open the uploaded film in the existing modal.
- No homepage artwork was altered.
- Port: 8786


V7.2 — KERALA & BEYOND + GUEST CARE
- Continues directly from V7.1 local architecture.
- Homepage artwork remains untouched.
- Kerala & Beyond now includes elegant transparent destination tiles.
- Clicking a destination opens an overlay/sub-window in the same visual language as the homepage films.
- Each destination has editable name, label, travel time, history, things to do, suggested stays, and Maps URL.
- Destinations can be added/removed in Creator Mode.
- Guest Care now has a dedicated editable questionnaire area.
- Paste a Google Form guest URL to show the questionnaire button.
- Paste a Google Forms embed URL to show the form directly inside Guest Care.
- Editable travel, diet/allergy, accessibility/extra-care, visa and private-contact sections.
- Official India visa URL included as an editable starting link.
- Port: 8787


V7.3 — KERALA / BEYOND TRAVEL CABINET
- Built directly on working V7.2.
- Locked homepage artwork remains byte-for-byte unchanged.
- Kerala & Beyond is now deliberately split into two separate sections:
  I. Within Kerala
  II. Beyond Kerala
- Kerala destination windows retain the existing general “Open in Maps” link.
- “What to do” now contains individually editable spot links to Google Maps.
- “Where we would stay” now contains individually editable hotel/resort links to Google Maps.
- Added Kerala tiles including Malampuzha, Kollengode, Nelliyampathy, Wayanad and Munnar & Eravikulam, plus Muziris.
- Beyond section has four journey routes with recommended duration, possible duration and “best for”.
- Clicking a Beyond journey opens a dedicated route window with route description, transport/rail advice and return-to-Europe information.
- Landmark cards inside that journey use the Kerala-card visual language.
- Clicking a landmark opens a second nested detail window with history, clickable things to do, clickable stays, and the unchanged-style general Open in Maps link.
- All journey, landmark, spot and stay content can be added/removed/edited in Creator Mode.
- Konkan & Deccan route includes Kerala → Badami/Aihole/Pattadakal → Hampi → Goa → Mumbai → Ajanta & Ellora.
- Dudhsagar is described as rail scenery rather than a route stop.
- Dravidian Land includes Chettinad, Keeladi & Madurai, Srirangam, the Great Living Chola Temples, Mahabalipuram and Chennai.
- New local port: 8788
