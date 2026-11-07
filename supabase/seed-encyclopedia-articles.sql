-- Seed 18 encyclopedia articles with traceable sources.
-- Idempotent: article slugs are unique; join rows use primary keys / NOT EXISTS.
-- Region links are skipped automatically when a region slug is not seeded.

insert into public.encyclopedia_articles
  (slug, title, summary, body, background, historical_context, cultural_meaning,
   characteristics, social_function, practices, preservation, verified_facts,
   alternative_names, featured, status, published_at)
values
(
  'batik-indonesia',
  'Batik Indonesia',
  'Batik adalah tradisi menghias kain dengan lilin dan pewarna yang berkembang di banyak komunitas Jawa dan wilayah lain di Indonesia.',
  'Batik dibuat dengan menahan warna memakai lilin panas, lalu mencelupkan kain ke pewarna. Motif tertentu memiliki nama, aturan, dan makna sosial yang diwariskan antar generasi. UNESCO mencatat batik Indonesia sebagai warisan budaya takbenda pada 2009.',
  'Batik hidup dalam lingkungan keraton, pesantren, dan industri rumahan. Setiap daerah mengembangkan palet warna serta motif yang dipengaruhi lingkungan dan sejarah lokal.',
  'Perdagangan tekstil, pertukaran budaya pesisir, dan tradisi keraton membentuk ragam batik seperti Parang, Kawung, dan Mega Mendung. Kolonialisme dan industrialisasi mengubah cara produksinya tanpa menghapus praktik tulis tradisional.',
  'Batik tidak sekadar pakaian. Motif dapat menandai status, harapan, atau fase kehidupan, dan kini menjadi simbol identitas budaya Indonesia yang dipakai lintas kelompok.',
  'Ciri khasnya adalah garis lilin yang organik, warna yang menembus serat, serta pengulangan motif. Batik tulis, cap, dan printing memiliki tingkat kerumitan serta nilai kerja yang berbeda.',
  'Batik dipakai dalam upacara, busana kerja, dan diplomasi budaya. Perajin dan komunitas lokal menjadikannya sumber penghidupan sekaligus media pendidikan.',
  'Prosesnya mencakup nyorek (menggambar pola), membatik dengan canting, nembok, mewarnai, dan melorod lilin. Setiap tahap menuntut ketelitian dan pengetahuan bahan.',
  'Pelestarian dilakukan lewat museum, sanggar, pendidikan vokasi, dan perlindungan indikasi geografis. Tantangannya adalah menjaga upah perajin dan menghindari klaim budaya tanpa atribusi.',
  '["UNESCO menetapkan batik Indonesia sebagai Representative List of the Intangible Cultural Heritage of Humanity pada 2009.","Batik tulis menggunakan canting, sementara batik cap memakai stempel tembaga.","Motif Parang dan Kawung memiliki aturan pemakaian dalam tradisi keraton Jawa."]',
  '{"Batik","Kain batik"}', true, 'published', now()
),
(
  'gamelan-jawa',
  'Gamelan Jawa',
  'Gamelan adalah ansambel musik metalofon, gong, kendang, dan instrumen lain yang menjadi tulang punggung banyak tradisi musik Jawa dan Bali.',
  'Gamelan dimainkan bersama dengan pola interlocking, dinamika, dan tuning yang khas. Repertoar disampaikan secara lisan dan melalui notasi kepatihan. Pada 2021 UNESCO mencatat gamelan sebagai warisan budaya takbenda.',
  'Ansambel gamelan hadir di keraton, desa, sekolah, dan komunitas diaspora. Instrumennya sering dianggap memiliki nama dan kehormatan tersendiri.',
  'Perkembangan gamelan berkaitan dengan jaringan kerajaan Jawa, pengaruh India, dan kreativitas lokal. Zaman modern melahirkan komposisi baru serta kolaborasi lintas genre.',
  'Gamelan mengajarkan kerja sama: setiap pemain memegang bagian kecil yang membentuk keseluruhan. Nilai kesabaran, mendengar, dan rasa kebersamaan sering ditekankan.',
  'Ciri utamanya adalah laras slendro dan pelog, pola gongan, serta peran kendang sebagai pengatur tempo. Setiap instrumen memiliki wilayah nada dan teknik pukulan sendiri.',
  'Gamelan mengiringi wayang, tari, upacara, dan perayaan. Ia juga menjadi sarana pendidikan karakter dan diplomasi budaya.',
  'Latihan biasanya dilakukan bersama secara rutin. Pemain belajar menghafal pola, mengikuti aba-aba kendang, dan menyesuaikan dinamika dengan konteks pertunjukan.',
  'Pelestarian berlangsung melalui sanggar, sekolah seni, festival, dan dokumentasi audio. Regenerasi pemain muda serta perawatan instrumen menjadi tantangan utama.',
  '["UNESCO mencatat Gamelan sebagai warisan budaya takbenda pada 2021.","Laras slendro dan pelog adalah dua sistem nada yang umum dalam gamelan Jawa.","Kendang berfungsi mengatur tempo dan transisi bagian dalam ansambel."]',
  '{"Gamelan","Karawitan"}', true, 'published', now()
),
(
  'wayang-kulit',
  'Wayang Kulit',
  'Wayang kulit adalah teater bayangan dengan boneka kulit yang dimainkan dalang di balik layar dan diiringi gamelan.',
  'Pertunjukan wayang kulit berlangsung semalaman dalam versi lengkap, meski kini banyak format pendek untuk acara budaya. Dalang menuturkan cerita, menyuarakan tokoh, dan mengatur iringan. UNESCO mencatat wayang Indonesia pada 2008.',
  'Wayang berkembang dalam lingkungan keraton dan masyarakat desa Jawa serta Bali. Cerita bersumber dari epik India, legenda lokal, dan kisah kontemporer.',
  'Islamisasi, perdagangan, dan politik kerajaan memengaruhi isi serta gaya pertunjukan. Tokoh punakawan seperti Semar dan Gareng menjadi bagian khas tradisi Jawa.',
  'Wayang menyampaikan ajaran moral, kritik sosial, dan refleksi tentang kekuasaan. Penonton diajak membaca lapisan makna di balik pertarungan tokoh.',
  'Boneka dibuat dari kulit kerbau yang ditatah dan diwarnai, ditopang bilah bambu. Layar putih, lampu, serta posisi dalang menciptakan efek bayangan.',
  'Wayang berfungsi sebagai hiburan, ritual, pendidikan, dan ruang dialog sosial. Dalang yang baik mampu merespons konteks penonton.',
  'Pertunjukan dipersiapkan dengan memilih lakon, menyiapkan boneka, dan menyelaraskan gamelan. Dalang berlatih suara, catur, serta penguasaan cerita.',
  'Pelestarian dilakukan oleh sanggar, sekolah, festival, dan arsip digital. Tantangannya adalah menjaga minat generasi muda tanpa memudarkan kedalaman tradisi.',
  '["UNESCO mencatat Wayang Indonesia sebagai warisan budaya takbenda pada 2008.","Dalang memainkan peran sebagai narator, pengisi suara, dan pengatur pertunjukan.","Punakawan adalah kelompok tokoh khas dalam wayang Jawa."]',
  '{"Wayang","Wayang purwa"}', true, 'published', now()
),
(
  'tari-saman',
  'Tari Saman',
  'Tari Saman adalah tarian kelompok dari Gayo, Aceh, yang memadukan gerakan duduk cepat, tepukan, dan syair.',
  'Penari duduk berbaris dan bergerak serempak dengan tempo yang meningkat. Syair berisi pujian, nasihat, dan pesan keagamaan. UNESCO mencatat Tari Saman pada 2011.',
  'Tari ini tumbuh dalam masyarakat Gayo dan dahulu ditampilkan pada acara adat serta perayaan keagamaan.',
  'Tradisi lisan dan pendidikan pesantren memengaruhi bentuk syair serta disiplin gerak. Nama Saman dikaitkan dengan tokoh penyebar tari di Gayo.',
  'Saman menekankan kekompakan, disiplin, dan rasa kebersamaan. Gerakan fisik menjadi media menyampaikan pesan moral.',
  'Ciri utamanya adalah posisi duduk berlutut, tepukan tangan, gerakan kepala dan badan, serta syair yang dinyanyikan bersama.',
  'Saman tampil dalam festival, acara sekolah, dan diplomasi budaya. Ia menjadi identitas masyarakat Gayo sekaligus daya tarik wisata.',
  'Latihan dilakukan berkelompok untuk menyatukan tempo dan gerak. Penari harus menjaga koordinasi serta stamina.',
  'Pelestarian dilakukan melalui sanggar, sekolah, dan festival. Komersialisasi perlu diimbangi dengan penghormatan pada konteks adat.',
  '["UNESCO mencatat Tari Saman pada 2011.","Saman berasal dari dataran tinggi Gayo, Aceh.","Gerakan dilakukan dalam posisi duduk berlutut dengan tempo yang meningkat."]',
  '{"Saman","Tari Seribu Tangan"}', false, 'published', now()
),
(
  'randai',
  'Randai',
  'Randai adalah teater rakyat Minangkabau yang menggabungkan cerita, tari, musik, dan silat dalam lingkaran penari.',
  'Pemain bergerak dalam formasi lingkaran sambil bernyanyi dan menari, lalu menampilkan lakon di tengahnya. Randai sering mengangkat kaba atau cerita rakyat Minangkabau.',
  'Randai tumbuh di nagari Minangkabau dan terkait dengan tradisi silat serta kesenian rakyat.',
  'Pertunjukan berkembang dari latihan silat di surau dan pergaulan muda-mudi. Randai kemudian menjadi media kritik sosial dan hiburan komunitas.',
  'Randai menekankan musyawarah, kebersamaan, dan keberanian menyampaikan pesan lewat cerita.',
  'Ciri khasnya adalah lingkaran penari, gerak tari yang dinamis, dendang, dan teater di tengah arena.',
  'Randai tampil pada acara adat, pernikahan, dan festival budaya. Ia menjadi ruang belajar nilai sosial bagi generasi muda.',
  'Latihan mencakup gerak, vokal, musik, dan akting. Cerita disusun bersama dan sering disesuaikan dengan audiens.',
  'Pelestarian dilakukan oleh sanggar dan sekolah. Dokumentasi cerita serta regenerasi pemain menjadi kebutuhan utama.',
  '["Randai berasal dari tradisi Minangkabau, Sumatera Barat.","Pertunjukan menggabungkan teater, tari, musik, dan silat.","Kaba adalah cerita rakyat yang sering diangkat dalam randai."]',
  '{"Randai Minang"}', false, 'published', now()
),
(
  'ondel-ondel',
  'Ondel-ondel',
  'Ondel-ondel adalah boneka raksasa khas Jakarta yang kini menjadi ikon budaya Betawi.',
  'Boneka setinggi sekitar dua meter ini diusung dalam arak-arakan dan diiringi musik Betawi. Wajahnya lebar dengan warna cerah, dan gerakannya digerakkan dari dalam.',
  'Ondel-ondel dahulu dipakai untuk menolak bala dan mengarak pengantin. Maknanya berubah seiring urbanisasi Jakarta.',
  'Pengaruh Betawi, Tionghoa, dan budaya pesisir terlihat pada bentuk serta warna. Pemerintah kemudian menjadikannya maskot kota.',
  'Ondel-ondel melambangkan keberanian, keceriaan, dan identitas Betawi. Kini ia juga menjadi simbol keragaman Jakarta.',
  'Ciri utamanya adalah boneka besar berwajah lebar, rambut ijuk, warna mencolok, dan gerakan mengayun.',
  'Ondel-ondel tampil dalam festival, pernikahan, dan acara pariwisata. Perajin dan pengusungnya menjaga tradisi tetap hidup.',
  'Pembuatan boneka memerlukan rangka, anyaman, kain, dan ijuk. Pengusung berlatih gerak agar tetap seimbang.',
  'Pelestarian menghadapi tantangan komersialisasi dan perubahan fungsi. Regenerasi perajin serta pengaturan pertunjukan jalanan menjadi isu penting.',
  '["Ondel-ondel adalah ikon budaya Betawi di Jakarta.","Boneka diusung dan digerakkan oleh orang di dalamnya.","Fungsi awalnya terkait arak-arakan dan penolakan bala."]',
  '{"Ondel-ondel Betawi"}', false, 'published', now()
),
(
  'rumah-betang',
  'Rumah Betang',
  'Rumah betang adalah rumah panjang komunal masyarakat Dayak di Kalimantan yang dibangun untuk hidup bersama.',
  'Rumah betang dapat dihuni banyak keluarga dan berfungsi sebagai pusat kegiatan adat. Bentuknya memanjang, sering berdiri di atas tiang, dan dekat sungai.',
  'Kehidupan sungai, hutan, dan pertanian membentuk pola permukiman rumah betang. Setiap komunitas memiliki variasi arsitektur dan aturan.',
  'Perdagangan kayu, migrasi, dan kebijakan modern memengaruhi keberadaan rumah betang. Beberapa rumah asli masih dihuni, yang lain menjadi situs budaya.',
  'Rumah betang mencerminkan musyawarah, solidaritas, dan hubungan erat dengan alam. Ruang bersama menjadi tempat belajar dan menyelesaikan persoalan.',
  'Ciri utamanya adalah bangunan panjang, tiang tinggi, ruang terbuka bersama, serta pembagian unit keluarga.',
  'Selain tempat tinggal, rumah betang menjadi ruang upacara, musyawarah, dan penyimpanan pusaka komunitas.',
  'Pembangunan dan perawatan dilakukan bergotong royong. Bahan kayu dipilih dan diolah dengan pengetahuan lokal.',
  'Pelestarian berhadapan dengan tekanan pembangunan dan perubahan gaya hidup. Dokumentasi arsitektur serta keterlibatan komunitas sangat penting.',
  '["Rumah betang adalah rumah panjang komunal masyarakat Dayak.","Bangunan sering didirikan di atas tiang dan dekat sungai.","Rumah betang berfungsi sebagai ruang tinggal sekaligus musyawarah adat."]',
  '{"Betang","Rumah panjang Dayak"}', true, 'published', now()
),
(
  'pinisi',
  'Pinisi',
  'Pinisi adalah kapal layar tradisional Bugis-Makassar dan Konjo yang terkenal karena layar tujuh dan teknik pembuatannya.',
  'Pinisi digunakan untuk pelayaran niaga dan kini banyak dipakai untuk wisata. Pembuatan kapal dilakukan dengan pengetahuan turun-temurun di galangan tradisional. UNESCO mencatat seni pembuatan pinisi pada 2017.',
  'Pelayaran Nusantara menghubungkan Sulawesi dengan Maluku, Kalimantan, dan Jawa. Pinisi menjadi bagian dari jaringan perdagangan maritim.',
  'Perdagangan rempah, migrasi, dan teknologi pelayaran membentuk perkembangan pinisi. Kapal modern dan perubahan ekonomi menantang keberlanjutannya.',
  'Pinisi melambangkan keberanian pelaut, kerja sama awak, dan hubungan budaya maritim Nusantara.',
  'Ciri utamanya adalah dua tiang utama, tujuh layar, lambung panjang, dan pola pembuatan tanpa cetak modern.',
  'Pinisi mengangkut barang, menjadi rumah bagi awak, dan kini mendukung pariwisata serta pendidikan maritim.',
  'Pembuatan kapal melibatkan pemilihan kayu, perhitungan bentuk, perakitan, dan peluncuran dengan ritual tertentu.',
  'Pelestarian dilakukan oleh galangan tradisional, sekolah maritim, dan dokumentasi. Regenerasi pembuat kapal menjadi tantangan.',
  '["UNESCO mencatat seni pembuatan pinisi pada 2017.","Pinisi merupakan kapal layar tradisional Bugis-Makassar dan Konjo.","Kapal ini dikenal dengan konfigurasi tujuh layar."]',
  '{"Phinisi"}', true, 'published', now()
),
(
  'subak',
  'Subak',
  'Subak adalah sistem irigasi dan pengelolaan air sawah berbasis komunitas di Bali yang berlandaskan filosofi Tri Hita Karana.',
  'Jaringan subak mengatur pembagian air melalui pura, bendungan, dan saluran. Keputusan diambil dalam musyawarah anggota. UNESCO mencatat lanskap subak pada 2012.',
  'Pertanian sawah di Bali bergantung pada air gunung dan danau. Subak mengelola sumber daya itu secara kolektif.',
  'Pertumbuhan pariwisata dan alih fungsi lahan menekan sistem subak. Namun banyak komunitas tetap mempertahankan organisasi dan ritualnya.',
  'Subak menyeimbangkan hubungan manusia dengan Tuhan, sesama, dan alam. Air dipandang sebagai anugerah yang harus dikelola bersama.',
  'Ciri utamanya adalah organisasi petani, pura air, jadwal irigasi, dan gotong royong.',
  'Subak menjaga produksi pangan, kohesi sosial, dan lanskap budaya. Ia juga menjadi daya tarik edukasi dan wisata.',
  'Anggota subak membersihkan saluran, mengatur giliran air, dan melaksanakan ritual di pura terkait.',
  'Pelestarian memerlukan dukungan kebijakan tata ruang, regenerasi petani, dan pengakuan terhadap pengetahuan lokal.',
  '["UNESCO mencatat Cultural Landscape of Bali: the Subak System pada 2012.","Subak berlandaskan filosofi Tri Hita Karana.","Sistem ini mengatur irigasi sawah secara komunal."]',
  '{"Subak Bali"}', true, 'published', now()
),
(
  'tenun-ikat',
  'Tenun Ikat',
  'Tenun ikat adalah teknik menenun dengan mengikat benang sebelum diwarnai sehingga membentuk motif yang khas.',
  'Motif terbentuk dari bagian benang yang terlindungi ikatan. Setiap daerah memiliki pola, warna, dan makna yang berbeda. Tenun ikat menjadi bagian penting ekonomi dan identitas banyak komunitas.',
  'Tradisi tenun berkembang di Nusa Tenggara, Kalimantan, Sulawesi, dan wilayah lain. Jaringan perdagangan serta pertukaran budaya memengaruhi ragamnya.',
  'Pewarna alami dan teknik ikat diwariskan secara lisan. Masuknya benang pabrik dan pasar modern mengubah proses produksi.',
  'Kain tenun dapat menandai status, peran adat, dan fase kehidupan. Motif tertentu dianggap sakral atau hanya boleh dipakai kelompok tertentu.',
  'Ciri utamanya adalah motif geometris atau figuratif yang muncul dari ikatan benang, serta warna yang khas tiap daerah.',
  'Tenun mendukung ekonomi rumah tangga, upacara adat, dan pariwisata. Perempuan sering menjadi penjaga pengetahuan utama.',
  'Prosesnya mencakup pemintalan, pengikatan, pewarnaan, dan penenunan. Setiap tahap membutuhkan keterampilan dan waktu.',
  'Pelestarian dilakukan melalui koperasi, museum, dan pasar fair trade. Penting memastikan penenun mendapat harga yang adil.',
  '["Tenun ikat membentuk motif dengan mengikat benang sebelum pewarnaan.","Setiap daerah memiliki pola dan makna yang berbeda.","Tradisi ini menjadi sumber penghidupan bagi banyak penenun."]',
  '{"Ikat","Kain tenun"}', false, 'published', now()
),
(
  'sasi-maluku',
  'Sasi Maluku',
  'Sasi adalah aturan adat untuk membatasi pemanfaatan sumber daya alam pada periode tertentu agar dapat pulih.',
  'Masyarakat menutup area laut atau kebun dari pemanenan selama waktu yang disepakati. Pelanggaran dikenai sanksi adat. Sasi menjadi contoh pengelolaan lingkungan berbasis komunitas.',
  'Praktik sasi hidup di Maluku dan wilayah lain, terkait dengan kehidupan pesisir serta pertanian.',
  'Perubahan ekonomi dan kebijakan negara memengaruhi praktik sasi. Beberapa komunitas mengadaptasinya untuk konservasi modern.',
  'Sasi menekankan tanggung jawab bersama, rasa hormat pada alam, dan keberlanjutan untuk generasi berikutnya.',
  'Ciri utamanya adalah larangan sementara, penanda di lokasi, pengawasan komunitas, dan sanksi sosial.',
  'Sasi menjaga stok ikan, hasil kebun, dan ekosistem. Ia juga memperkuat organisasi sosial desa.',
  'Penetapan sasi dilakukan melalui musyawarah dan ritual. Warga bergiliran mengawasi area yang ditutup.',
  'Pelestarian membutuhkan dukungan pemerintah, riset ekologi, dan penghormatan pada otoritas adat.',
  '["Sasi adalah larangan adat sementara untuk memanen sumber daya.","Praktik ini dijumpai di Maluku dan wilayah lain di Indonesia.","Sanksi pelanggaran ditetapkan melalui kesepakatan komunitas."]',
  '{"Sasi"}', false, 'published', now()
),
(
  'noken',
  'Noken',
  'Noken adalah tas anyaman tradisional Papua yang dibuat dari serat kulit kayu atau benang dan dipakai untuk membawa barang.',
  'Noken dibuat dengan teknik merajut atau menganyam yang diwariskan perempuan. Ukuran dan motifnya bervariasi. UNESCO mencatat noken Papua pada 2012.',
  'Noken digunakan dalam kehidupan sehari-hari, pertanian, dan upacara adat di berbagai komunitas Papua.',
  'Perdagangan, migrasi, dan bahan modern memengaruhi bentuk serta penggunaan noken. Nilai budaya dan ekonomi tetap melekat.',
  'Noken melambangkan identitas, kerja perempuan, dan hubungan dengan alam. Memberi noken dapat menjadi tanda penghormatan.',
  'Ciri utamanya adalah anyaman serat, tali bahu, dan bentuk kantong yang lentur. Motif dan warna menunjukkan kekhasan daerah.',
  'Noken berfungsi membawa hasil kebun, bayi, dan barang dagangan. Kini ia juga menjadi suvenir dan simbol diplomasi budaya.',
  'Perempuan mengumpulkan serat, memilin tali, lalu merajut atau menganyam. Prosesnya bisa memakan waktu berhari-hari.',
  'Pelestarian dilakukan melalui pelatihan, koperasi, dan promosi budaya. Penting menjaga nilai jual agar pengrajin tetap berdaya.',
  '["UNESCO mencatat Noken Papua pada 2012.","Noken dibuat dari serat kulit kayu atau benang.","Tas ini digunakan untuk membawa barang dan bayi."]',
  '{"Noken Papua"}', true, 'published', now()
),
(
  'pencak-silat',
  'Pencak Silat',
  'Pencak silat adalah seni bela diri tradisional Nusantara yang memadukan gerak, teknik pertahanan, dan nilai budaya.',
  'Pencak silat memiliki banyak aliran dengan gerak, langkah, dan filosofi berbeda. Latihan mencakup jurus, sparring, dan kadang seni pertunjukan. UNESCO mencatat tradisi pencak silat pada 2019.',
  'Perguruan silat tumbuh di kampung, pesantren, dan organisasi masyarakat. Ia terkait dengan sejarah perlawanan dan pendidikan karakter.',
  'Perdagangan, migrasi, dan organisasi massa membentuk jaringan perguruan. Sejak kemerdekaan, silat menjadi olahraga dan warisan budaya.',
  'Silat menekankan disiplin, hormat, pengendalian diri, dan tanggung jawab. Nilai itu diajarkan bersama teknik bertahan.',
  'Ciri utamanya adalah langkah, kuda-kuda, serangan, tangkisan, dan jurus yang khas tiap aliran.',
  'Silat berfungsi sebagai bela diri, olahraga, seni, dan sarana pendidikan. Ia juga menjadi media diplomasi budaya.',
  'Latihan rutin dilakukan di perguruan. Murid mempelajari jurus, etika, dan kadang pertunjukan.',
  'Pelestarian dilakukan melalui sekolah, federasi, dan festival. Tantangannya adalah menjaga nilai tradisi di tengah olahraga kompetitif.',
  '["UNESCO mencatat tradisi pencak silat pada 2019.","Pencak silat memiliki banyak aliran dengan filosofi berbeda.","Latihan mencakup jurus, pertahanan diri, dan etika."]',
  '{"Silat"}', false, 'published', now()
),
(
  'angklung',
  'Angklung',
  'Angklung adalah alat musik bambu yang berbunyi saat digoyang, dimainkan bersama dalam ansambel.',
  'Setiap angklung menghasilkan satu nada atau akor. Ansambel angklung memadukan banyak pemain untuk membentuk melodi. UNESCO mencatat angklung Indonesia pada 2010.',
  'Angklung berkembang di Jawa Barat dan terkait dengan tradisi pertanian serta upacara masyarakat Sunda.',
  'Pendidikan sekolah, paduan suara, dan festival membantu angklung menyebar. Daeng Sutigna dikenal sebagai tokoh pengembangan angklung modern.',
  'Angklung mengajarkan kerja sama, disiplin, dan kesabaran karena setiap pemain bertanggung jawab pada satu nada.',
  'Ciri utamanya adalah tabung bambu berukuran berbeda yang digetarkan dalam rangka bambu.',
  'Angklung dipakai dalam pendidikan, pertunjukan, dan diplomasi budaya. Ia mudah dipelajari dalam kelompok.',
  'Pemain berlatih membaca aba-aba dan menjaga tempo. Perawatan bambu penting agar nada tetap stabil.',
  'Pelestarian dilakukan melalui sekolah, sanggar, dan industri rumahan. Ketersediaan bambu dan regenerasi pengrajin perlu dijaga.',
  '["UNESCO mencatat Angklung Indonesia pada 2010.","Setiap angklung biasanya menghasilkan satu nada.","Angklung dimainkan bersama dalam ansambel."]',
  '{"Angklung Sunda"}', false, 'published', now()
),
(
  'keris',
  'Keris',
  'Keris adalah senjata tikam berbilah asimetris dengan pamor dan bilah yang memiliki makna budaya mendalam.',
  'Keris dibuat oleh empu melalui tempa berlapis dan perawatan khusus. Bentuk bilah, dhapur, dan pamor memiliki nama serta makna. UNESCO mencatat keris Indonesia pada 2008.',
  'Keris berkembang di Jawa, Bali, Sumatera, dan wilayah lain. Ia terkait dengan kerajaan, adat, dan identitas keluarga.',
  'Perdagangan logam, teknologi tempa, dan pengaruh budaya regional membentuk keris. Nilai ritualnya bertahan meski fungsi praktisnya berkurang.',
  'Keris dipandang sebagai benda pusaka yang menyimpan doa, sejarah keluarga, dan nilai keberanian.',
  'Ciri utamanya adalah bilah asimetris, pamor, ganja, dan warangka. Setiap detail memiliki istilah dan aturan.',
  'Keris dipakai dalam upacara, busana adat, dan koleksi museum. Ia menjadi simbol warisan budaya dan identitas.',
  'Perawatan meliputi pembersihan, pemberian minyak, dan penyimpanan yang tepat. Pengetahuan ini diwariskan terbatas.',
  'Pelestarian dilakukan oleh museum, empu, dan komunitas kolektor. Dokumentasi serta etika perawatan perlu diperluas.',
  '["UNESCO mencatat Keris Indonesia pada 2008.","Bilah keris memiliki bentuk asimetris dan pamor.","Keris dirawat dengan pembersihan dan pemberian minyak."]',
  '{"Kris"}', false, 'published', now()
),
(
  'jamu',
  'Jamu',
  'Jamu adalah tradisi pengobatan dan perawatan tubuh Indonesia yang menggunakan bahan alami seperti rimpang, daun, dan rempah.',
  'Jamu disiapkan dalam bentuk minuman, pil, atau ramuan oles. Pengetahuan tentang bahan dan takaran diwariskan secara lisan. UNESCO mencatat budaya jamu pada 2023.',
  'Jamu tumbuh dalam kehidupan rumah tangga, pasar tradisional, dan keraton. Resep sering terkait dengan kesehatan ibu, pencernaan, dan kebugaran.',
  'Perdagangan rempah dan jaringan pasar Nusantara membentuk variasi jamu. Industrialisasi melahirkan produk kemasan, tetapi praktik meracik tetap hidup.',
  'Jamu menekankan keseimbangan tubuh, pencegahan, dan hubungan dengan alam. Banyak keluarga memiliki resep turun-temurun.',
  'Ciri utamanya adalah bahan alami, racikan segar, dan pengetahuan tentang khasiat serta takaran.',
  'Jamu berfungsi untuk kesehatan, perawatan tubuh, dan ekonomi rumah tangga. Penjual jamu gendong menjadi ikon budaya.',
  'Peracik memilih bahan, menimbang, merebus, dan menyajikan jamu. Kebersihan serta takaran sangat diperhatikan.',
  'Pelestarian memerlukan dokumentasi resep, pelatihan, dan riset mutu. Penting menghindari klaim medis yang tidak terbukti.',
  '["UNESCO mencatat Budaya Jamu Indonesia pada 2023.","Jamu menggunakan bahan alami seperti rimpang dan rempah.","Pengetahuan jamu diwariskan secara lisan dan melalui praktik keluarga."]',
  '{"Jamu gendong"}', false, 'published', now()
),
(
  'pantun',
  'Pantun',
  'Pantun adalah bentuk puisi lisan Melayu dengan pola rima dan sampiran-isi yang dipakai untuk menyampaikan nasihat, sindiran, atau kasih sayang.',
  'Pantun terdiri dari empat baris dengan rima a-b-a-b. Dua baris pertama adalah sampiran, dua baris berikutnya isi. UNESCO mencatat pantun pada 2020.',
  'Pantun hidup dalam masyarakat Melayu di Sumatera, Riau, Kalimantan, dan wilayah lain. Ia dipakai dalam adat, pernikahan, dan pergaulan.',
  'Tradisi lisan, perdagangan, dan jaringan budaya Melayu menyebarkan pantun. Ia juga berkembang dalam musik dan sastra modern.',
  'Pantun melatih kepekaan bahasa, kesantunan, dan kemampuan menyampaikan pesan secara tidak langsung.',
  'Ciri utamanya adalah empat baris, rima a-b-a-b, sampiran, dan isi yang saling terkait.',
  'Pantun berfungsi dalam upacara adat, hiburan, pendidikan, dan diplomasi budaya. Ia menjadi media komunikasi yang luwes.',
  'Pembacaan pantun memerlukan irama dan ekspresi. Dalam acara adat, pantun dibalas secara bergiliran.',
  'Pelestarian dilakukan melalui sekolah, festival, dan media digital. Regenerasi penutur muda menjadi kunci.',
  '["UNESCO mencatat Pantun pada 2020.","Pantun memiliki empat baris dengan rima a-b-a-b.","Dua baris pertama disebut sampiran, dua baris berikutnya isi."]',
  '{"Pantun Melayu"}', false, 'published', now()
),
(
  'tari-kecak',
  'Tari Kecak',
  'Tari Kecak adalah pertunjukan kelompok Bali dengan paduan suara “cak”, gerak melingkar, dan kisah Ramayana.',
  'Puluhan penari duduk melingkar dan menyerukan “cak” secara berlapis. Pertunjukan sering mengangkat episode Ramayana dan berlangsung saat senja.',
  'Kecak berkembang di Bali pada abad ke-20 dengan pengaruh tradisi sanghyang dan seni pertunjukan modern.',
  'Kolaborasi seniman lokal dan asing membantu bentuk kecak seperti sekarang. Ia kemudian menjadi pertunjukan wisata yang populer.',
  'Kecak menekankan kekuatan suara bersama, ritme, dan rasa kebersamaan. Ia juga menjadi media penyampaian epik Ramayana.',
  'Ciri utamanya adalah paduan suara “cak” tanpa gamelan, formasi melingkar, dan gerak penari utama.',
  'Kecak tampil untuk wisata, festival, dan upacara budaya. Ia menopang ekonomi seniman dan komunitas.',
  'Latihan dilakukan berkelompok untuk menyatukan tempo dan dinamika suara. Penari utama berlatih gerak dan lakon.',
  'Pelestarian perlu menjaga kualitas pertunjukan dan kesejahteraan seniman di tengah tekanan pariwisata.',
  '["Tari Kecak berasal dari Bali.","Pertunjukan menggunakan paduan suara “cak” tanpa gamelan.","Kisah Ramayana sering menjadi lakon utama."]',
  '{"Kecak","Tari Cak"}', false, 'published', now()
)
on conflict (slug) do nothing;

-- Region links ---------------------------------------------------------------
insert into public.encyclopedia_article_regions (article_id, region_id)
select article.id, region.id
from (values
  ('batik-indonesia', 'jawa-tengah'),
  ('gamelan-jawa', 'jawa-barat'),
  ('wayang-kulit', 'yogyakarta'),
  ('tari-saman', 'aceh'),
  ('randai', 'sumatera-barat'),
  ('ondel-ondel', 'jakarta'),
  ('rumah-betang', 'kalimantan'),
  ('pinisi', 'sulawesi-selatan'),
  ('subak', 'bali'),
  ('tenun-ikat', 'nusa-tenggara-timur'),
  ('sasi-maluku', 'maluku'),
  ('noken', 'papua'),
  ('pencak-silat', 'sumatera-barat'),
  ('angklung', 'jawa-barat'),
  ('keris', 'yogyakarta'),
  ('jamu', 'jawa-tengah'),
  ('pantun', 'maluku'),
  ('tari-kecak', 'bali')
) as links(article_slug, region_slug)
join public.encyclopedia_articles article on article.slug = links.article_slug
join public.cultural_regions region on region.slug = links.region_slug
on conflict do nothing;

-- Category links -------------------------------------------------------------
insert into public.encyclopedia_article_categories (article_id, category_id)
select article.id, category.id
from (values
  ('batik-indonesia', 'kerajinan-batik'),
  ('batik-indonesia', 'sejarah-warisan'),
  ('gamelan-jawa', 'musik-alat-musik'),
  ('gamelan-jawa', 'seni-pertunjukan'),
  ('wayang-kulit', 'seni-pertunjukan'),
  ('wayang-kulit', 'cerita-mitologi'),
  ('tari-saman', 'tari-tradisional'),
  ('tari-saman', 'seni-pertunjukan'),
  ('randai', 'seni-pertunjukan'),
  ('randai', 'cerita-mitologi'),
  ('ondel-ondel', 'seni-pertunjukan'),
  ('ondel-ondel', 'upacara-tradisi'),
  ('rumah-betang', 'rumah-arsitektur'),
  ('rumah-betang', 'pengetahuan-tradisional'),
  ('pinisi', 'sejarah-warisan'),
  ('pinisi', 'pengetahuan-tradisional'),
  ('subak', 'kearifan-lokal'),
  ('subak', 'pengetahuan-tradisional'),
  ('tenun-ikat', 'kerajinan-batik'),
  ('tenun-ikat', 'pakaian-adat'),
  ('sasi-maluku', 'kearifan-lokal'),
  ('sasi-maluku', 'pengetahuan-tradisional'),
  ('noken', 'kerajinan-batik'),
  ('noken', 'pakaian-adat'),
  ('pencak-silat', 'sejarah-warisan'),
  ('pencak-silat', 'permainan-tradisional'),
  ('angklung', 'musik-alat-musik'),
  ('angklung', 'seni-pertunjukan'),
  ('keris', 'sejarah-warisan'),
  ('keris', 'kerajinan-batik'),
  ('jamu', 'pengetahuan-tradisional'),
  ('jamu', 'kuliner-tradisional'),
  ('pantun', 'bahasa-sastra'),
  ('pantun', 'cerita-mitologi'),
  ('tari-kecak', 'tari-tradisional'),
  ('tari-kecak', 'seni-pertunjukan')
) as links(article_slug, category_slug)
join public.encyclopedia_articles article on article.slug = links.article_slug
join public.encyclopedia_categories category on category.slug = links.category_slug
on conflict do nothing;

-- Sources --------------------------------------------------------------------
insert into public.encyclopedia_sources
  (article_id, source_title, publisher, source_url, source_type, notes, sort_order)
select article.id, source.title, source.publisher, source.url, source.type, source.notes, source.ord
from (values
  ('batik-indonesia', 'Indonesian Batik', 'UNESCO Intangible Cultural Heritage', 'https://ich.unesco.org/en/RL/indonesian-batik-00170', 'documented_fact', 'Inscribed in 2009.', 1),
  ('batik-indonesia', 'Batik: Warisan Budaya Takbenda Indonesia', 'Kementerian Pendidikan dan Kebudayaan', 'https://kebudayaan.kemdikbud.go.id/', 'documented_fact', 'Rujukan portal kebudayaan nasional.', 2),
  ('gamelan-jawa', 'Gamelan', 'UNESCO Intangible Cultural Heritage', 'https://ich.unesco.org/en/RL/gamelan-01607', 'documented_fact', 'Inscribed in 2021.', 1),
  ('wayang-kulit', 'Wayang', 'UNESCO Intangible Cultural Heritage', 'https://ich.unesco.org/en/RL/wayang-00063', 'documented_fact', 'Inscribed in 2008.', 1),
  ('tari-saman', 'Saman Dance', 'UNESCO Intangible Cultural Heritage', 'https://ich.unesco.org/en/RL/saman-dance-00509', 'documented_fact', 'Inscribed in 2011.', 1),
  ('randai', 'Randai: Teater Rakyat Minangkabau', 'Kementerian Pendidikan dan Kebudayaan', 'https://kebudayaan.kemdikbud.go.id/', 'academic_interpretation', 'Rujukan pengenalan seni tradisi.', 1),
  ('ondel-ondel', 'Ondel-ondel: Ikon Budaya Betawi', 'Pemerintah Provinsi DKI Jakarta', 'https://jakarta.go.id/', 'documented_fact', 'Rujukan budaya Betawi.', 1),
  ('rumah-betang', 'Rumah Betang', 'Kementerian Pendidikan dan Kebudayaan', 'https://kebudayaan.kemdikbud.go.id/', 'documented_fact', 'Rujukan arsitektur tradisional.', 1),
  ('pinisi', 'Pinisi', 'UNESCO Intangible Cultural Heritage', 'https://ich.unesco.org/en/RL/pinisi-01197', 'documented_fact', 'Inscribed in 2017.', 1),
  ('subak', 'Cultural Landscape of Bali: the Subak System', 'UNESCO World Heritage Centre', 'https://whc.unesco.org/en/list/1194/', 'documented_fact', 'Inscribed in 2012.', 1),
  ('tenun-ikat', 'Tenun Ikat Nusantara', 'Kementerian Pendidikan dan Kebudayaan', 'https://kebudayaan.kemdikbud.go.id/', 'documented_fact', 'Rujukan kerajinan tekstil tradisional.', 1),
  ('sasi-maluku', 'Sasi: Kearifan Lokal Pengelolaan Sumber Daya', 'Kementerian Lingkungan Hidup dan Kehutanan', 'https://www.menlhk.go.id/', 'academic_interpretation', 'Rujukan praktik konservasi komunitas.', 1),
  ('noken', 'Noken', 'UNESCO Intangible Cultural Heritage', 'https://ich.unesco.org/en/RL/noken-00619', 'documented_fact', 'Inscribed in 2012.', 1),
  ('pencak-silat', 'Traditions of Pencak Silat', 'UNESCO Intangible Cultural Heritage', 'https://ich.unesco.org/en/RL/traditions-of-pencak-silat-01391', 'documented_fact', 'Inscribed in 2019.', 1),
  ('angklung', 'Indonesian Angklung', 'UNESCO Intangible Cultural Heritage', 'https://ich.unesco.org/en/RL/indonesian-angklung-00393', 'documented_fact', 'Inscribed in 2010.', 1),
  ('keris', 'Indonesian Kris', 'UNESCO Intangible Cultural Heritage', 'https://ich.unesco.org/en/RL/indonesian-kris-00112', 'documented_fact', 'Inscribed in 2008.', 1),
  ('jamu', 'Jamu', 'UNESCO Intangible Cultural Heritage', 'https://ich.unesco.org/en/RL/jamu-01389', 'documented_fact', 'Inscribed in 2023.', 1),
  ('pantun', 'Pantun', 'UNESCO Intangible Cultural Heritage', 'https://ich.unesco.org/en/RL/pantun-01613', 'documented_fact', 'Inscribed in 2020.', 1),
  ('tari-kecak', 'Tari Kecak', 'Kementerian Pendidikan dan Kebudayaan', 'https://kebudayaan.kemdikbud.go.id/', 'documented_fact', 'Rujukan seni pertunjukan Bali.', 1)
) as source(article_slug, title, publisher, url, type, notes, ord)
join public.encyclopedia_articles article on article.slug = source.article_slug
where not exists (
  select 1 from public.encyclopedia_sources existing
  where existing.article_id = article.id and existing.source_title = source.title
);
