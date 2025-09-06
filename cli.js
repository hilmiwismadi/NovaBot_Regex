// cli.js
const readline = require("readline");
const { getResponse } = require("./core");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("TicketBot aktif 🎟️. Ketik sesuatu (atau 'exit' untuk keluar).");

function ask() {
  rl.question("Kamu: ", (input) => {
    if (input.toLowerCase() === "exit") {
      console.log("TicketBot: Sampai jumpa!");
      rl.close();
      return;
    }

    const reply = getResponse(input);
    console.log("TicketBot:", reply);
    ask();
  });
}

ask();
