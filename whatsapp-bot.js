// whatsapp-bot.js - WhatsApp integration for NovaBot
require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const { getResponse } = require('./core');

// Initialize WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "novabot-session"
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-background-networking',
            '--disable-background-timer-throttling',
            '--disable-renderer-backgrounding',
            '--disable-backgrounding-occluded-windows',
            '--disable-ipc-flooding-protection'
        ],
        // executablePath: '/usr/bin/google-chrome-stable' // Using bundled Chromium instead
    }
});

// Logging function
function logMessage(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    
    // Create logs directory if it doesn't exist
    const logsDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir);
    }
    
    // Append to log file
    const logFile = path.join(logsDir, 'whatsapp-bot.log');
    fs.appendFileSync(logFile, logEntry);
    
    console.log(logEntry.trim());
}

// Event: QR Code Generation
client.on('qr', (qr) => {
    logMessage('QR Code generated. Scan with your WhatsApp mobile app:');
    qrcode.generate(qr, { small: true });
    console.log('\n📱 Scan the QR code above with your WhatsApp mobile app');
    console.log('📱 Make sure your phone has internet connection');
    console.log('📱 Keep your phone connected while the bot is running\n');
});

// Event: Client Ready
client.on('ready', () => {
    logMessage('NovaBot WhatsApp client is ready');
    console.log('🤖 NovaBot is now connected to WhatsApp');
    console.log('📱 You can now send messages to your WhatsApp number');
    console.log('🛑 Press Ctrl+C to stop the bot\n');
});

// Event: Authentication Success
client.on('authenticated', () => {
    logMessage('WhatsApp authentication successful');
});

// Event: Authentication Failure
client.on('auth_failure', (msg) => {
    logMessage(`Authentication failed: ${msg}`);
    console.error('Authentication failed. Please try again.');
});

// Event: Disconnected
client.on('disconnected', (reason) => {
    logMessage(`WhatsApp client disconnected: ${reason}`);
    console.log('Bot disconnected. Restarting...');
    
    // Auto-restart after 5 seconds
    setTimeout(() => {
        console.log('🔄 Attempting to restart WhatsApp client...');
        logMessage('Attempting to restart WhatsApp client');
        client.initialize();
    }, 5000);
});

// Event: Message Received
client.on('message', async (message) => {
    try {
        // Get message info
        const contact = await message.getContact();
        const chat = await message.getChat();
        const messageBody = message.body.trim();
        const contactName = contact.pushname || contact.number;
        
        // Skip if message is from status/broadcast
        if (chat.isGroup && chat.name === 'Status') return;
        if (message.broadcast) return;
        
        // Skip all group chat messages
        if (chat.isGroup) return;
        
        // Skip if message is from bot itself
        if (message.fromMe) return;
        
        // Log incoming message
        logMessage(`Message from ${contactName} (${contact.number}): ${messageBody}`);
        
        // Skip empty messages
        if (!messageBody) return;
        
        // Get bot response
        const response = getResponse(messageBody);
        
        // Send reply
        await message.reply(response);
        
        // Log outgoing response
        logMessage(`Bot replied to ${contactName}: ${response.substring(0, 100)}${response.length > 100 ? '...' : ''}`);
        
    } catch (error) {
        logMessage(`Error processing message: ${error.message}`);
        console.error('Error processing message:', error);
        
        // Send error response
        try {
            await message.reply('Maaf, terjadi kesalahan sistem. Silakan coba lagi nanti. 🙏');
        } catch (replyError) {
            logMessage(`Failed to send error reply: ${replyError.message}`);
        }
    }
});

// Event: Message Creation (for logging sent messages)
client.on('message_create', async (message) => {
    if (message.fromMe && !message.broadcast) {
        try {
            const contact = await message.getContact();
            const contactName = contact.pushname || contact.number;
            logMessage(`Sent message to ${contactName}: ${message.body.substring(0, 100)}${message.body.length > 100 ? '...' : ''}`);
        } catch (error) {
            // Ignore logging errors for sent messages
        }
    }
});

// Graceful shutdown
process.on('SIGINT', async () => {
    logMessage('Received shutdown signal, closing WhatsApp client...');
    console.log('\n🛑 Shutting down bot...');
    
    try {
        await client.destroy();
        logMessage('WhatsApp client closed successfully');
        console.log('✅ Bot shutdown complete');
    } catch (error) {
        logMessage(`Error during shutdown: ${error.message}`);
        console.error('Error during shutdown:', error);
    }
    
    process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logMessage(`Uncaught exception: ${error.message}`);
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logMessage(`Unhandled rejection at ${promise}: ${reason}`);
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the client
console.log('🚀 Starting NovaBot WhatsApp integration...');
console.log('📱 Please wait for QR code generation...\n');
logMessage('NovaBot WhatsApp bot starting...');

client.initialize();