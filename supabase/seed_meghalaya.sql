-- =============================================
-- GARUDA: MEGHALAYA 2026 SEED DATA
-- Run AFTER schema.sql in Supabase SQL Editor
-- Replace f3393db8-ecff-494d-b8ad-04c3096a940a with the owner's auth.users id
-- =============================================

-- Step 1: Create the trip
INSERT INTO public.trips (id, name, destination, description, start_date, end_date, owner_id, status)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Meghalaya–Kamakhya 2026',
  'Shillong, Meghalaya & Guwahati, Assam',
  'A 5-day expedition through the Abode of Clouds. Shillong → Dawki → Mawlynnong → Sohra → Jaintia Hills → Kamakhya Guwahati.',
  '2026-04-30',
  '2026-05-04',
  'f3393db8-ecff-494d-b8ad-04c3096a940a',
  'planning'
) ON CONFLICT DO NOTHING;

-- Step 2: Add owner as member
INSERT INTO public.trip_members (trip_id, user_id, role)
VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f3393db8-ecff-494d-b8ad-04c3096a940a', 'owner')
ON CONFLICT DO NOTHING;

-- Step 3: Itinerary Days
INSERT INTO public.itinerary_days (id, trip_id, day_number, date, theme) VALUES
  ('a0000001-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 1, '2026-04-30', 'Arrival & Urban Acclimation – Shillong'),
  ('a0000002-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 2, '2026-05-01', 'The Southern Border – Dawki & Mawlynnong'),
  ('a0000003-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 3, '2026-05-02', 'The Sohra Watershed – Waterfalls & Caves'),
  ('a0000004-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 4, '2026-05-03', 'Jaintia Hills Adventure & Shillong Social'),
  ('a0000005-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 5, '2026-05-04', 'Spiritual Conclusion – Kamakhya & Vande Bharat')
ON CONFLICT DO NOTHING;

-- Step 4: Day 1 Stops
INSERT INTO public.itinerary_stops (id, day_id, trip_id, name, time_label, lat, lng, description, tips, entry_fee, category, dietary_note, order_index) VALUES
(
  'b0010001-0000-0000-0000-000000000000', 'a0000001-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Land at Umroi Airport',
  '15:30',
  25.7026, 91.9789,
  'Arrive at Shillong Airport (Umroi). Approximately 30 km from city center.',
  'Pre-arrange driver. Call Anthony: 8974555369. Expect 60–90 min transit to city.',
  NULL,
  'transport',
  NULL, 1
),
(
  'b0010002-0000-0000-0000-000000000000', 'a0000001-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Umiam Lake Viewpoint (en route)',
  '16:30',
  25.6768, 91.9114,
  'Beautiful reservoir viewpoint en route to Shillong city. Most drivers include a 20-min stop here.',
  'Just a viewpoint stop — no need to pay for boating if time is short.',
  NULL,
  'viewpoint',
  NULL, 2
),
(
  'b0010003-0000-0000-0000-000000000000', 'a0000001-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Check-in at Hotel – Police Bazar',
  '18:00',
  25.5741, 91.8933,
  'Check in at Polo Towers or The Loft in the Police Bazar area. Great location for nightlife and restaurants.',
  'Request ground floor or lower floors for easier luggage. 24-hour geyser available.',
  'Hotel rates: ₹2,000–4,000/night (triple sharing)',
  'hotel',
  NULL, 3
),
(
  'b0010004-0000-0000-0000-000000000000', 'a0000001-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Ward''s Lake & Police Bazar Market',
  '19:00',
  25.5741, 91.8920,
  'Evening walk around Ward''s Lake and the busy Police Bazar market area. Good for getting local SIM cards and essentials.',
  'Pick up Jio SIM here for better rural coverage. Police Bazar has pharmacies, ATMs.',
  '₹20 entry for Ward''s Lake',
  'viewpoint',
  NULL, 4
),
(
  'b0010005-0000-0000-0000-000000000000', 'a0000001-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Dinner – Meals Restaurant or Bade Miya',
  '20:30',
  25.5742, 91.8930,
  'Meals Restaurant serves authentic Bengali Mutton Curry, Fish Curry, and Biryani. Bade Miya for Chicken Biryani.',
  'Explicitly mention you avoid PORK and BEEF at every restaurant. Confirm cooking oil too.',
  'Budget: ₹200–400/person',
  'restaurant',
  'AVOID: Jadoh (pork fat). SAFE: Mutton Thali (₹180), Fish Curry, Chicken Biryani. Ask about cooking oil.', 5
);

-- Step 5: Day 2 Stops
INSERT INTO public.itinerary_stops (id, day_id, trip_id, name, time_label, lat, lng, description, tips, entry_fee, category, dietary_note, order_index) VALUES
(
  'b0020001-0000-0000-0000-000000000000', 'a0000002-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Depart for Dawki (early start)',
  '07:00',
  25.5741, 91.8933,
  'Drive 82 km to Dawki (~2.5–3 hrs). Early departure essential to avoid highway construction traffic and secure river clarity before afternoon.',
  '1 May is a public holiday – expect high local tourist volume. Leave NO LATER than 7am.',
  NULL,
  'transport',
  NULL, 1
),
(
  'b0020002-0000-0000-0000-000000000000', 'a0000002-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Umngot River Boating – Dawki',
  '10:00',
  25.1791, 92.0150,
  'The crystal-clear Umngot River makes boats appear to float on glass. Hire a row boat or motorized boat. The India-Bangladesh Friendship Bridge (1932) spans the river nearby.',
  'Best clarity Oct–April. Pre-monsoon (April/May) clarity is rain-dependent — avoid if previous night had heavy rain. Bargain for boat rates.',
  '₹500–800 per boat (45 min)',
  'river',
  NULL, 2
),
(
  'b0020003-0000-0000-0000-000000000000', 'a0000002-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Tamabil Border Crossing Photo-op',
  '11:00',
  25.1710, 92.0280,
  'See the Indo-Bangladesh border crossing point. Heavy trucks transport limestone and coal — creates interesting photo opportunities.',
  'For photo purposes only — no crossing. Watch for truck traffic.',
  NULL,
  'viewpoint',
  NULL, 3
),
(
  'b0020004-0000-0000-0000-000000000000', 'a0000002-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Mawlynnong – Asia''s Cleanest Village',
  '12:30',
  25.1984, 91.9233,
  'Mawlynnong is designated Asia''s Cleanest Village. Community-maintained paths, bamboo dustbins. Visit the 80-ft Skywalk bamboo tower for views into Sylhet, Bangladesh.',
  'NOTE: Mawlynnong is closed to day-trippers on Sundays from 2026. You visit Friday — no issue.',
  '₹30 entry + ₹50 Skywalk',
  'village',
  NULL, 4
),
(
  'b0020005-0000-0000-0000-000000000000', 'a0000002-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Lunch – Dapbiang Restaurant, Mawlynnong',
  '13:00',
  25.1990, 91.9230,
  'Simple but nutritious unlimited thalis. Rice, Dal, Veg with optional Chicken or Fish side. Locally grown vegetables and regional red rice.',
  'Safe for Hindu dietary preferences. Ask for Chicken or Fish side dish — they are separate from pork options.',
  '₹150–200/person',
  'restaurant',
  'SAFE: Chicken Thali, Fish, Rice, Dal. Ask to confirm no pork fat used in cooking.', 5
),
(
  'b0020006-0000-0000-0000-000000000000', 'a0000002-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Riwai Living Root Bridge',
  '14:30',
  25.1960, 91.9200,
  'Ancient Khasi technique of training Ficus elastica tree roots across rivers. Living bridge that strengthens over centuries. 2-km trail from Mawlynnong.',
  'Wear proper footwear. Trail involves some steps but is manageable. Not as strenuous as Double Decker.',
  'Free (guide optional: ₹100)',
  'adventure',
  NULL, 6
),
(
  'b0020007-0000-0000-0000-000000000000', 'a0000002-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Drive to Sohra (Cherrapunji)',
  '15:30',
  25.2575, 91.7325,
  'Long drive from Dawki/Mawlynnong to Sohra (~2.5 hours). Scenic transition from tropical lowlands back to plateau.',
  'This is a long drive. Stock up on snacks and water in Dawki.',
  NULL,
  'transport',
  NULL, 7
),
(
  'b0020008-0000-0000-0000-000000000000', 'a0000002-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Check-in at Sohra Hotel',
  '18:30',
  25.2575, 91.7325,
  'Jiva Resort or La Kupar Inn in Sohra, situated at the edge of the plateau overlooking Bangladesh plains.',
  'Sohra is cooler. Temperature drops significantly at night — keep a layer handy.',
  '₹2,500–4,000/night (triple)',
  'hotel',
  NULL, 8
);

-- Step 6: Day 3 Stops
INSERT INTO public.itinerary_stops (id, day_id, trip_id, name, time_label, lat, lng, description, tips, entry_fee, category, dietary_note, order_index) VALUES
(
  'b0030001-0000-0000-0000-000000000000', 'a0000003-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Nohkalikai Falls',
  '09:00',
  25.2488, 91.7166,
  'India''s highest plunge waterfall (340m). Water originates from a small plateau and plunges into a turquoise pool. Pre-monsoon April/May brings recovering volume.',
  'Morning is best before fog sets in. The pool is blue-green — stunning. Don''t miss the viewpoint.',
  '₹20 entry',
  'waterfall',
  NULL, 1
),
(
  'b0030002-0000-0000-0000-000000000000', 'a0000003-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Seven Sisters Falls',
  '09:45',
  25.2662, 91.7304,
  'Seven-segmented waterfall visible only during monsoon at full volume. In April/May partial flow is visible from the highway.',
  'Best viewed from the roadside viewpoint. No need to trek far.',
  NULL,
  'waterfall',
  NULL, 2
),
(
  'b0030003-0000-0000-0000-000000000000', 'a0000003-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Zipline at Mawkdok Dympep Valley',
  '11:00',
  25.3119, 91.7617,
  'Pioneer Adventure Tours operates the Big Line (2,600 ft, 1,200 ft high) and Small Line (1,089 ft). V-shaped gorge panorama. Pure adrenaline.',
  'Book on site — no advance booking needed. Morning slots are less crowded. No fear of heights required... but helps.',
  '₹1,500/person (Big Line) or ₹1,000/person (Small Line)',
  'adventure',
  NULL, 3
),
(
  'b0030004-0000-0000-0000-000000000000', 'a0000003-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Lunch – Orange Roots (Pure Veg) or Jiva Grill',
  '13:00',
  25.2575, 91.7325,
  'Orange Roots is the ONLY pure vegetarian restaurant in Sohra — 100% safe from pork/beef. Jiva Grill offers high-quality grilled chicken and fish using local ingredients.',
  'Orange Roots: Safe for all Hindu dietary preferences. Jiva Grill: Excellent quality but confirm pork-free cooking.',
  '₹200–350/person',
  'restaurant',
  'SAFEST: Orange Roots – 100% veg, no pork risk at all. Jiva Grill: Confirm no pork fat in cooking.', 4
),
(
  'b0030005-0000-0000-0000-000000000000', 'a0000003-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Arwah Cave',
  '14:00',
  25.2823, 91.7484,
  'Less crowded than Mawsmai. Features well-preserved fossils in limestone walls. 200m long passage with stalactites.',
  'Bring a torch even though there is some lighting. Significantly less crowded than Mawsmai Cave.',
  '₹40 entry',
  'cave',
  NULL, 5
),
(
  'b0030006-0000-0000-0000-000000000000', 'a0000003-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Wei Sawdong Falls (3-tiered)',
  '14:45',
  25.2400, 91.7100,
  'Three-tiered cascade. More intimate than Nohkalikai. Requires a steep descent — potentially muddy in pre-monsoon.',
  'NON-SLIP SHOES ESSENTIAL. Limestone becomes treacherous when wet. Steep descent, assess fitness.',
  'Free',
  'waterfall',
  NULL, 6
),
(
  'b0030007-0000-0000-0000-000000000000', 'a0000003-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Laitlum Canyons',
  '15:30',
  25.5398, 91.9113,
  'Dramatic canyon viewpoint. Rasong village sits 3,000 feet below the rim. Golden hour is spectacular but fog rolls in fast after 16:30.',
  'ARRIVE BEFORE 16:30 — fog makes visibility near zero after that. Dress in layers.',
  NULL,
  'viewpoint',
  NULL, 7
);

-- Step 7: Day 4 Stops
INSERT INTO public.itinerary_stops (id, day_id, trip_id, name, time_label, lat, lng, description, tips, entry_fee, category, dietary_note, order_index) VALUES
(
  'b0040001-0000-0000-0000-000000000000', 'a0000004-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Drive to Krang Suri Falls',
  '09:00',
  25.4200, 92.2300,
  'Drive from Sohra to Krang Suri (West Jaintia Hills), approximately 3 hours. Prepare journey snacks.',
  'Long drive through scenic rural Meghalaya. Fill up fuel in Shillong or Jowai.',
  NULL,
  'transport',
  NULL, 1
),
(
  'b0040002-0000-0000-0000-000000000000', 'a0000004-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Krang Suri Falls – Swimming',
  '12:00',
  25.4285, 92.2185,
  'Wide cascade flowing into a massive turquoise-blue natural pool. Professionally managed site. Life jackets mandatory for swimming. Less commercialized than Sohra — more serene.',
  'LIFE JACKETS ARE MANDATORY — not optional. Swimming is the main activity here. The turquoise color is naturally occurring.',
  '₹30 entry + ₹30 life jacket',
  'waterfall',
  NULL, 2
),
(
  'b0040003-0000-0000-0000-000000000000', 'a0000004-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Lunch near Jowai',
  '14:30',
  25.4416, 92.2015,
  'Stop for lunch at a local restaurant near Jowai town in West Jaintia Hills area.',
  'Options are limited here. Ask driver for recommendation. Stick to rice and vegetable dishes if unsure.',
  '₹150–250/person',
  'restaurant',
  'Limited options in area – confirm no pork before ordering. Ask for chicken/egg dishes.', 3
),
(
  'b0040004-0000-0000-0000-000000000000', 'a0000004-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Return drive to Shillong',
  '15:30',
  25.5741, 91.8933,
  'Return drive to Shillong for the final night. Approximately 2.5–3 hours.',
  'Use this drive to rest and recharge before the evening out.',
  NULL,
  'transport',
  NULL, 4
),
(
  'b0040005-0000-0000-0000-000000000000', 'a0000004-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Shillong Nightlife – Cloud 9 or Tango',
  '19:00',
  25.5720, 91.8960,
  'Final evening in Shillong. Cloud 9 and Tango offer live music and a modern atmosphere. The Taproom Sports Bar at Polo Grounds is great for watching live sports.',
  'Shillong winds down by 21:00. Start early. Taxis become scarce late night — pre-arrange return.',
  'Drinks: ₹500–1,500/person depending on consumption',
  'viewpoint',
  NULL, 5
);

-- Step 8: Day 5 Stops
INSERT INTO public.itinerary_stops (id, day_id, trip_id, name, time_label, lat, lng, description, tips, entry_fee, category, dietary_note, order_index) VALUES
(
  'b0050001-0000-0000-0000-000000000000', 'a0000005-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Elephant Falls – Final Shillong Sightseeing',
  '08:30',
  25.5464, 91.8639,
  'Three-tiered waterfall on the outskirts of Shillong. Quick visit before heading to Guwahati.',
  'Quick 45-min visit max. Check out of hotel before going.',
  '₹20 entry',
  'waterfall',
  NULL, 1
),
(
  'b0050002-0000-0000-0000-000000000000', 'a0000005-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Drive Shillong → Guwahati',
  '10:30',
  26.1445, 91.7362,
  '100 km on National Highway. Usually 2.5–3 hours depending on traffic. Guwahati is at 55m elevation — significantly warmer and more humid than Shillong.',
  'Confirm driver knows to head to Kamakhya (Nilachal Hill), not the main city. Guwahati traffic can add 30–45 mins.',
  NULL,
  'transport',
  NULL, 2
),
(
  'b0050003-0000-0000-0000-000000000000', 'a0000005-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Maa Kamakhya Devalaya – VIP Darshan',
  '13:30',
  26.1664, 91.7092,
  'One of the most significant Shakti Peethas in India. On Nilachal Hill above Guwahati. Natural spring and stone representation of the goddess. 10,000+ daily pilgrims.',
  'MUST BOOK VIP TICKET ₹501 at maakamakhya.org exactly 7 days in advance. Carry original Aadhar card. Temple is a tobacco-free zone. No photography in Garbhagriha.',
  '₹501 VIP Special Darshan (book 7 days ahead at maakamakhya.org)',
  'temple',
  NULL, 3
),
(
  'b0050004-0000-0000-0000-000000000000', 'a0000005-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Kamakhya Temple – Operational Schedule',
  NULL,
  26.1664, 91.7092,
  'Temple operational times: 06:00–13:00 open to devotees, 13:00–14:30 CLOSED for Bhog, 14:30–17:15 afternoon darshan, 17:15 final closure. VIP darshan takes 2–4 hours.',
  'Report to PRO office near Gate No. 6 with Aadhar card. Arrive by 13:30 to complete before 17:15 closure. Comfortable footwear removable easily.',
  NULL,
  'temple',
  NULL, 4
),
(
  'b0050005-0000-0000-0000-000000000000', 'a0000005-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Report to Kamakhya Railway Station (KYQ)',
  '17:30',
  26.1600, 91.7106,
  'Kamakhya Junction is 2 km from the temple. Allow 30 minutes to get there from Nilachal Hill.',
  'Vande Bharat Sleeper 27576 departs at 18:15 SHARP. Report by 17:30.',
  NULL,
  'transport',
  NULL, 5
),
(
  'b0050006-0000-0000-0000-000000000000', 'a0000005-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Depart via Vande Bharat Sleeper 27576',
  '18:15',
  26.1600, 91.7106,
  'Train 27576 (Kamakhya–Howrah Vande Bharat Sleeper). Launched 22 Jan 2026. KYQ 18:15 → NJP 23:30 → HWH 08:15 (next day, 5 May). Runs 6 days/week, CLOSED on Wednesdays.',
  'Confirm train runs on Monday (4 May 2026) — it does. Carry dinner from outside as pantry may be limited.',
  'Ticket pre-booked (₹1,500–2,500 in sleeper class)',
  'transport',
  NULL, 6
);

-- Step 9: Pre-seeded Contacts
INSERT INTO public.contacts (trip_id, name, phone, role, notes, is_emergency) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Anthony (Driver)', '8974555369', 'Private Driver – Full Loop', 'Recommended local driver with expert navigational knowledge of all routes. SUV (Ertiga). Full 5-day loop ₹18,000–22,000.', false),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Meghalaya Tourist Police', '1800-345-6640', 'Tourist Police Helpline', 'State-wide tourist assistance', true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Shillong Ambulance', '102', 'Emergency Services', 'National ambulance number', true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Kamakhya Temple PRO', NULL, 'VIP Darshan Counter', 'Near Gate No. 6 on Nilachal Hill. Present Aadhar + printed ticket.', false),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Pioneer Adventure Tours', NULL, 'Zipline – Mawkdok Valley', 'Big Line ₹1,500, Small Line ₹1,000. No advance booking needed.', false);

-- Step 10: Pre-seeded Todos (Packing + Booking checklist)
INSERT INTO public.todos (trip_id, title, status, order_index, assigned_to) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '🎫 Book Vande Bharat Sleeper 27576 (KYQ→HWH, 4 May)', 'todo', 1, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '🛕 Book Kamakhya VIP Darshan ₹501 (maakamakhya.org, book 7 days before)', 'todo', 2, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '🏨 Book hotel in Shillong (Polo Towers / The Loft)', 'todo', 3, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '🏡 Book hotel in Sohra (Jiva Resort / La Kupar Inn)', 'todo', 4, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '🚗 Confirm SUV booking with Anthony (+918974555369)', 'todo', 5, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '✈️ Book flights Kolkata → Shillong', 'todo', 6, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '📱 Download Offline Maps for Shillong-Dawki and Shillong-Sohra routes', 'todo', 7, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '🥾 Pack waterproof trekking shoes (non-slip soles)', 'todo', 8, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '🌧️ Pack rain jacket / poncho', 'todo', 9, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '🎒 Pack quick-dry clothes', 'todo', 10, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '🦟 Pack high-concentration insect repellent', 'todo', 11, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '🔋 Pack portable power bank', 'todo', 12, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '💊 Pack basic medicines (ORS, antacid, paracetamol)', 'todo', 13, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '🪪 Carry Aadhar Card (mandatory for Kamakhya VIP ticket)', 'todo', 14, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '💵 Withdraw enough cash (rural areas are cash-only)', 'todo', 15, NULL),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '📡 Get Jio SIM for rural/highway coverage', 'todo', 16, NULL);

-- Done! Run this and open Garuda to see the Meghalaya trip fully seeded.
