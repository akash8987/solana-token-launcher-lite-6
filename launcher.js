const { 
    Connection, 
    Keypair, 
    PublicKey, 
    LAMPORTS_PER_SOL 
} = require('@solana/web3.js');
const { 
    createMint, 
    getOrCreateAssociatedTokenAccount, 
    mintTo 
} = require('@solana/spl-token');
const bs58 = require('bs58');
const config = require('./config');

async function launchToken() {
    // 1. Setup Connection & Signer
    const connection = new Connection(config.RPC_ENDPOINT, 'confirmed');
    const payer = Keypair.fromSecretKey(bs58.decode(config.PRIVATE_KEY));

    console.log(`Starting deployment with: ${payer.publicKey.toBase58()}`);

    // 2. Create New Mint
    console.log("Creating token mint...");
    const mint = await createMint(
        connection,
        payer,
        payer.publicKey, // Mint Authority
        payer.publicKey, // Freeze Authority
        config.DECIMALS
    );

    console.log(`Token Mint Created: ${mint.toBase58()}`);

    // 3. Create Associated Token Account (ATA)
    console.log("Creating Associated Token Account...");
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mint,
        payer.publicKey
    );

    // 4. Mint Tokens to the Account
    console.log(`Minting ${config.MINT_AMOUNT} tokens...`);
    await mintTo(
        connection,
        payer,
        mint,
        tokenAccount.address,
        payer,
        config.MINT_AMOUNT * Math.pow(10, config.DECIMALS)
    );

    console.log("✅ Token Launch Successful!");
    console.log(`View on Solscan: https://solscan.io/token/${mint.toBase58()}?cluster=devnet`);
}

launchToken().catch(console.error);
