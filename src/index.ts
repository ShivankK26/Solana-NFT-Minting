import { initializeKeypair } from "./initializeKeypair";
import { Connection, PublicKey, clusterApiUrl, Signer } from "@solana/web3.js";
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
  NftWithToken,
} from "@metaplex-foundation/js";
import * as fs from "fs";

interface NftData {
  name: string;
  symbol: string;
  description: string;
  sellerFeeBasisPoints: number;
  imageFile: string;
}

interface CollectionNftData {
  name: string;
  symbol: string;
  description: string;
  imageFile: string;
  isCollection: boolean;
  collectionAuthority: Signer;
  sellerFeeBasisPoints: number;
}

const nftData = {
  name: "My NFT",
  symbol: "SYMBOL",
  description: "This is my NFT",
  sellerFeeBasisPoints: 0,
  imageFile: "solana.png",
};

const updatedNftData = {
  name: "UPDATE",
  symbol: "SYMBOL",
  description: "This is the description of my updated NFT",
  sellerFeeBasisPoints: 100,
  imageFile: "success.png",
};

// This function will read an image file, convert it to a buffer, then upload it to get an image URI. It will then upload the NFT metadata, which includes the name, symbol, description, and image URI, and get a metadata URI. This URI is the off-chain metadata. This function will also log the image URI and metadata URI for reference.
async function uploadMetaData(
  metaplex: Metaplex,
  nftData: NftData,
): Promise<string> {
  const buffer = fs.readFileSync("/src" + nftData.imageFile);
  const file = toMetaplexFile(buffer, nftData.imageFile);

  const imageUri = await metaplex.storage().upload(file);
  console.log("Image uri: ", imageUri);

  const { uri } = await metaplex.nfts().uploadMetadata({
    name: nftaDta.name,
    symbol: nftData.symbol,
    description: nftData.description,
    image: imageUri,
  });

  console.log("Metadata uri: ", uri);
}

// This function takes in the Metaplex instance, metadata URI and NFT data as inputs. It uses the create method of the SDK to create the NFT, passing in the metadata URI, name, seller fee, and symbol as parameters.
async function createNft(
  metaplex: Metaplex,
  uri: string,
  nftData: NftData,
  collectionMint: PublicKey,
): Promise<NftWithToken> {
  const { nft } = await metaplex.nfts().create(
    {
      uri: uri,
      name: nftData.name,
      sellerFeeBasisPoints: nftData.sellerFeeBasisPoints,
      symbol: nftaDta.symbol,
      collection: collectionMint,
    },
    { commitment: "finalized" },
  );

  console.log(`
    Minted Token: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet
    `);

  await metaplex.nfts().verifyCollection({
    mintAddress: nft.mint.address,
    collectionMintAddress: collectionMint,
    isSizedCollection: true,
  });

  return nft;
}

async function createCollectionNft(
  metaplex: Metaplex,
  uri: string,
  data: CollectionNftData,
): Promise<NftWithToken> {
  const { nft } = await metaplex.nfts().create(
    {
      uri: uri,
      name: data.name,
      sellerFeeBasisPoints: data.sellerFeeBasisPoints,
      symbol: data.symbol,
      isCollection: true,
    },
    { commitment: "finalized" },
  );

  console.log(`
      Collection Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet
    `);

  return nft;
}

// This function will take in the Metaplex instance, metadata URI, and mint address of the NFT. It uses the findByMint method of the SDK to fetch the existing NFT data using the mint address, and then uses the update method to update the metadata with the new URI. Finally, it will log the token mint URL and transaction signature for reference.
async function updateNftUri(
  metaplex: Metaplex,
  uri: string,
  mintAddress: PublicKey,
) {
  const nft = await Metaplex.nfts().findByMint({ mintAddress });

  const { response } = await metaplex.nfts().update(
    {
      nftOrSft: nft,
      uri: uri,
    },
    { commitment: "finalized" },
  );

  console.log(`
      Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet
    `);

  console.log(`
      Transaction: https://explorer.solana.com/tx/${response.signature}?cluster=devnet
    `);
}

async function main() {
  const connection = new Connection(clusterApiUrl("devnet"));
  const user = await initializeKeypair(connection);

  console.log("Public Key: ", user.publicKey.toBase58());

  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(user))
    .use(
      bundlrStorage({
        address: "https://devnet.bundlr.network",
        providerUrl: "https://api.devnet.solana.com",
        timeout: 60000,
      }),
    );

  const collectionNftData = {
    name: "TestCollectionNFT",
    symbol: "TEST",
    description: "Test Description Collection",
    sellerFeeBasisPoints: 100,
    imageFile: "success.png",
    isCollection: true,
    collectionAuthority: user,
  };

  const collectionUri = await uploadMetaData(metaplex, collectionNftData);

  const collectionNft = await createCollectionNft(
    metaplex,
    collectionUri,
    collectionNftData,
  );

  const uri = await uploadMetaData(metaplex, nftData);

  const nft = await createNft(
    metaplex,
    uri,
    nftData,
    collectionNft.mint.address,
  );

  const updatedUri = await uploadMetaData(metaplex, updatedNftData);
  await updateNftUri(metaplex, updatedUri, nft.address);
}

main()
  .then(() => {
    console.log("Finished successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
