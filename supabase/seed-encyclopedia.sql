insert into public.encyclopedia_categories (slug,name,description,sort_order) values
('seni-pertunjukan','Seni dan Pertunjukan','Ragam ekspresi seni dan pertunjukan Nusantara.',1),
('tari-tradisional','Tari Tradisional','Tari dan praktik gerak dari berbagai komunitas.',2),
('musik-alat-musik','Musik dan Alat Musik','Tradisi musik, bunyi, dan alat musik.',3),
('bahasa-sastra','Bahasa dan Sastra Daerah','Bahasa, sastra lisan, dan karya tulis daerah.',4),
('pakaian-adat','Pakaian Adat','Busana dan ragam hias dalam konteks budaya.',5),
('rumah-arsitektur','Rumah Adat dan Arsitektur','Ruang tinggal dan pengetahuan arsitektur.',6),
('kuliner-tradisional','Kuliner Tradisional','Tradisi pangan dan pengetahuan kuliner.',7),
('kerajinan-batik','Kerajinan dan Batik','Kerajinan, teknik, motif, dan praktik pembuatannya.',8),
('upacara-tradisi','Upacara Adat dan Tradisi','Ritual, perayaan, dan praktik sosial.',9),
('cerita-mitologi','Cerita Rakyat dan Mitologi','Cerita, tokoh, dan beragam tradisi tutur.',10),
('permainan-tradisional','Permainan Tradisional','Permainan dan praktik belajar bersama.',11),
('sejarah-warisan','Sejarah dan Warisan Budaya','Warisan budaya dalam konteks sejarah.',12),
('pengetahuan-tradisional','Pengetahuan Tradisional','Pengetahuan yang berkembang dan diwariskan dalam komunitas.',13),
('kearifan-lokal','Kearifan Lokal','Perspektif dan praktik lokal yang terus berkembang.',14)
on conflict (slug) do nothing;

-- Categories are seeded idempotently by slug.