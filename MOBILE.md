# 📱 MOBILE.md — NAIM Evolution Log

> This file is your autoresearch log. Every iteration gets documented here.
> No log = no lift. No lift = no weight.

---

## 🧬 Identity

**NAIM Name:** `NexBlock`  
**Crew:** `Hüseyin`  
**App Concept:** `Kendi kendini evrimleştiren (self-evolving) cyberpunk temalı blok kırma oyunu ve komut merkezi.`  
**Starting Tool:** `Google Stitch`

---

## 📊 Scoreboard

| Metric            | Value |
| ----------------- | ----- |
| Total Iterations  | 5     |
| Total Weight (kg) | 55    |
| Total Time (min)  | 85    |
| Failed Attempts   | 0     |

---

## 🔁 Iterations

---

### 🏋️ Iteration 1

| Field     | Value                                     |
| --------- | ----------------------------------------- |
| Feature   | Basic UI Screen (Türkçe Cyberpunk Arayüz) |
| Weight    | 5 kg                                      |
| Tool Used | Google Stitch                             |
| Time      | 15 min                                    |
| Attempts  | 1                                         |
| Status    | ✅ Success                                |

## **Prompt given to AI:**

'NexBlock' adında, kendi kendini geliştiren (self-evolving) bir oyun için temiz, modern bir mobil uygulama arayüzü. Ekran yatay olarak iki ana bölüme ayrılmış olmalı.

Üst bölüm (Ekranın %70'i): 'Oyun Alanı'. Koyu, şık bir cyberpunk arka planı var. En üstte, minimal bir başlık barında 'NexBlock v1.0' yazıyor. Sağ üst köşede 'SENKRONİZASYON...' durumu görünüyor. Altında klasik bir blok kırma oyunu düzeni var: en üstte birkaç sıra renkli dikdörtgen blok (turkuaz, pembe, neon sarı/yeşil), ortada küçük beyaz bir top ve bu bölümün en altında yatay bir platform (raket). Oyun alanının sol altında 'BÜTÜNLÜK %88.4', sağ altında 'DÖNGÜLER 0422' gibi fütüristik istatistikler yer alıyor.

Alt bölüm (Ekranın %30'u): 'Evrim Merkezi'. Temiz, açık renkli bir arka planı var ve modern bir sohbet arayüzü gibi görünüyor. 'SİSTEM AJANI' başlığı altında, AI'dan gelen şu mesaj görünüyor: 'Blok yapısı tespit edildi. Evrim sekansı başlatılıyor. Bir sonraki komutunuz nedir?'. Altında, 'Evrim komutunu girin...' yer tutucu metnine sahip belirgin bir metin giriş alanı ve hemen yanında fütüristik mavi 'EVRİMLEŞTİR' gönder butonu (şimşek ikonlu) var.

Genel stil: Profesyonel, minimalist, oyun alanı için cyberpunk dokunuşlu standart mobil uygulama kullanıcı arayüzü.
Alt navigasyon barı: Üç ikon ve etiket: OYUN, EVRİM, AYARLAR. OYUN sekmesi aktif ve seçili.

### 🏋️ Iteration 2

| Field     | Value                       |
| --------- | --------------------------- |
| Feature   | Dark Mode (Cyberpunk Theme) |
| Weight    | 5 kg                        |
| Tool Used | Antigravity                 |
| Time      | 10 min                      |
| Attempts  | 1                           |
| Status    | ✅ Success                  |

**Prompt given to AI:**
"Uygulamayı image_17.png'deki gibi tekrar kodla. Üstteki karanlık cyberpunk 'Oyun Alanı'nı ve alttaki 'Evrim Merkezi'ni karanlık temayla uyumlu hale getir..."

**What happened:**

- Uygulamanın tüm arayüzü, hocanın tablosundaki "Dark Mode" özelliğine uygun olarak baştan aşağı karanlık ve fütüristik (siberpunk) bir temayla (koyu arka planlar, neon yazılar) kodlandı.

---

### 🏋️ Iteration 3

| Field     | Value             |
| --------- | ----------------- |
| Feature   | Text input/output |
| Weight    | 10 kg             |
| Tool Used | Antigravity       |
| Time      | 10 min            |
| Attempts  | 1                 |
| Status    | ✅ Success        |

**Prompt given to AI:**
"Inside the bottom 'SİSTEM AJANI' section, there is NO text input field. Right above the red 'EVRİMLEŞTİR' button, you MUST add a proper `<TextInput>` component. Placeholder: 'Evrim komutunu girin...'."

**What happened:**

- Kullanıcının sistemle etkileşime girebilmesi için arayüze fonksiyonel bir metin giriş kutusu (Text Input) eklendi. Siberpunk tasarıma uygun şekilde stillendirildi.

---

### 🏋️ Iteration 4

| Field     | Value                                  |
| --------- | -------------------------------------- |
| Feature   | Custom Animation (Game Loop & Physics) |
| Weight    | 10 kg                                  |
| Tool Used | Antigravity                            |
| Time      | 15 min                                 |
| Attempts  | 1                                      |
| Status    | ✅ Success                             |

**Prompt given to AI:**
"It's time to bring the 'Oyun Alanı' (Game Area) to life. Implement a continuous game loop using requestAnimationFrame. Create state for the ball's position/velocity and the paddle's horizontal position. Add collision detection for walls, paddle, and blocks..."

**What happened:**

- Statik arayüz, saniyede 60 kare (60 FPS) çalışan gerçek bir fizik motoruyla canlandırıldı. `requestAnimationFrame` ve `PanResponder` kullanılarak topa çarpışma/sekme animasyonları eklendi. Oyuncu alttaki çubuğu sürükleyerek topu kontrol edebiliyor. En önemlisi, İterasyon 4'te kurulan AI State yapısı korundu; top havadayken bile metin kutusundan verilen evrim komutuyla anında renk değiştirebiliyor. Bu sayede 'Custom Animation' puanı fazlasıyla hak edildi.

---

---

### 🏋️ Iteration 5

| Field     | Value                            |
| --------- | -------------------------------- |
| Feature   | AI feature (chat, summary, etc.) |
| Weight    | 25 kg                            |
| Tool Used | Antigravity                      |
| Time      | 35 min                           |
| Attempts  | 3                                |
| Status    | ✅ Success                       |

**Prompt given to AI:**
"Upgrade our Natural Language Command Parser to handle MULTI-INTENT complex sentences. Fix the 'More Blocks' bug to generate a completely new array. Add Paddle Color Mutation. Introduce gameStatus state ('IDLE', 'PLAYING', 'GAMEOVER', 'WIN') with 'Tap to Start' and animated text overlays."

**What happened:**

- Metin giriş kutusu, basit bir if-else yapısından çıkarılıp gelişmiş bir **"Çoklu Niyet Algılayıcı" (Multi-Intent NLP Parser)** yapay zeka ajanına dönüştürüldü.
- Kullanıcı tek bir doğal dille yazılmış cümlede ("bu leveli bitirdim yeni seviyede daha küçük bir çubuk daha çok blok ve top rengini siyah istiyorum" gibi) birden fazla evrim komutunu aynı anda sisteme işletebiliyor.
- Yapay zeka bu komutları analiz edip oyunun fizik motorunu (hız, top rengi, çubuk boyutu ve dinamik level matrisi) anında güncelliyor.
- Oyunun Kazanma (Seviye Tamamlandı) ve Kaybetme (Sistem Çöktü) durumları, oyuncuyu "AI Evrim Merkezi"nden komut vermeye yönlendirecek şekilde sisteme entegre edildi.

---

## 🧠 Reflection (fill at the end)

**Hardest part:**

>

**What AI did well:**

>

**Where AI failed:**

>

**If I started over, I would:**

>

**Best feature I built:**

>

**Biggest surprise:**

>

```

```
