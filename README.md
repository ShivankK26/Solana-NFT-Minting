# Solana NFT Management README

Welcome to the Solana NFT Management project! This project facilitates the creation, update, and management of non-fungible tokens (NFTs) on the Solana blockchain using the Metaplex SDK and Solana Web3.js.

## Introduction

This project leverages the capabilities of the Solana blockchain and the Metaplex SDK to manage non-fungible tokens (NFTs). It allows users to upload metadata, create NFTs, update NFT metadata URIs, and perform various other operations related to NFT management.

## Setup

To get started with this project, follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/ShivankK26/Solana-NFT-Minting.git
cd src
```

2. Install dependencies:

Ensure you have Node.js and npm installed. Then, install the required dependencies using npm:

```bash
npm install
```

3. Configure your environment:

Update the necessary environment variables such as cluster API URL, storage address, and provider URL as per your Solana network configuration.

4. Run the project:

Execute the main script to run the Solana NFT management operations:

```bash
node index.ts
```

## Usage

The project consists of several functions for managing NFTs on the Solana blockchain:

- **Upload Metadata:** Read an image file, convert it to a buffer, and upload it to get an image URI. Upload NFT metadata including name, symbol, description, and image URI.
- **Create NFT:** Create an NFT by providing metadata URI, name, seller fee, symbol, and collection mint address.
- **Create Collection NFT:** Create a collection NFT by providing metadata URI, name, seller fee, symbol, and collection authority.
- **Update NFT URI:** Update the URI of an existing NFT by providing the metadata URI and mint address.
