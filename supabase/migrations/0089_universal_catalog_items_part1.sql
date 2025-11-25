-- 0106_universal_catalog_items_part1.sql
-- Universal Multi-Industry Advancing Catalog - Technical Audio & Lighting

-- ============================================================================
-- TECHNICAL - AUDIO (TECH-AUD) - 20 Items
-- ============================================================================

INSERT INTO production_advancing_catalog (item_id, category, subcategory, item_name, common_variations, related_accessories, specifications, standard_unit, procurement_type, industry_verticals, search_keywords, base_price_low, base_price_high) VALUES
('AUD-001', 'Technical', 'Audio', 'Line Array Speaker System', ARRAY['L-Acoustics', 'JBL VTX', 'd&b', 'Meyer'], ARRAY['Rigging', 'Amps', 'Processing'], 'Coverage, SPL, frequency response', 'Per Side/Day', 'rental', ARRAY['events_entertainment', 'corporate_meetings']::industry_vertical[], ARRAY['PA', 'speakers', 'concert'], 2500, 15000),
('AUD-002', 'Technical', 'Audio', 'Point Source Speakers', ARRAY['QSC', 'EV', 'Yamaha', 'Mackie'], ARRAY['Stands', 'Cables'], 'Wattage, coverage pattern', 'Per Unit/Day', 'rental', ARRAY['events_entertainment', 'corporate_meetings', 'retail']::industry_vertical[], ARRAY['speakers', 'monitors'], 75, 500),
('AUD-003', 'Technical', 'Audio', 'Subwoofers', ARRAY['18" Sub', '21" Sub', 'Cardioid'], ARRAY['Rigging', 'Cables'], 'Frequency response, SPL', 'Per Unit/Day', 'rental', ARRAY['events_entertainment']::industry_vertical[], ARRAY['bass', 'subs'], 150, 800),
('AUD-004', 'Technical', 'Audio', 'Stage Monitors', ARRAY['Wedge', 'Sidefill', 'Drum Fill', 'IEM'], ARRAY['Cables', 'Stands'], 'Power, dispersion', 'Per Unit/Day', 'rental', ARRAY['events_entertainment']::industry_vertical[], ARRAY['monitors', 'wedges'], 50, 300),
('AUD-005', 'Technical', 'Audio', 'Digital Mixing Console', ARRAY['DiGiCo', 'Yamaha CL', 'Allen & Heath', 'Midas'], ARRAY['Stage Box', 'Cases'], 'Channels, I/O, processing', 'Per Unit/Day', 'rental', ARRAY['events_entertainment', 'corporate_meetings', 'film_television']::industry_vertical[], ARRAY['mixer', 'console', 'FOH'], 500, 5000),
('AUD-006', 'Technical', 'Audio', 'Analog Mixing Console', ARRAY['Soundcraft', 'Yamaha MG', 'Mackie'], ARRAY['Cases', 'Cables'], 'Channels, EQ, aux sends', 'Per Unit/Day', 'rental', ARRAY['events_entertainment', 'corporate_meetings']::industry_vertical[], ARRAY['mixer', 'analog'], 100, 800),
('AUD-007', 'Technical', 'Audio', 'Wireless Microphone System', ARRAY['Shure Axient', 'Sennheiser', 'Audio-Technica'], ARRAY['Antennas', 'Rack'], 'Frequency, range, channels', 'Per Channel/Day', 'rental', ARRAY['events_entertainment', 'corporate_meetings', 'film_television']::industry_vertical[], ARRAY['wireless', 'handheld', 'lavalier'], 75, 400),
('AUD-008', 'Technical', 'Audio', 'Wired Microphones', ARRAY['SM58', 'SM57', 'Beta', 'Sennheiser'], ARRAY['Stands', 'Cables', 'Clips'], 'Polar pattern, frequency', 'Per Unit/Day', 'rental', ARRAY['events_entertainment', 'corporate_meetings', 'film_television']::industry_vertical[], ARRAY['microphone', 'vocal', 'instrument'], 15, 100),
('AUD-009', 'Technical', 'Audio', 'In-Ear Monitor System', ARRAY['Shure PSM', 'Sennheiser IEM', 'Lectrosonics'], ARRAY['Earpieces', 'Batteries'], 'Stereo/mono, frequency', 'Per Pack/Day', 'rental', ARRAY['events_entertainment']::industry_vertical[], ARRAY['IEM', 'in-ear', 'monitors'], 100, 500),
('AUD-010', 'Technical', 'Audio', 'Audio Processing', ARRAY['System Processor', 'Crossover', 'Compressor'], ARRAY['Cables', 'Rack'], 'I/O count, processing', 'Per Unit/Day', 'rental', ARRAY['events_entertainment', 'corporate_meetings']::industry_vertical[], ARRAY['DSP', 'processing', 'EQ'], 50, 400),
('AUD-011', 'Technical', 'Audio', 'Audio Playback System', ARRAY['CD Player', 'Media Server', 'Laptop'], ARRAY['Cables', 'Backup'], 'Format support, redundancy', 'Per Unit/Day', 'rental', ARRAY['events_entertainment', 'corporate_meetings']::industry_vertical[], ARRAY['playback', 'media'], 50, 300),
('AUD-012', 'Technical', 'Audio', 'Audio Recording System', ARRAY['Multitrack', 'Stereo', 'Podcast'], ARRAY['Mics', 'Storage'], 'Track count, format', 'Per System/Day', 'rental', ARRAY['events_entertainment', 'corporate_meetings', 'film_television']::industry_vertical[], ARRAY['recording', 'multitrack'], 200, 1500),
('AUD-013', 'Technical', 'Audio', 'Intercom System', ARRAY['Clear-Com', 'RTS', 'Riedel'], ARRAY['Beltpacks', 'Headsets'], 'Channels, wireless', 'Per Station/Day', 'rental', ARRAY['events_entertainment', 'film_television', 'construction']::industry_vertical[], ARRAY['intercom', 'comms'], 50, 200),
('AUD-014', 'Technical', 'Audio', 'Audio Cables & Snakes', ARRAY['XLR', 'TRS', 'Multicore', 'Digital'], ARRAY['Adapters', 'Testers'], 'Length, channels, type', 'Per Cable/Day', 'rental', ARRAY['universal']::industry_vertical[], ARRAY['cables', 'snake', 'XLR'], 5, 200),
('AUD-015', 'Technical', 'Audio', 'Audio Engineer (FOH)', ARRAY['A1', 'System Tech', 'Mix Engineer'], ARRAY['Tools', 'Measurement'], 'Experience, specialization', 'Per Person/Day', 'labor', ARRAY['events_entertainment', 'corporate_meetings', 'film_television']::industry_vertical[], ARRAY['engineer', 'mixer', 'A1'], 400, 1200),
('AUD-016', 'Technical', 'Audio', 'Audio Engineer (Monitor)', ARRAY['A2', 'Monitor Engineer'], ARRAY['Tools', 'IEM Molds'], 'Experience, artist relations', 'Per Person/Day', 'labor', ARRAY['events_entertainment']::industry_vertical[], ARRAY['monitor', 'engineer', 'A2'], 350, 1000),
('AUD-017', 'Technical', 'Audio', 'Audio Technician', ARRAY['Audio Tech', 'Patch Tech', 'RF Tech'], ARRAY['Tools', 'Testers'], 'Setup, troubleshooting', 'Per Person/Day', 'labor', ARRAY['events_entertainment', 'corporate_meetings']::industry_vertical[], ARRAY['tech', 'audio', 'setup'], 250, 600),
('AUD-018', 'Technical', 'Audio', 'Distributed Audio System', ARRAY['70V System', '100V Line', 'Paging'], ARRAY['Amps', 'Speakers'], 'Zone count, coverage', 'Per Zone/Day', 'rental', ARRAY['corporate_meetings', 'retail', 'hospitality']::industry_vertical[], ARRAY['distributed', 'paging', '70V'], 200, 1000),
('AUD-019', 'Technical', 'Audio', 'Hearing Assistance System', ARRAY['Hearing Loop', 'FM', 'IR'], ARRAY['Receivers', 'Headphones'], 'Coverage, receivers', 'Per System/Day', 'rental', ARRAY['corporate_meetings', 'events_entertainment']::industry_vertical[], ARRAY['ADA', 'hearing', 'assistive'], 150, 600),
('AUD-020', 'Technical', 'Audio', 'Simultaneous Interpretation', ARRAY['Booth', 'Receivers', 'Transmitters'], ARRAY['Headphones', 'Mics'], 'Languages, receivers', 'Per Language/Day', 'rental', ARRAY['corporate_meetings', 'government']::industry_vertical[], ARRAY['interpretation', 'translation'], 500, 2000)
ON CONFLICT (item_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  common_variations = EXCLUDED.common_variations,
  related_accessories = EXCLUDED.related_accessories,
  specifications = EXCLUDED.specifications,
  standard_unit = EXCLUDED.standard_unit,
  procurement_type = EXCLUDED.procurement_type,
  industry_verticals = EXCLUDED.industry_verticals,
  search_keywords = EXCLUDED.search_keywords,
  base_price_low = EXCLUDED.base_price_low,
  base_price_high = EXCLUDED.base_price_high;

-- ============================================================================
-- TECHNICAL - LIGHTING (TECH-LGT) - 20 Items
-- ============================================================================

INSERT INTO production_advancing_catalog (item_id, category, subcategory, item_name, common_variations, related_accessories, specifications, standard_unit, procurement_type, industry_verticals, search_keywords, base_price_low, base_price_high) VALUES
('LGT-001', 'Technical', 'Lighting', 'Moving Head Spot', ARRAY['Robe', 'Martin', 'Clay Paky', 'Vari-Lite'], ARRAY['Clamps', 'Safety', 'Cases'], 'Wattage, output, features', 'Per Unit/Day', 'rental', ARRAY['events_entertainment', 'corporate_meetings']::industry_vertical[], ARRAY['moving light', 'spot', 'intelligent'], 150, 600),
('LGT-002', 'Technical', 'Lighting', 'Moving Head Wash', ARRAY['Robe', 'Martin', 'Chauvet', 'Elation'], ARRAY['Clamps', 'Safety', 'Cases'], 'Wattage, beam angle, RGBW', 'Per Unit/Day', 'rental', ARRAY['events_entertainment', 'corporate_meetings']::industry_vertical[], ARRAY['wash', 'moving light', 'LED'], 100, 400),
('LGT-003', 'Technical', 'Lighting', 'LED Par Can', ARRAY['RGBW', 'RGBA', 'Single Color', 'Battery'], ARRAY['Clamps', 'Cables', 'Cases'], 'LED type, output, beam', 'Per Unit/Day', 'rental', ARRAY['events_entertainment', 'corporate_meetings', 'retail']::industry_vertical[], ARRAY['par', 'LED', 'uplighting'], 20, 100),
('LGT-004', 'Technical', 'Lighting', 'Ellipsoidal/Profile', ARRAY['ETC Source Four', 'Altman', 'Strand'], ARRAY['Lenses', 'Gobos', 'Color'], 'Wattage, lens angle', 'Per Unit/Day', 'rental', ARRAY['events_entertainment', 'corporate_meetings', 'film_television']::industry_vertical[], ARRAY['leko', 'ellipsoidal', 'profile'], 25, 150),
('LGT-005', 'Technical', 'Lighting', 'Fresnel', ARRAY['LED Fresnel', 'Tungsten Fresnel'], ARRAY['Barndoors', 'Gels', 'Stands'], 'Wattage, beam spread', 'Per Unit/Day', 'rental', ARRAY['events_entertainment', 'film_television']::industry_vertical[], ARRAY['fresnel', 'soft light'], 30, 200),
('LGT-006', 'Technical', 'Lighting', 'Followspot', ARRAY['Strong', 'Robert Juliat', 'Lycian'], ARRAY['Stand', 'Color Boomerang'], 'Wattage, throw distance', 'Per Unit/Day', 'rental', ARRAY['events_entertainment']::industry_vertical[], ARRAY['followspot', 'spotlight'], 200, 800),
('LGT-007', 'Technical', 'Lighting', 'Lighting Console', ARRAY['grandMA', 'ETC Eos', 'Hog', 'ChamSys'], ARRAY['Monitors', 'Faders', 'Cases'], 'Universes, features', 'Per Unit/Day', 'rental', ARRAY['events_entertainment', 'corporate_meetings', 'film_television']::industry_vertical[], ARRAY['console', 'desk', 'DMX'], 300, 2000),
('LGT-008', 'Technical', 'Lighting', 'DMX Distribution', ARRAY['Splitter', 'Node', 'Opto-Splitter'], ARRAY['Cables', 'Rack'], 'Outputs, protocol', 'Per Unit/Day', 'rental', ARRAY['events_entertainment', 'corporate_meetings']::industry_vertical[], ARRAY['DMX', 'distribution', 'splitter'], 25, 200),
('LGT-009', 'Technical', 'Lighting', 'Dimmer Rack', ARRAY['ETC', 'Strand', 'LSC'], ARRAY['Cables', 'Breakouts'], 'Channels, amperage', 'Per Rack/Day', 'rental', ARRAY['events_entertainment', 'film_television']::industry_vertical[], ARRAY['dimmer', 'rack', 'conventional'], 150, 600),
('LGT-010', 'Technical', 'Lighting', 'LED Wall Wash/Strip', ARRAY['LED Strip', 'Cyc Light', 'Wall Washer'], ARRAY['Cables', 'Mounting'], 'Length, pixel pitch', 'Per Unit/Day', 'rental', ARRAY['events_entertainment', 'corporate_meetings', 'retail']::industry_vertical[], ARRAY['strip', 'wall wash', 'cyc'], 50, 300),
('LGT-011', 'Technical', 'Lighting', 'Strobe/Effect Light', ARRAY['Atomic', 'LED Strobe', 'Blinder'], ARRAY['Controllers', 'Safety'], 'Output, flash rate', 'Per Unit/Day', 'rental', ARRAY['events_entertainment']::industry_vertical[], ARRAY['strobe', 'blinder', 'effect'], 40, 200),
('LGT-012', 'Technical', 'Lighting', 'Haze/Fog Machine', ARRAY['Hazer', 'Fog', 'Low Fog', 'Cracker'], ARRAY['Fluid', 'Ducting'], 'Output, fluid type', 'Per Unit/Day', 'rental', ARRAY['events_entertainment', 'film_television']::industry_vertical[], ARRAY['haze', 'fog', 'atmosphere'], 75, 400),
('LGT-013', 'Technical', 'Lighting', 'Gobo/Pattern Projection', ARRAY['Custom Gobo', 'Stock Gobo', 'Rotator'], ARRAY['Holders', 'Fixtures'], 'Size, material', 'Per Unit', 'rental', ARRAY['events_entertainment', 'corporate_meetings']::industry_vertical[], ARRAY['gobo', 'pattern', 'logo'], 25, 200),
('LGT-014', 'Technical', 'Lighting', 'Truss/Pipe & Base', ARRAY['12" Box', '20" Box', 'Pipe & Drape'], ARRAY['Corners', 'Clamps', 'Bases'], 'Length, load capacity', 'Per Section/Day', 'rental', ARRAY['events_entertainment', 'corporate_meetings']::industry_vertical[], ARRAY['truss', 'pipe', 'structure'], 30, 150),
('LGT-015', 'Technical', 'Lighting', 'Lighting Designer', ARRAY['LD', 'Associate LD'], ARRAY['Software', 'Visualization'], 'Design, programming', 'Per Person/Day', 'labor', ARRAY['events_entertainment', 'corporate_meetings', 'film_television']::industry_vertical[], ARRAY['designer', 'LD', 'creative'], 500, 1500),
('LGT-016', 'Technical', 'Lighting', 'Lighting Technician', ARRAY['Electrician', 'Spot Op', 'Board Op'], ARRAY['Tools', 'PPE'], 'Setup, focus, operation', 'Per Person/Day', 'labor', ARRAY['events_entertainment', 'corporate_meetings', 'film_television']::industry_vertical[], ARRAY['tech', 'electrician', 'crew'], 250, 600),
('LGT-017', 'Technical', 'Lighting', 'Architectural Lighting', ARRAY['Uplighting', 'Facade Wash', 'Accent'], ARRAY['Cables', 'Mounting'], 'Color, output, weatherproof', 'Per Unit/Day', 'rental', ARRAY['events_entertainment', 'corporate_meetings', 'hospitality']::industry_vertical[], ARRAY['architectural', 'uplighting', 'accent'], 30, 150),
('LGT-018', 'Technical', 'Lighting', 'String/Festoon Lights', ARRAY['Edison', 'LED String', 'Fairy'], ARRAY['Extension', 'Dimmers'], 'Length, bulb type', 'Per Strand/Day', 'rental', ARRAY['events_entertainment', 'hospitality', 'retail']::industry_vertical[], ARRAY['string lights', 'festoon', 'bistro'], 25, 100),
('LGT-019', 'Technical', 'Lighting', 'Laser System', ARRAY['RGB Laser', 'Graphics', 'Beam'], ARRAY['Safety Equipment', 'Controllers'], 'Power, color, safety class', 'Per Unit/Day', 'rental', ARRAY['events_entertainment']::industry_vertical[], ARRAY['laser', 'beam', 'effect'], 300, 2000),
('LGT-020', 'Technical', 'Lighting', 'Pyrotechnics/SFX', ARRAY['Gerbs', 'Comets', 'Flame', 'Confetti'], ARRAY['Controllers', 'Safety'], 'Effect type, duration', 'Per Effect', 'consumable', ARRAY['events_entertainment']::industry_vertical[], ARRAY['pyro', 'flame', 'confetti'], 100, 5000)
ON CONFLICT (item_id) DO UPDATE SET
  item_name = EXCLUDED.item_name,
  common_variations = EXCLUDED.common_variations,
  related_accessories = EXCLUDED.related_accessories,
  specifications = EXCLUDED.specifications,
  standard_unit = EXCLUDED.standard_unit,
  procurement_type = EXCLUDED.procurement_type,
  industry_verticals = EXCLUDED.industry_verticals,
  search_keywords = EXCLUDED.search_keywords,
  base_price_low = EXCLUDED.base_price_low,
  base_price_high = EXCLUDED.base_price_high;
