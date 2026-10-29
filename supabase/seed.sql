-- Seed demo data for LokaQuest
-- This can be safely re-run without duplicating records

-- Insert demo cultural sources (idempotent without a unique constraint)
insert into public.cultural_sources (title, author, publisher, year, url, license, attribution)
select * from (values
  ('Ensiklopedia Batik Indonesia', 'Hasan', 'Gramedia Pustaka Utama', 2010, 'https://example.com/batik', 'CC BY-SA 4.0', 'Hasan (2010). Ensiklopedia Batik Indonesia. Gramedia Pustaka Utama.'),
  ('Gamelan: Traditional Music of Indonesia', 'Sumarsam', 'Wesleyan University Press', 1995, 'https://example.com/gamelan', 'CC BY-NC 4.0', 'Sumarsam (1995). Gamelan: Traditional Music of Indonesia. Wesleyan University Press.'),
  ('Wayang Kulit: Shadow Puppetry of Java', 'Brandon', 'KITLV Press', 1967, 'https://example.com/wayang', 'Public Domain', 'Brandon (1967). Wayang Kulit: Shadow Puppetry of Java. KITLV Press.')
) as v(title, author, publisher, year, url, license, attribution)
where not exists (
  select 1 from public.cultural_sources where cultural_sources.title = v.title
);

-- Insert demo regions
insert into public.cultural_regions (slug, name, description, geographic_context, image_url, sort_order, status)
values
  ('jawa-tengah', 'Jawa Tengah', 'Pusat perdagangan dan budaya batik terkemuka di Indonesia dengan motif-motif klasik dan modern.', 'Central Java, Indonesia', '/assets/images/regions/jawa-tengah.jpg', 1, 'published'),
  ('jawa-barat', 'Jawa Barat', 'Rumah bagi tradisi gamelan Sunda yang kaya dengan nuansa alam pegunungan.', 'West Java, Indonesia', '/assets/images/regions/jawa-barat.jpg', 2, 'published'),
  ('yogyakarta', 'Yogyakarta', 'Kota budaya yang menjadi pusat seni wayang kulit dan keraton.', 'Special Region of Yogyakarta, Indonesia', '/assets/images/regions/yogyakarta.jpg', 3, 'published')
on conflict (slug) do nothing;

-- Insert demo missions
insert into public.missions (region_id, slug, title, description, learning_objectives, difficulty, xp_reward, sort_order, status)
select 
  id,
  'batik-detective',
  'Batik Detective',
  'Pelajari pola dan makna di balik batik khas Jawa Tengah.',
  '["Mengenali motif batik klasik", "Memahami filosofi simbol batik", "Membedakan ciri khas wilayah"]',
  'beginner',
  150,
  1,
  'published'
from public.cultural_regions where slug = 'jawa-tengah'
union all
select 
  id,
  'gamelan-maestro',
  'Gamelan Maestro',
  'Kenali instrumen gamelan dan peranannya dalam orkestra tradisional.',
  '["Mengenali instrumen gamelan", "Memahami fungsi masing-masing instrumen", "Menghargai harmoni gamelan"]',
  'intermediate',
  200,
  1,
  'published'
from public.cultural_regions where slug = 'jawa-barat'
union all
select 
  id,
  'wayang-story',
  'Wayang Story Adventure',
  'Ikuti petualangan wayang dan pelajari cerita rakyat Nusantara.',
  '["Mengenal tokoh wayang utama", "Memahami alur cerita wayang", "Menghargai nilai moral wayang"]',
  'intermediate',
  200,
  1,
  'published'
from public.cultural_regions where slug = 'yogyakarta'
on conflict (slug) do nothing;

-- Insert demo mission questions
insert into public.mission_questions (mission_id, question_type, prompt, options, correct_answer, explanation, sort_order)
select 
  m.id,
  'multiple_choice',
  'Apa motif batik yang terkenal dari Jawa Tengah dengan motif burung hong?',
  '{"choices": ["Parang Rusak", "Kawung", "Semen Rama", "Buketan"]}',
  '{"correct": "Parang Rusak"}',
  'Motif Parang Rusak adalah motif batik klasik dari Jawa Tengah yang often diartikan sebagai simbol keberanian dan keteguhan.',
  1
from public.missions m where m.slug = 'batik-detective'
union all
select 
  m.id,
  'matching',
  'Cocokkan motif batik dengan maknanya:',
  '{"pairs": {"Parang Rusak": "Keberanian", "Kawung": "Kebersihan", "Semen Rama": "Kesetiaan"}}',
  '{"matches": {"Parang Rusak": "Keberanian", "Kawung": "Kebersihan", "Semen Rama": "Kesetiaan"}}',
  'Setiap motif batik memiliki filosofi mendalam yang dijunjung oleh leluhur.',
  2
from public.missions m where m.slug = 'batik-detective'
union all
select 
  m.id,
  'multiple_choice',
  'Alat musik tradisional yang menjadi pengiring utama dalam gamelan Jawa adalah:',
  '{"choices": ["Suling", "Kendang", "Bonang", "Gender"]}',
  '{"correct": "Kendang"}',
  'Kendang adalah drum yang menjadi jantung irama dalam gamelan Jawa.',
  1
from public.missions m where m.slug = 'gamelan-maestro'
union all
select 
  m.id,
  'identification',
  'Identifikasikan instrumen gamelan berdasarkan suaranya:',
  '{"instruments": ["Saron", "Slenthem", "Gender", "Bonang"]}',
  '{"correct": "Saron"}',
  'Saron menghasilkan suara metalik yang khas dalam gamelan.',
  2
from public.missions m where m.slug = 'gamelan-maestro'
union all
select 
  m.id,
  'sequencing',
  'Urutkan rangkaian cerita wayang berikut sesuai dengan alur yang benar:',
  '{"events": ["Keluarga kerajaan dibuang", "Pangeran lahir di hutan", "Pangeran balik keraton", "Pangeran jadi raja"]}',
  '{"order": [3, 1, 2, 4]}',
  'Alur cerita wayang biasanya mengikuti struktur yangklasik: musibah -> kelahiran -> perjuangan -> kemenangan.',
  1
from public.missions m where m.slug = 'wayang-story'
union all
select 
  m.id,
  'multiple_choice',
  'Tokoh wayang yang terkenal dengan sifat kurnia dan kesetiaan adalah:',
  '{"choices": ["Gareng", "Semar", "Arjuna", "Bima"]}',
  '{"correct": "Semar"}',
  'Semar adalah tokoh punakawan yang melambangkan kesaktian dan kebijaksanaan.',
  2
from public.missions m where m.slug = 'wayang-story'
on conflict do nothing;

-- Insert demo achievements
insert into public.achievements (slug, title, description, icon, criteria, xp_bonus)
values
  ('first-steps', 'Langkah Pertama', 'Selesaikan misi pertamamu', '🎯', '{"type": "mission_complete", "count": 1}', 50),
  ('batik-master', 'Ahli Batik', 'Selesaikan semua misi batik dengan nilai sempurna', '🧵', '{"type": "mission_perfect", "mission_slug": "batik-detective"}', 100),
  ('gamelan-virtuoso', 'Virtuoso Gamelan', 'Selesaikan misi Gamelan Maestro', '🎶', '{"type": "mission_complete", "mission_slug": "gamelan-maestro"}', 100),
  ('wayang-scholar', 'Cendekiawan Wayang', 'Selesaikan misi Wayang Story Adventure', '🎭', '{"type": "mission_complete", "mission_slug": "wayang-story"}', 100),
  ('cultural-explorer', 'Penjelajah Budaya', 'Selesaikan 3 misi', '🌏', '{"type": "mission_complete_total", "count": 3}', 200)
on conflict (slug) do nothing;

-- Insert demo cultural artifacts
insert into public.cultural_artifacts (name, description, region_id, image_url, rarity)
values
  ('Kain Batik Tulis', 'Kain batik buatan tangan dengan motif Parang Rusak', (select id from public.cultural_regions where slug = 'jawa-tengah'), '/assets/images/artifacts/batik-tulis.jpg', 'rare'),
  ('Kendang Gamelan', 'Instrumen kendang dari gamelan Jawa', (select id from public.cultural_regions where slug = 'jawa-barat'), '/assets/images/artifacts/kendang.jpg', 'uncommon'),
  ('Wayang Kulit Arjuna', 'Wayang kulit tokoh Arjuna dari Yogyakarta', (select id from public.cultural_regions where slug = 'yogyakarta'), '/assets/images/artifacts/wayang-arjuna.jpg', 'legendary')
on conflict do nothing;

-- Insert demo learning assessments
insert into public.learning_assessments (title, description, assessment_type, questions)
values
  ('Pretest — Pengetahuan Budaya Indonesia', 'Uji pengetahuan awal Anda tentang budaya Indonesia sebelum memulai petualangan.', 'pre', '[
    {"id": "q1", "type": "multiple_choice", "prompt": "Batik berasal dari negara mana?", "choices": ["Indonesia", "Malaysia", "Thailand", "Filipina"], "correct": "Indonesia"},
    {"id": "q2", "type": "multiple_choice", "prompt": "Gamelan adalah...", "choices": ["Alat musik tradisional Indonesia", "Tarian tradisional", "Kuliner", "Arsitektur"], "correct": "Alat musik tradisional Indonesia"},
    {"id": "q3", "type": "multiple_choice", "prompt": "Wayang kulit terutama ada di pulau mana?", "choices": ["Jawa", "Sumatra", "Kalimantan", "Sulawesi"], "correct": "Jawa"}
  ]'),
  ('Posttest — Pengetahuan Budaya Indonesia', 'Uji pengetahuan Anda setelah menyelesaikan petualangan.', 'post', '[
    {"id": "q1", "type": "multiple_choice", "prompt": "Motif batik Parang Rusak melambangkan...", "choices": ["Keberanian", "Kebersihan", "Kesetiaan", "Kecerdasan"], "correct": "Keberanian"},
    {"id": "q2", "type": "multiple_choice", "prompt": "Instrumen pengiring utama gamelan Jawa adalah...", "choices": ["Suling", "Kendang", "Bonang", "Gender"], "correct": "Kendang"},
    {"id": "q3", "type": "multiple_choice", "prompt": "Tokoh punakawan dalam wayang adalah...", "choices": ["Semar", "Arjuna", "Bima", "Gareng"], "correct": "Semar"}
  ]')
on conflict (title) do nothing;
