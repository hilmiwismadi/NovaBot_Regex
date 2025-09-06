// tests/core.test.js
const { getResponse } = require("../core");

test("sapaan harus dibalas dengan greeting", () => {
  const userInput = "halo";
  const response = getResponse(userInput);
  expect(response).toMatch(/Halo|NovaBot/i);
});
