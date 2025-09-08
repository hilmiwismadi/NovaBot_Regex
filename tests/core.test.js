// tests/core.test.js
const { getResponse, applyPronounReflection, calculatePricing } = require("../core");

describe("NovaBot Core Tests", () => {
  // Test 1: Basic greeting functionality
  test("sapaan harus dibalas dengan greeting", () => {
    const userInput = "halo";
    const response = getResponse(userInput);
    expect(response).toMatch(/Halo|NovaBot/i);
  });

  // Test 2: Pronoun reflection functionality  
  test("pronoun reflection should work correctly", () => {
    expect(applyPronounReflection("saya adalah bot")).toBe("anda adalah bot");
    expect(applyPronounReflection("anda butuh bantuan")).toBe("saya butuh bantuan");
    expect(applyPronounReflection("kamu bisa membantu")).toBe("saya bisa membantu");
    expect(applyPronounReflection("kami siap membantu")).toBe("kita siap membantu");
  });

  // Test 3: Feature inquiry response
  test("fitur inquiry should return feature list", () => {
    const userInput = "fitur";
    const response = getResponse(userInput);
    expect(response).toMatch(/Fitur utama NovaTix/i);
    expect(response).toMatch(/pemilihan tiket/i);
    expect(response).toMatch(/payment gateway/i);
  });

  // Test 4: Pricing calculation functionality
  test("pricing calculation should work correctly", () => {
    const result = calculatePricing(50000, 1000);
    expect(result).toMatch(/HASIL KALKULASI PRICING/i);
    expect(result).toMatch(/Harga tiket: Rp50.000/);
    expect(result).toMatch(/Kapasitas venue: 1.000/);
    expect(result).toMatch(/Skema Persentase/);
    expect(result).toMatch(/Skema Flat Fee/);
  });

  // Test 5: Context-aware pricing flow
  test("pricing flow should handle multi-step conversation", () => {
    // Start pricing conversation
    let response = getResponse("harga");
    expect(response).toMatch(/skema pricing/i);
    expect(response).toMatch(/harga tiket acara/i);
    
    // Provide price
    response = getResponse("50000");
    expect(response).toMatch(/Harga tiket: Rp50.000/);
    expect(response).toMatch(/kapasitas venue/i);
    
    // Complete with capacity
    response = getResponse("500");
    expect(response).toMatch(/HASIL KALKULASI PRICING/i);
  });

  // Test 6: Default/unknown input handling
  test("unknown input should return helpful default message", () => {
    const userInput = "blablatest123unknown";
    const response = getResponse(userInput);
    expect(response).toMatch(/Maaf.*belum mengerti/i);
    expect(response).toMatch(/Coba tanyakan tentang/i);
  });
});
