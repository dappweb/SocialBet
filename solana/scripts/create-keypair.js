// Create Solana keypair from secret key array
const fs = require('fs');

// Secret key array provided by user
const secretKeyArray = [24,243,40,13,251,242,198,54,1,41,175,7,3,78,239,156,94,6,250,201,18,81,249,251,88,114,92,4,81,238,206,244,61,61,241,237,128,180,248,248,150,247,198,176,129,235,104,160,88,141,96,105,40,22,120,191,207,32,5,83,84,186,168,222];

// Convert to Buffer
const keypair = Buffer.from(secretKeyArray);

// Save as JSON array (Solana keypair format)
const keypairJson = JSON.stringify(Array.from(keypair));
fs.writeFileSync('deployer-keypair.json', keypairJson);

console.log('✅ Keypair file created: deployer-keypair.json');
console.log('Keypair length:', keypair.length, 'bytes');

// Also save as base58 for reference
try {
    const bs58 = require('bs58');
    const base58 = bs58.encode(keypair);
    console.log('Base58 encoded:', base58);
    fs.writeFileSync('deployer-keypair-base58.txt', base58);
} catch (e) {
    console.log('Note: bs58 not available, skipping base58 encoding');
}

