# NovaBot - Regex Chatbot

**NovaBot** adalah chatbot berbasis aturan (rule-based) dengan regex pattern matching yang dirancang untuk memberikan informasi tentang platform ticketing **NovaTix**. Bot ini dilengkapi dengan sistem reflection kata ganti dan dapat dijalankan baik di CLI maupun terintegrasi dengan WhatsApp.

## 📋 Fitur Utama

- **🔄 Pronoun Reflection**: Otomatis mengubah kata ganti dalam percakapan (saya ↔ anda, kamu → saya, dll)
- **🎯 Pattern Matching**: Menggunakan regex untuk mengenali intent pengguna
- **🧠 Context Awareness**: Mengelola konteks percakapan multi-step (seperti kalkulasi pricing)
- **💬 CLI Interface**: Antarmuka command line untuk testing dan development
- **📱 WhatsApp Integration**: Bot yang dapat dijalankan di WhatsApp menggunakan whatsapp-web.js
- **📊 Smart Pricing Calculator**: Menghitung biaya ticketing dengan sistem persentase dan flat fee
- **📝 Comprehensive Logging**: Log aktivitas bot dengan timestamp dan detail

## 🚀 Instalasi dan Setup

### Prerequisites

- Node.js (v14 atau lebih tinggi)
- npm atau yarn
- WhatsApp account (untuk integrasi WhatsApp)

### 1. Clone Repository

```bash
git clone [repository-url]
cd NovaBot_Regex
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file sesuai kebutuhan (opsional)
nano .env
```

## 🖥️ Menjalankan Bot

### CLI Mode

```bash
# Menjalankan bot di command line
npm start
# atau
npm run dev
# atau
node cli.js
```

### WhatsApp Mode

```bash
# Menjalankan WhatsApp bot
npm run whatsapp
# atau
node whatsapp-bot.js
```

**Langkah WhatsApp Integration:**

1. Jalankan perintah `npm run whatsapp`
2. Tunggu QR code muncul di terminal
3. Buka WhatsApp di smartphone
4. Scan QR code: **Linked Devices** → **Link a Device**
5. Bot siap menerima pesan!

⚠️ **Penting**: Jaga smartphone tetap terhubung internet selama bot berjalan.

## 🧪 Testing

```bash
# Menjalankan semua test
npm test

# Test coverage meliputi:
# - Greeting functionality
# - Pronoun reflection
# - Feature inquiry
# - Pricing calculation
# - Context-aware conversation flow
# - Default response handling
```

## 🏗️ Struktur Project

```
NovaBot_Regex/
├── cli.js              # CLI interface
├── whatsapp-bot.js     # WhatsApp integration
├── core.js             # Core chatbot engine
├── tests/
│   └── core.test.js    # Test suite
├── logs/               # Log files
│   ├── README.md
│   └── sample.log
├── .env.example        # Environment template
├── .env               # Environment config (git-ignored)
├── .gitignore         # Git ignore rules
├── package.json       # Dependencies & scripts
└── README.md          # Documentation
```

## 💡 Cara Penggunaan

### Contoh Percakapan

**CLI:**
```
Kamu: halo
TicketBot: Halo! Saya NovaBot 🤖 dari NovaTix...

Kamu: fitur apa saja
TicketBot: Fitur utama NovaTix meliputi:
1️⃣ Pemilihan tiket berbasis kursi...

Kamu: harga 50000
TicketBot: ✅ Harga tiket: Rp50.000
🔢 Sekarang, berapa kapasitas venue acara Anda?

Kamu: 1000
TicketBot: 🎯 **HASIL KALKULASI PRICING**...
```

### Kategori Percakapan yang Didukung

1. **Salam & Perkenalan**: `halo`, `hi`, `selamat pagi`, dll
2. **Informasi Umum**: `deskripsi novatix`, `apa itu novatix`
3. **Fitur Platform**: `fitur`, `keunggulan`, `layanan`
4. **Detail Fitur**: `seating`, `payment`, `e-ticket`, `analytics`
5. **Pricing**: `harga`, `biaya`, `pricing` + kalkulasi interaktif
6. **Tutorial**: `cara beli tiket`, `setup event`, `scanner`, dll

## 🔧 Konfigurasi

### Environment Variables (.env)

```env
NODE_ENV=development
BOT_NAME=NovaBot
BOT_VERSION=1.0.0
LOG_LEVEL=info
LOG_TO_FILE=true
LOG_DIRECTORY=./logs
```

### Session Data

- **WhatsApp Session**: Disimpan di `.wwebjs_auth/`
- **Logs**: Disimpan di `logs/`
- **Context**: In-memory (reset saat restart)

## 📊 Sistem Pricing

Bot dapat menghitung biaya ticketing berdasarkan:

- **Harga Tiket**: Input dalam rupiah
- **Kapasitas Venue**: Jumlah maksimal tiket
- **Dua Skema**:
  - 📊 **Persentase**: Fee berdasarkan % dari harga tiket
  - 💵 **Flat Fee**: Fee tetap per tiket

### Contoh Kalkulasi

```
Input: Harga Rp50.000, Kapasitas 1.000
Output:
📊 Skema Persentase: 8% (Rp4.000/tiket)
💵 Skema Flat Fee: Rp7.000/tiket
✨ Rekomendasi: Persentase lebih hemat
```

## 🔄 Pronoun Reflection

Sistem otomatis mengubah kata ganti untuk percakapan yang natural:

- `saya` ↔ `anda`
- `kamu` → `saya`
- `aku` → `anda`
- `kita` ↔ `kami`

**Contoh:**
```
Input: "saya butuh bantuan"
Output: "anda butuh bantuan" (dalam respons bot)
```

## 📝 Logging

Bot mencatat aktivitas di direktori `logs/`:

- `whatsapp-bot.log`: Log WhatsApp bot
- Format: `[timestamp] emoji message`
- Rotating logs untuk production (implementasi future)

## 🛠️ Development

### Menambah Response Pattern

Edit `core.js` di array `responses`:

```javascript
{
  regex: /\b(keyword1|keyword2)\b/i,
  answer: "Response text here",
  type: "category-name",
  resetContext: true // opsional
}
```

### Testing Pattern

```javascript
// Tambahkan test di tests/core.test.js
test("description", () => {
  const response = getResponse("input");
  expect(response).toMatch(/expected pattern/i);
});
```

## 🚨 Troubleshooting

### WhatsApp Issues

**QR Code tidak muncul:**
```bash
# Hapus session lama
rm -rf .wwebjs_auth/
npm run whatsapp
```

**Connection timeout:**
- Pastikan internet stabil
- Restart bot: Ctrl+C → `npm run whatsapp`

### Dependencies Issues

**Permission denied:**
```bash
# Fix permissions
chmod +x node_modules/.bin/jest
npm test
```

**Module not found:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📈 Future Enhancements

- [ ] Discord integration (discord.js)
- [ ] Database storage untuk context persistence
- [ ] Advanced analytics dan reporting
- [ ] Multi-language support
- [ ] Voice message handling (WhatsApp)
- [ ] Admin panel interface
- [ ] Log rotation dan monitoring

## 📄 License

ISC License

## 👥 Contributing

1. Fork repository
2. Create feature branch
3. Add tests untuk fitur baru
4. Submit pull request

---

**🤖 Developed for NovaTix Ticketing Platform**  
**📚 University Assignment - Rule-based Chatbot with Regex & Platform Integration**