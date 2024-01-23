## Verxio XRP
Verxio Protocol is a non-custodial solution that uses stealth addresses to enable users to send and receive XRP on the XRP EVM compatible chain without revealing the receiver's real address; which serves as their identity on the blockchain.

Verxio is heavily inspired by [Vitalik's recent article on stealth addresses](https://vitalik.eth.limo/general/2023/01/20/stealth.html).

## Project Overview
Have you ever wished you could send and receive funds without anyone snooping around your business? Well, say hello to Verxio Protocol – your privacy guardian on the XRP EVM compatible chain. 

We’re tackling the issue of exposing personal info during transactions by introducing stealth addresses. 

- The project draws inspiration from existing privacy-focused blockchains like Monero and tools like Tornado Cash but aims to bridge the gap between complex and expensive privacy solutions and non-private transfers.

- It empowers users to maintain their privacy, fostering trust and security in the blockchain industry.

## Background
- Issue Addressed: Verxio Protocol addresses the pressing concern of inadequate privacy in blockchain transactions. While the blockchain guarantees transparency and immutability, it simultaneously exposes sensitive details of transactions, such as sender and recipient addresses. This lack of privacy imposes significant risks on both individuals and businesses, potentially connecting their financial actions to real-world identities.

- Fundamental Privacy: Privacy holds a crucial role in financial transactions. Without a robust privacy layer, users remain vulnerable to an array of risks:

- Identity Exposure: Open blockchain transactions create an avenue for observers to correlate transactions with specific people or entities. This jeopardizes financial privacy and exposes individuals to potential targeting or surveillance.

    - Financial Profiling: In-depth profiling of individuals and businesses becomes possible through the analysis of blockchain transactions. This includes identifying spending habits, income sources, and financial associations. Such data can be exploited for targeted ads, discrimination, or even extortion.

    - Security Gaps: Transparent blockchains, when repeatedly used for transactions, render users susceptible to hacking and phishing threats. Criminals can analyze transaction histories to discern patterns, monitor balances, and exploit security vulnerabilities.

    - Business Exposure: Transparent transactions inadvertently reveal confidential financial information of companies, like sales figures, supply chain connections, and partnerships. Competitors can leverage this intel to gain an edge, potentially undermining business competitiveness.

    - Regulatory Hurdles: Certain industries, such as healthcare and finance, mandate stringent privacy regulations. Transparent blockchain transactions could clash with these standards, resulting in legal complications or penalties for non-compliance.

- Significance: Addressing this issue assumes paramount importance due to its direct impact on safeguarding financial confidentiality. Preserving the integrity of personal and corporate information from prying eyes is central. By introducing a user-centric solution that leverages stealth addresses for anonymous transactions, Verxio Protocol empowers users to regain control over their financial privacy and alleviate the potential pitfalls linked with identity exposure.

## Technical Description
- Verxio Protocol implements stealth addresses on the XRP EVM compatible chain using a combination of cryptographic techniques to ensure transaction security and user privacy. Let’s break down the key steps and encryption methods involved:

- Stealth Addresses Generation:
    The receiver generates a root spending key (receiver private key) and computes a stealth meta-address (receiver public key or receiver’s address) using elliptic curve cryptography. This stealth meta-address (receiver’s address) becomes a publicly known identifier for the receiver on the blockchain.

- Ephemeral Key Generation:
    The Sender generates an ephemeral key (sender’s private key) which the sender keeps secret. This key is like a temporary secret code.

- Shared Secret Creation:
    The Sender combines his ephemeral key (sender’s private key) with the Receiver’s stealth meta-address (receiver's public key) to create a shared secret (S). This shared secret is a private connection between the Sender and Receiver.

- Ephemeral Public Key Publishing:
    The sender creates an ephemeral public key (sender public key) from his ephemeral key (sender private key) and publishes it on a public registry. This public key can be seen by anyone.

- Transaction Process:
    The sender sends funds to a stealth address, which is derived from the combination of his ephemeral key (sender's private key) and the Receiver’s meta-address (receiver's public key).

- Recipient’s Discovery:
    The receiver scans the public registry for ephemeral public keys (sender public key) and tries to unlock special addresses (stealth addresses) using his spending key (receiver private key) and the shared secrets (S). If funds are found in an address, the Receiver can access them.

- Address Ownership and Privacy:
    The transaction details are recorded on the blockchain, but the connection between the recipient’s real address and the stealth address remains private. This adds a layer of privacy by making it difficult for external observers to link transactions to specific recipients.

- The cryptographic techniques used in this process include:

    Elliptic Curve Cryptography (ECC): This is used to generate private and public keys, compute shared secrets, and create addresses. ECC provides a secure way to perform mathematical operations that ensure transaction security and privacy.

    Hash Functions: Hashing is used to derive addresses from public keys and shared secrets. Hash functions are one-way functions that add an extra layer of security to the process.

    Public Key Registries: The public registry where ephemeral public keys are published allows participants (like receivers) to scan and identify stealth addresses. This mechanism helps maintain privacy without revealing the actual recipient’s address.

Verxio Protocol solution leverages these cryptographic methods to create a system where transactions are secure, and recipient privacy is preserved through the use of stealth addresses.

## Implementation
- We have started with a standard Hardhat project and added essential methods to the StealthAddress contract. To enhance credibility, we intentionally avoided making the contract upgradeable, as there's no on-chain governance currently. If an upgrade is needed, we'll deploy a new version and provide client-side support.

- Next, we developed the UI/UX using React and TypeScript, focusing on a simple yet elegant design for both power and non-power users. The UI colors and feel are built with the XRP EVM compatible chain in mind.

- We used the Wagmi library for blockchain interactions which streamlined the process.

- The elliptic library handled the complex math involved with elliptic curves, and both libraries featured TypeScript typings, making them a joy to work with.

- We used Streamr Client to store all user transactions in a Data Pool on Streamr Hub

- Tools Used: Solidity, Hardhat, XRP EVM compatible chain, React, Typescript, Wagmi, and Metamask.


## Challenges
- The main challenge was designing the best possible user experience, which we believe the current implementation achieves.

- Another challenge was signing and sending withdrawal transactions without using the connected user wallet. We resolved this by creating a custom-built transaction broadcasted via public RPC URLs, which works effectively.


## What's next for Verxio XRP?
- Currently, Verxio Protocol only supports native coin transfers(XRP, ETH, MATIC etc). However, adding support for tokens and NFTs would greatly enhance its utility. We are considering implementing relayer nodes to mint and sell notes as tokens (or NFTs) in exchange for covering user fees on transfers.

- This approach allows users to maintain their anonymity while using note tokens to request relayers to cover fees and pay for transactions. Competition between relayers could help keep transfer fees reasonable.

- Making it live on the XRP Mainnet 

- Expanding Verxio Protocol by enabling cross-chain transactions. Additionally, gas optimization in the StealthAddress contract and its interaction with the receiving side can be improved.

- Obtaining a legal opinion on Verxio Protocol's regulatory compliance would be beneficial. However, since the StealthAddress contract is on the blockchain and the code is available on GitHub, funds will remain accessible even if the website is shut down.

- Future UX improvements include notifications for funds received on new controlled stealth addresses and a mobile app (although the website is mobile-friendly). The possibilities are endless!


## Conclusion
- Verxio Protocol is a user-friendly and innovative solution that addresses the growing need for privacy in blockchain transactions. By leveraging stealth addresses and the XRP EVM compatible chain, Verxio Protocol provides a simple and cost-effective way for users to keep their financial transactions private. With a substantial market opportunity and a focus on usability, Verxio Protocol has the potential to become a leading privacy solution in the blockchain industry.

## Useful Links
- StealthAddress Contract: [0xA2A3b38f6088d729a1454BCD2863ce87B9953079](https://evm-sidechain.xrpl.org/tx/0x7e9dfa6fbad5b7b8a177b425322b7c4e6af72c83b80bddd06db202c4c6051768)
- Demo: https://verxio-xrp.vercel.app/
- Stream ID: 0x546a5cb5c0add53efbc60000644aa70204b20576/VerxioPool
- Link to Repo: https://github.com/amdonatusprince/verxio-XRP
- Video: https://youtu.be/JpgwevjiBww
