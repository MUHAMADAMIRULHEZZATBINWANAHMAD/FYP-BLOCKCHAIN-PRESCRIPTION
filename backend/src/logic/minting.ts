import { PinataSDK } from "pinata";
import fs from "fs";
import "dotenv/config";
import {
  createThirdwebClient,
  getContract,
  sendAndConfirmTransaction,
  Engine,
} from "thirdweb";
import { sepolia } from "thirdweb/chains"; // Changed to Ethereum Sepolia
import { lazyMint, setClaimConditions } from "thirdweb/extensions/erc721"; 

// ==========================================
// 1. INITIALIZE PINATA
// ==========================================
const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: process.env.PINATA_GATEWAY_URL!, 
});

// ==========================================
// 2. INITIALIZE THIRDWEB
// ==========================================
const client = createThirdwebClient({
  secretKey: process.env.THIRDWEB_SECRET_KEY!,
});

// Use the Server Wallet (Engine) instead of Admin Private Key
const serverWallet = Engine.serverWallet({
  client,
  address: process.env.SERVER_WALLET_ADDRESS!,
  vaultAccessToken: process.env.VAULT_ACCESS_TOKEN!,
});

// Connect to the contract on Ethereum Sepolia
const contract = getContract({
  client,
  address: process.env.THIRDWEB_SMART_CONTRACT_ADDRESS!,
  chain: sepolia, 
});

// ==========================================
// FUNCTION 1: Upload to Pinata IPFS
// ==========================================
export async function uploadToPinata(filePath: string, shirtName: string, description: string, attributes: any[]) {
  console.log("Uploading image to Pinata...");
  const fileData = fs.readFileSync(filePath);
  
  const file = new File([fileData], `${shirtName}.png`, { type: "image/png" });
  const imageUpload = await pinata.upload.public.file(file);
  const imageUrl = `ipfs://${imageUpload.cid}`;
  console.log("✅ Image CID:", imageUpload.cid);

  console.log("Uploading metadata to Pinata...");
  const metadata = {
    name: shirtName,
    description: description,
    image: imageUrl,
    attributes: attributes
  };

  const jsonUpload = await pinata.upload.public.json(metadata);
  const metadataUri = `ipfs://${jsonUpload.cid}`;
  console.log("✅ Metadata CID:", jsonUpload.cid);

  return { imageUrl, metadataUri, cid: jsonUpload.cid };
}

// ==========================================
// FUNCTION 2: Lazy Mint (Add to Store)
// ==========================================
export async function prepareNFTForStore(metadataUri: string, price: string, supply: number) {
  console.log(`Lazy minting NFT to contract from ${metadataUri}...`);
  
  // 1. Lazy Mint the metadata to the blockchain
  const lazyMintTx = lazyMint({
    contract,
    nfts: [{ uri: metadataUri }],
  });

  const lazyMintReceipt = await sendAndConfirmTransaction({
    transaction: lazyMintTx,
    account: serverWallet, // Executed by Server Wallet
  });
  console.log("✅ NFT registered to contract!", lazyMintReceipt.transactionHash);

  // 2. Set Claim Conditions (Price and Supply)
  console.log(`Setting price to ${price} ETH and supply to ${supply}...`);
  const conditionTx = setClaimConditions({
    contract,
    phases: [
      {
        maxClaimableSupply: BigInt(supply),
        price: price,
        currencyAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // Native token (ETH)
        startTime: new Date(),
      },
    ],
  });

  const conditionReceipt = await sendAndConfirmTransaction({
    transaction: conditionTx,
    account: serverWallet, // Executed by Server Wallet
  });
  console.log("✅ Claim conditions updated!", conditionReceipt.transactionHash);

  return { lazyMintHash: lazyMintReceipt.transactionHash };
}