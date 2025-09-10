// === NovaTix Chatbot - Enhanced with Context Awareness ===

// === Pronoun Reflection Mapping ===
const pronounReflection = {
  'saya': 'anda',
  'anda': 'saya',
  'kamu': 'saya',
  'aku': 'anda',
  'kita': 'kami',
  'kami': 'kita',
  'mereka': 'mereka', // stays same
  'dia': 'dia',       // stays same
  'kalian': 'kami'
};

// === Context Storage (In-Memory) ===
let userContext = {
  waitingFor: null,          // 'capacity', 'price', 'pricing-detail'
  tempData: {},              // Store temporary data
  lastQuestion: null         // Track last question type
};

// === Response Data Structure ===
const responses = [
  // === Kategori 1: Salam & Perkenalan ===
  {
    regex: /^(hi|halo|hai|hello|selamat|assalamualaikum|pagi|siang|sore|malam|kontak)/i,
    answer: "Halo! Saya NovaBot 🤖 dari NovaTix. Kami siap membantu Anda mengelola event dengan sistem ticketing yang mudah dan efisien. Apa yang bisa saya bantu hari ini?",
    type: "greeting",
    resetContext: true,
    skipPronounReflection: true
  },

  // === Kategori 2: Informasi Umum ===
  {
    regex: /\b(deskripsi|apa itu novatix|jelaskan lebih|novatix)\b/i,
    answer: "NovaTix adalah platform ticketing yang mempermudah penyelenggara acara (EO), terutama untuk venue dengan tempat duduk (seated venue). Dengan NovaTix, event bisa dijalankan lebih efisien, profesional, dan mudah dikelola.",
    type: "general-info",
    resetContext: true
  },

  {
    regex: /\b(fitur|apa saja fitur|keunggulan|layanan|bisa apa)\b/i,
    answer: "Fitur utama NovaTix meliputi:\n1️⃣ Pemilihan tiket berbasis kursi (seat-based) yang intuitif.\n2️⃣ Integrasi dengan payment gateway untuk mempermudah transaksi.\n3️⃣ E-ticket verification dengan QR code unik agar check-in di hari-H lebih cepat.\n4️⃣ Dashboard analitik untuk data acara, transaksi, dan informasi pembeli.\n\nApakah Anda ingin mengetahui detail lebih lanjut dari salah satu fitur di atas?",
    type: "features",
    resetContext: true,
    skipPronounReflection: true
  },

  // === Kategori 3: Pricing (Tanpa Angka) ===
  {
    regex: /\b(harga|biaya|pricing|paket)\b(?!.*[\d.,]+)/i,
    answer: "Kami menawarkan dua skema pricing utama:\n\n📊 **Skema Persentase** - Fee berdasarkan % dari harga tiket\n💵 **Skema Flat Fee** - Fee tetap per tiket\n\nKedua skema dirancang fleksibel sesuai kebutuhan dan skala acara.\n\n💡 Untuk menghitung biaya yang tepat, saya butuh info:\n• Berapa harga tiket acara Anda?\n• Berapa kapasitas venue Anda?\n\nSilakan berikan informasi tersebut! 😊",
    type: "pricing-general",
    setContext: "pricing-detail",
    skipPronounReflection: true
  },

  // === Kategori 4: Detail Fitur Spesifik ===
  {
    regex: /\b(seating|kursi|seat)\b/i,
    answer: "🎟️ *Seating Ticket*: NovaTix menyediakan tampilan pemilihan kursi yang intuitif dan interaktif, sehingga pembeli dapat memilih tempat duduk sesuai preferensi mereka. Hal ini meningkatkan pengalaman pembelian tiket dan membantu EO mengelola kapasitas venue dengan lebih baik.",
    type: "feature-seating",
    resetContext: true
  },

  {
    regex: /\b(payment|bayar|pembayaran|qris|gateway)\b/i,
    answer: "💳 *Payment Gateway*: NovaTix terintegrasi dengan QRIS dan berbagai kanal pembayaran bank. Hal ini mempermudah pembeli dalam bertransaksi dan membantu EO melakukan verifikasi pembayaran secara otomatis, cepat, dan aman.",
    type: "feature-payment",
    resetContext: true
  },

  {
    regex: /\b(eticket|e-ticket|verifikasi|scan)\b/i,
    answer: "📲 *E-Ticket Verification*: Pada hari acara, EO dapat menggunakan sistem scanner berbasis QR code unik yang bisa diakses langsung melalui smartphone. Proses check-in menjadi lebih cepat, praktis, dan meminimalisir antrean.",
    type: "feature-eticket",
    resetContext: true
  },

  {
    regex: /\b(analytics|data|dashboard|laporan)\b/i,
    answer: "📊 *Data Analytics*: NovaTix menyediakan dashboard yang menampilkan ringkasan data acara, mulai dari informasi pembeli, detail transaksi, hingga insight penjualan. Semua data terekam rapi dan dapat digunakan untuk evaluasi maupun strategi event berikutnya.",
    type: "feature-analytics",
    resetContext: true
  },

  // === Kategori 5: Tutorial & Cara Penggunaan ===
  {
    regex: /\b(cara beli|beli tiket|pemesanan|pesan tiket|pembelian)\b/i,
    answer: "🛒 *Cara Pembelian Tiket:*\n1️⃣ Masuk dengan akun Gmail Anda.\n2️⃣ Buka detail event dan pilih kursi.\n3️⃣ Isi data yang dibutuhkan.\n4️⃣ Jika ingin membeli merchandise, klik *Browse All* lalu pilih jumlah.\n5️⃣ Klik *Add to Order* jika sudah selesai.\n6️⃣ Cek ulang total di *Price Summary*.\n7️⃣ Klik *Proceed Transaction* lalu scan QRIS untuk membayar.\n8️⃣ Setelah membayar, klik *Check Status*.\n\n👉 Lanjutkan dengan *setelah pembayaran* untuk tahapan berikutnya.",
    type: "tutorial-buying",
    resetContext: true,
    skipPronounReflection: true
  },

  {
    regex: /\b(setelah bayar|konfirmasi tiket|cek tiket|my tickets|download tiket)\b/i,
    answer: "✅ *Langkah Setelah Pembayaran:*\n1️⃣ Cek email, tiket & konfirmasi dikirim otomatis.\n2️⃣ Buka tab *My Tickets* di pojok kanan atas.\n3️⃣ Tiket tersimpan di *My Tickets* setelah transaksi berhasil.\n4️⃣ Klik *Download All Tickets* untuk simpan dalam PDF.\n5️⃣ Atau buka tab *My Orders* untuk melihat detail transaksi.",
    type: "tutorial-after-payment",
    resetContext: true
  },

  {
    regex: /\b(setup event|atur event|edit event|ubah event|kelola event)\b/i,
    answer: "🎛️ *Setup & Edit Events (EO):*\n1️⃣ Login dengan akun EO.\n2️⃣ Buka tab *Events* di sidebar.\n3️⃣ Pilih event yang ingin dikelola.\n4️⃣ Klik tombol *Ubah* di bagian atas layar.\n5️⃣ Sesuaikan opsi pengaturan event sesuai kebutuhan.",
    type: "tutorial-eo",
    resetContext: true
  },

  {
    regex: /\b(scanner|scan tiket|verifikasi tiket)\b/i,
    answer: "📷 *Penggunaan Scanner:*\n1️⃣ Login dengan akun scanner.\n2️⃣ Aktifkan kamera dari fitur yang tersedia.\n3️⃣ Arahkan kamera ke QR code tiket untuk verifikasi.",
    type: "tutorial-scanner",
    resetContext: true
  },

  {
    regex: /\b(cek order|data tiket|data order|laporan tiket|laporan order)\b/i,
    answer: "📑 *Pengecekan Data Tiket & Order:*\n1️⃣ Login dengan akun EO.\n2️⃣ Buka tab *Tickets* untuk melihat data tiket.\n   ➝ Gunakan filter (kategori, sort, search).\n3️⃣ Buka tab *Orders* untuk melihat data pembelian.\n   ➝ Gunakan filter (kategori, sort, search).",
    type: "tutorial-data-check",
    resetContext: true
  },

  // === Kategori 6: Pricing dengan Context ===
  {
    regex: /\b(harga|tiket|biaya)\b.*[\d.,]+|[\d.,]+.*\b(harga|tiket|biaya|ribu|rb|juta)\b/i,
    answer: "CONTEXT_PRICING",
    type: "context-pricing",
    requiresProcessing: true
  },

  {
    regex: /\b(kapasitas|kursi|seat|orang|tempat)\b.*[\d.,]+|[\d.,]+.*\b(kapasitas|kursi|seat|orang|tempat)\b/i,
    answer: "CONTEXT_CAPACITY",
    type: "context-capacity", 
    requiresProcessing: true
  },

  // === Kategori 7: Pure Numbers (Context Dependent) ===
  {
    regex: /^[\d.,\s]+$/,
    answer: "PURE_NUMBER",
    type: "pure-number",
    requiresProcessing: true
  },

  // === Default Response ===
  {
    regex: /.*/,
    answer: "Maaf, saya belum mengerti maksud Anda. Bisa coba pertanyaan lain? 🤔\n\nCoba tanyakan tentang:\n• Fitur NovaTix\n• Harga dan pricing\n• Detail layanan\n• Tutorial penggunaan\n• Atau ketik 'pricing' untuk menghitung biaya",
    type: "default",
    resetContext: true,
    skipPronounReflection: true
  }
];

// === Pronoun Reflection Function ===
function applyPronounReflection(text) {
  // Use placeholder approach to avoid double replacement
  let reflectedText = text;
  const placeholders = {};
  let placeholderCounter = 0;
  
  // First pass: replace with unique placeholders
  for (const [original, reflected] of Object.entries(pronounReflection)) {
    const escapedOriginal = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedOriginal}\\b`, 'gi');
    const placeholder = `__PLACEHOLDER_${placeholderCounter++}__`;
    
    reflectedText = reflectedText.replace(regex, (match) => {
      placeholders[placeholder] = reflected;
      return placeholder;
    });
  }
  
  // Second pass: replace placeholders with actual reflections
  for (const [placeholder, replacement] of Object.entries(placeholders)) {
    reflectedText = reflectedText.replace(new RegExp(placeholder, 'g'), replacement);
  }
  
  return reflectedText;
}

// === Enhanced Number Parser ===
function parseNumber(input) {
  // Handle various formats: 50000, 50.000, 50,000
  let cleanInput = input.toString()
    .replace(/[^\d.,]/g, ' ') // Keep only digits, dots, commas
    .trim()
    .replace(/\s+/g, ' '); // Normalize spaces
  
  // Extract numbers and handle different formats
  let numbers = [];
  let parts = cleanInput.split(/\s+/);
  
  for (let part of parts) {
    if (part.length > 0) {
      // Handle formats like 50.000 or 50,000 as thousands separator
      let num = part.replace(/[.,]/g, '');
      if (num && !isNaN(num)) {
        numbers.push(parseInt(num));
      }
    }
  }
  
  return numbers;
}

// === Context Handler Functions ===
function handleContextPricing(input) {
  const numbers = parseNumber(input);
  if (numbers.length === 0) {
    return "Mohon masukkan angka yang valid untuk harga tiket.";
  }
  
  const harga = numbers[0];
  userContext.tempData.harga = harga;
  userContext.waitingFor = 'capacity';
  
  return `✅ Harga tiket: Rp${harga.toLocaleString()}\n\n🔢 Sekarang, berapa kapasitas venue acara Anda?\n\nContoh: "500 orang" atau "kapasitas 1000"`;
}

function handleContextCapacity(input) {
  const numbers = parseNumber(input);
  if (numbers.length === 0) {
    return "Mohon masukkan angka yang valid untuk kapasitas venue.";
  }
  
  const kapasitas = numbers[0];
  userContext.tempData.kapasitas = kapasitas;
  
  // Check if we have price from previous context
  if (userContext.tempData.harga) {
    const result = calculatePricing(userContext.tempData.harga, kapasitas);
    resetContext(); // Clear context after calculation
    return result;
  } else {
    userContext.waitingFor = 'price';
    return `✅ Kapasitas venue: ${kapasitas.toLocaleString()} orang\n\n💰 Sekarang, berapa harga tiket acara Anda?\n\nContoh: "50000" atau "harga 75.000"`;
  }
}

function handlePureNumber(input) {
  const numbers = parseNumber(input);
  if (numbers.length === 0) {
    return "Mohon masukkan angka yang valid.";
  }
  
  const number = numbers[0];
  
  // Check context to determine what this number represents
  if (userContext.waitingFor === 'capacity') {
    userContext.tempData.kapasitas = number;
    if (userContext.tempData.harga) {
      const result = calculatePricing(userContext.tempData.harga, number);
      resetContext();
      return result;
    } else {
      userContext.waitingFor = 'price';
      return `✅ Kapasitas venue: ${number.toLocaleString()} orang\n\n💰 Sekarang, berapa harga tiket acara Anda?`;
    }
  } else if (userContext.waitingFor === 'price') {
    userContext.tempData.harga = number;
    if (userContext.tempData.kapasitas) {
      const result = calculatePricing(number, userContext.tempData.kapasitas);
      resetContext();
      return result;
    } else {
      userContext.waitingFor = 'capacity';
      return `✅ Harga tiket: Rp${number.toLocaleString()}\n\n🔢 Sekarang, berapa kapasitas venue acara Anda?`;
    }
  } else if (userContext.waitingFor === 'pricing-detail') {
    // Assume it's price if context is pricing-detail
    userContext.tempData.harga = number;
    userContext.waitingFor = 'capacity';
    return `✅ Harga tiket: Rp${number.toLocaleString()}\n\n🔢 Sekarang, berapa kapasitas venue acara Anda?`;
  } else {
    // No context, ask what this number represents
    return `Saya melihat angka ${number.toLocaleString()}. Ini untuk:\n\n1️⃣ Harga tiket? \n2️⃣ Kapasitas venue?\n\nMohon sebutkan dengan jelas, misalnya:\n• "harga ${number.toLocaleString()}"\n• "kapasitas ${number.toLocaleString()}"`;
  }
}

// === Pricing Calculation Function ===
function calculatePricing(harga, kapasitas) {
  if (harga <= 0 || kapasitas <= 0) {
    return "Mohon masukkan harga tiket dan kapasitas yang valid (lebih dari 0).";
  }

  // Price level determination
  let hargaLevel = harga < 75000 ? 0 : harga < 150000 ? 1 : 2;
  
  // Capacity level determination  
  let kapasitasLevel = kapasitas < 500 ? 0 : kapasitas < 2500 ? 1 : 2;

  // Pricing tables
  const persenTable = [
    [10, 8, 7.5],    // harga rendah (< 75k)
    [6, 5.5, 5],     // harga sedang (75k-149k)
    [5.5, 5, 4]      // harga tinggi (>= 150k)
  ];

  const flatTable = [
    [7500, 7000, 7000],    // harga rendah (< 75k)
    [7000, 6000, 6000],    // harga sedang (75k-149k)
    [5500, 5000, 5000]     // harga tinggi (>= 150k)
  ];

  let persenFee = persenTable[hargaLevel][kapasitasLevel];
  let flatFee = flatTable[hargaLevel][kapasitasLevel];

  // Calculate estimates
  let estimasiPersentase = (harga * persenFee) / 100;
  let estimasiTotal = kapasitas * estimasiPersentase;
  let estimasiFlatTotal = kapasitas * flatFee;

  return `🎯 **HASIL KALKULASI PRICING**\n\n💡 Input Anda:\n• Harga tiket: Rp${harga.toLocaleString()}\n• Kapasitas venue: ${kapasitas.toLocaleString()} tiket\n\n📊 **Skema Persentase**: ${persenFee}% per transaksi\n   • Fee per tiket: Rp${Math.round(estimasiPersentase).toLocaleString()}\n   • Total estimasi (sold out): Rp${Math.round(estimasiTotal).toLocaleString()}\n\n💵 **Skema Flat Fee**: Rp${flatFee.toLocaleString()} per tiket\n   • Total estimasi (sold out): Rp${estimasiFlatTotal.toLocaleString()}\n\n✨ **Rekomendasi**: ${estimasiTotal < estimasiFlatTotal ? 'Skema Persentase lebih hemat' : 'Skema Flat Fee lebih hemat'} untuk acara Anda!\n\nAda pertanyaan lain? 😊`;
}

// === Context Management ===
function resetContext() {
  userContext = {
    waitingFor: null,
    tempData: {},
    lastQuestion: null
  };
}

function setContext(type, data = {}) {
  userContext.waitingFor = type;
  userContext.tempData = { ...userContext.tempData, ...data };
}

// === Main Response Function ===
function getResponse(input) {
  const normalizedInput = input.toLowerCase().trim();
  
  for (const response of responses) {
    const match = normalizedInput.match(response.regex);
    
    if (match) {
      // Handle special processing
      if (response.requiresProcessing) {
        let result;
        
        switch (response.answer) {
          case "CONTEXT_PRICING":
            result = handleContextPricing(input);
            break;
          case "CONTEXT_CAPACITY":
            result = handleContextCapacity(input);
            break;
          case "PURE_NUMBER":
            result = handlePureNumber(input);
            break;
          default:
            result = response.answer;
        }
        
        return result;
      }
      
      // Handle context setting
      if (response.setContext) {
        setContext(response.setContext);
      }
      
      // Handle context reset
      if (response.resetContext) {
        resetContext();
      }
      
      // Handle capture groups (if any)
      if (response.hasCaptureGroup && match.length > 1) {
        let answer = response.answer;
        for (let i = 1; i < match.length; i++) {
          if (match[i]) {
            answer = answer.replace(`$${i}`, match[i]);
          }
        }
        // Apply pronoun reflection to final answer
        return applyPronounReflection(answer);
      }
      
      // Apply pronoun reflection to response (unless skipped)
      if (response.skipPronounReflection) {
        return response.answer;
      }
      return applyPronounReflection(response.answer);
    }
  }
  
  return "Maaf, saya belum mengerti maksud Anda.";
}

// === Advanced Response Function ===
function getAdvancedResponse(input, customResponses = null) {
  const responseData = customResponses || responses;
  return getResponse(input);
}

// === Debug Function (untuk development) ===
function getContext() {
  return userContext;
}

// === Export untuk Backward Compatibility ===
module.exports = { 
  getResponse,
  getAdvancedResponse,
  responses,
  calculatePricing,
  getContext, // untuk debugging
  applyPronounReflection // untuk testing
};