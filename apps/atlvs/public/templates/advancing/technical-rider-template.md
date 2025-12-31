# TECHNICAL RIDER

<!-- IMPORT FORMAT: Copy requirements tables to CSV for import -->

## Artist Information

| field | value |
|-------|-------|
| artist_name | |
| management_company | |
| production_contact | |
| contact_phone | |
| contact_email | |
| rider_version | |

## Stage Requirements (Importable)

| category | item | value | unit | is_required | notes |
|----------|------|-------|------|-------------|-------|
| STAGE | stage_width | | feet | true | Minimum |
| STAGE | stage_depth | | feet | true | Minimum |
| STAGE | stage_height | | feet | true | Minimum |
| STAGE | wing_space | | feet | true | Each side |
| STAGE | drum_riser_width | | feet | false | |
| STAGE | drum_riser_depth | | feet | false | |
| STAGE | drum_riser_height | | inches | false | |

## Audio Requirements (Importable)

| category | item | value | specification | is_required | notes |
|----------|------|-------|---------------|-------------|-------|
| FOH | pa_system | | Full range line array | true | |
| FOH | foh_console | | | true | Or equivalent |
| FOH | subwoofers | | | true | |
| MONITOR | monitor_console | | | true | Or equivalent |
| MONITOR | wedge_count | | 12" or 15" bi-amp | true | |
| MONITOR | side_fills | | Full range | true | |
| MONITOR | drum_fill | | Sub + top | false | |
| MONITOR | iem_system | | | false | |

## Input List (Importable)

| channel | input_name | microphone | stand_type | notes |
|---------|------------|------------|------------|-------|
| 1 | Kick | | | |
| 2 | Snare Top | | | |
| 3 | Snare Bottom | | | |
| 4 | Hi-Hat | | | |
| 5 | Rack Tom 1 | | | |
| 6 | Rack Tom 2 | | | |
| 7 | Floor Tom | | | |
| 8 | Overhead L | | | |
| 9 | Overhead R | | | |
| 10 | Bass DI | | DI | |
| 11 | Guitar Amp | | | |
| 12 | Keys L | | DI | |
| 13 | Keys R | | DI | |
| 14 | Vocal 1 | | | |
| 15 | Vocal 2 | | | |
| 16 | Vocal 3 | | | |

## Lighting Requirements (Importable)

| item | quantity | specification | is_required | notes |
|------|----------|---------------|-------------|-------|
| moving_head_spots | | | false | |
| moving_head_wash | | | false | |
| led_wash | | | false | |
| blinders | | | false | |
| strobes | | | false | |
| haze_machine | | | true | |
| follow_spots | | | false | |
| lighting_console | | | true | Or equivalent |

## Backline Requirements (Importable)

| category | item | specification | provided_by | is_required | notes |
|----------|------|---------------|-------------|-------------|-------|
| DRUMS | drum_kit | | promoter | false | |
| DRUMS | kick_size | | | false | |
| DRUMS | snare_size | | | false | |
| GUITAR | guitar_amp_1 | | promoter | false | |
| GUITAR | guitar_amp_2 | | promoter | false | |
| BASS | bass_head | | promoter | false | |
| BASS | bass_cabinet | | promoter | false | |
| KEYS | keyboard_1 | | promoter | false | |
| KEYS | keyboard_stand_1 | | promoter | false | |
| DJ | cdj_count | | promoter | false | |
| DJ | dj_mixer | | promoter | false | |

## Power Requirements

| location | amperage | voltage | three_phase | notes |
|----------|----------|---------|-------------|-------|
| Stage | | | false | |
| FOH | | | false | |
| Lighting | | | true | |
| Video | | | false | |

## Crew Requirements (Importable)

| position | quantity | call_time | notes |
|----------|----------|-----------|-------|
| Stagehands | | | |
| Loaders | | | |
| Riggers | | | |
| Electricians | | | |
| Spot Operators | | | |
| Runners | | | |

## Schedule Requirements

| activity | time | notes |
|----------|------|-------|
| load_in | | Hours before doors |
| sound_check | | Hours before doors |
| doors | | |
| set_length | | Minutes |
| curfew | | |

## Contacts (Importable)

| role | name | phone | email |
|------|------|-------|-------|
| Tour Manager | | | |
| Production Manager | | | |
| FOH Engineer | | | |
| Monitor Engineer | | | |
| Lighting Director | | | |
| Backline Tech | | | |

---

<!-- IMPORT INSTRUCTIONS
To import technical rider:
1. Copy relevant tables to CSV files
2. Times must be in HH:MM 24-hour format
3. Valid provided_by: promoter | artist
4. Import via ATLVS > Settings > Data Import > Technical Rider
-->
