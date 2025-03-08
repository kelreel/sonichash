export const SONIC_DOCS = [
  {
    title: 'overview',
    description: `Sonic is the highest-performing EVM L1, combining speed, incentives, and world-class infrastructure for DeFi. The chain provides 10,000 TPS and sub-second finality.
    Developers and users on Sonic are supported by several incentive programs, including Fee Monetization:
    Earn up to 90% of the fees your apps generate, similar to the ad-revenue model.
    Innovator Fund: Up to 200 million S to onboard apps to Sonic and support new ventures.
    Airdrop: ~200 million S to incentivize users of both Opera and the Sonic chain.`,
  },
  {
    title: 'overview',
        description: `Sonic delivers exceptional performance, enabling developers to scale their applications without limits while ensuring smooth user experiences.

    10,000 Transactions per Second

    Sub-Second Finality

    EVM Compatible

    Solidity/Vyper Support

    The native token of Sonic is S, which is used for transaction fees, staking, running validators, and participating in governance. Users holding FTM can upgrade to S on a 1:1 basis.

    Furthermore, the Sonic Gateway provides developers and users with seamless access to vast liquidity through a secure bridge connected to Ethereum. With a unique fail-safe mechanism, it ensures your assets are protected in all circumstances.`,
  },
  {
    title: 'S token',
    description: `The S token is the native token of Sonic. It has multiple roles within the network, such as paying for transaction fees, staking, running validators, and participating in governance.

Upgrade Portal — Upgrade FTM to S.

Staking
You can stake S on Sonic on MySonic. Staking your S involves a 14-day waiting period if you choose to withdraw.

When staking your S, choose a reputable validator carefully. If your validator is penalized for misconduct or errors in their setup, it could impact your delegated S stake as well.

Tokenomics
At Sonic’s launch, the total supply of S is 3.175 billion. As decided by multiple governance proposals, the additions below will gradually be implemented into the tokenomics of the S token.

Airdrop
An additional 6% of the 3.175 billion S will be minted six months after Sonic launches exclusively used for the airdrop program, rewarding both Fantom Opera and Sonic users and builders. The airdrop features an innovative burn mechanism that rewards active participation and gradually reduces the total supply of S tokens.

Ongoing Funding
Six months after Sonic launches, the network will mint additional S tokens to:

Increase S adoption and global presence

Grow the team and scale operations to drive increased adoption

Implement robust marketing initiatives and DeFi onboarding campaigns

To fund this program, an additional 1.5% of S (47,625,000 tokens) will be minted annually for six years, starting six months after the mainnet launch. 

However, to guard against inflation, the network will burn newly minted tokens not used during the year, ensuring that 100% of all newly minted tokens from this initiative are allocated toward network growth rather than being held by the treasury for later use.

For example, if Sonic Labs uses only 5,000,000 tokens in the first year, the network will burn the remaining 42,625,000 tokens.

Block Rewards
We are migrating block rewards from Fantom Opera to Sonic. As validators and stakers move to Sonic, Opera's block rewards will be reduced to zero, and the saved funds will be used to reward Sonic validators. The Sonic Foundation will maintain Opera validators for now.

To achieve a 3.5% APR for Sonic without causing further inflation in the first four years, we're reallocating the remaining FTM block rewards from Opera to Sonic. These rewards are technically part of the initial 3.175 billion S supply, but the circulating supply at launch will be ~2.88 billion tokens. The annual difference of 70 million tokens will be distributed as validator rewards over the first four years, avoiding the need to mint new S tokens during this period for block rewards.

As a result, Opera's APR dropped to zero upon Sonic's launch. To preserve value and avoid new inflationary rewards at Sonic's inception, we will not mint new tokens for block rewards during the initial four years, as stated. After that period, S block rewards will resume by minting new tokens at a rate of 1.75% per year to reward validators.

Token Burn
We have three burn mechanisms in place that will decrease the emission of new S tokens.

Fee Monetization Burn

If a user submits a transaction on an app that isn't participating in FeeM, 50% of the transaction fee will be burned.

Airdrop Burn

Users who choose not to wait for the full 270-day maturation period for 75% of their airdrop will lose a portion of their S tokens, which will be burned.

Ongoing Funding Burn

From the 47,625,000 S tokens minted annually in the first six years of Sonic to fund growth, the network will burn any of the tokens not used during the year.

Validator Rewards
To help secure the Sonic network by running a validator and staking a certain amount of S, you can earn block rewards as well as transaction fees paid by users on Sonic. 

Block Rewards
The target reward rate for validators on Sonic is 3.5% when 50% of the network is staked. The network mints tokens each epoch to provide this, except during Sonic's first four years when rewards stem from block rewards migrated from Opera, as outlined above.

The reward rate adjusts proportionally, e.g. if all S tokens are staked, the annual reward is 1.75%. Conversely, if only 25% of S tokens are staked, the annual reward is 7%.

Network Fees
Network fees are generated when users pay gas to interact with the network. Validators earn a percentage of these fees, which are distributed equally among all staked S tokens. For a detailed breakdown of how much a validator earns from gas fees, see here.

Ecosystem Vault
The Ecosystem Vault was initially launched on Fantom Opera to fuel the community ecosystem by sharing a percentage of total fees on the network with select apps in the community.

To extend this program to the Sonic chain, we'll revise the program to allocate quarterly disbursements from the Ecosystem Vault to the Sonic Community Council (SCC), an independently operated collective of ecosystem members who actively contribute to elevating the Sonic community via user-based programs, developer onboarding, and app support.

The amount will be decided at the discretion of the Sonic Foundation and reflect the SCC’s previous quarter performance.`
  }, {
    title: 'Sonic Gateway',
    description: `The Sonic Gateway is our native bridge that facilitates token transfers between Ethereum and Sonic. The bridging process consists of three steps:

Deposit
Deposit your assets into the bridge, which takes ~15 minutes on Ethereum to achieve finalization and only ~1 second on Sonic.

Heartbeat
After your deposit is confirmed, your assets will be bridged at the next heartbeat, which are intervals that bridge user assets in batches to ensure gas efficiency.  A heartbeat occurs every ~10 minutes from Ethereum to Sonic and ~1 hour the other way. You can pay a Fast Lane fee to trigger an immediate heartbeat.

Claim
Claim your bridged assets on the destination chain. That’s it! You’re now free to explore the Sonic ecosystem with your new assets.

— Introduction
— Fail-Safe Mechanism
— Fast Lane
— Looking Into the Future
— Frequently Asked Questions

Introduction
In today’s evolving blockchain landscape, a native, secure bridge is critical for ecosystem health, ensuring true interoperability and preventing network isolation. Yet, many current solutions on both layer-1 and layer-2 compromise security and speed —resulting in over $2.5 billion lost to bridge hacks.

The Sonic Gateway is a revolutionary, secure bridge between Ethereum and Sonic that offers:

Security: The Gateway includes a fail-safe mechanism that safeguards user assets. If the Gateway experiences prolonged failure (14 consecutive days), users can recover their bridged funds on Ethereum.

Speed: Asset bridging is processed in intervals called "heartbeats" to ensure gas efficiency — every 10 minutes from Ethereum to Sonic and hourly in reverse.

At launch, the Sonic Gateway will only support bridging four tokens from Ethereum — USDC, EURC, WETH, and FTM. Our roadmap includes adding more tokens and introducing a permissionless mechanism for anyone to add new tokens for bridging.

While Sonic is not an L2, we are active participants on Ethereum as we spend ETH through the Sonic Gateway contracts.


Credit: Pavel Paramonov
Fail-Safe Mechanism
The Sonic Gateway includes a fail-safe mechanism that allows users to retrieve bridged assets on the original chain if the Gateway experiences a failure. In the highly unlikely event that the Gateway or the Sonic chain is down for 14 consecutive days, users are able to reclaim their bridged assets on Ethereum.

The 14-day period is immutable and cannot be altered by Sonic Labs or any third party after deployment. Importantly, this period is not intended as a contest period but rather as an essential feature that ensures users retain custody of their bridged funds on the originating chain.


Credit: Pavel Paramonov
Fast Lane
Assets bridged through the Sonic Gateway are processed in intervals called "heartbeats", ensuring gas efficiency by bundling bridging transactions together. For assets moving from Ethereum to Sonic, these heartbeats occur every 10 minutes, while Sonic to Ethereum heartbeats occur every hour.

During each interval, all queued transactions are processed simultaneously. While this system reduces costs, it may introduce waiting periods for users needing their assets bridged immediately. To address this, Fast Lane allows users to bypass the wait for a small fee and have their bridge transaction processed instantly.

Fast Lane works by adding an additional heartbeat to the Gateway. This means all other queued assets waiting to be bridged are also processed immediately, effectively accelerating the entire network. By using Fast Lane, users not only avoid delays and seize timely opportunities but also contribute to the broader ecosystem's efficiency, ensuring faster bridging for everyone involved.

Looking Into the Future
By enabling canonical access to native assets from other layer-1 platforms, the Gateway fosters a secure and thriving economy on the Sonic network.

Users can directly access these canonical assets on Sonic while maintaining asset security. The Sonic Gateway thus provides safe access to high-demand assets that natively exist outside the Sonic network.
`
  },
  {
    title: 'Sonic mainnet',
    description: `
Network name: Sonic

RPC URL: https://rpc.soniclabs.com

Explorer URL: https://sonicscan.org

Chain ID: 146

Currency symbol: S`
  },
  {
    title: 'Airdrop',
    description: `The S airdrop will distribute 190,500,000 S tokens to incentivize users of both Opera and the Sonic chain. The airdrop will be distributed using two main approaches, Sonic Points and Sonic Gems.,
    The first season of the S airdrop becomes claimable six months after Sonic’s launch, around June 2025. At that time, 25% of your allocation is immediately available, while the remaining 75% vests over 270 days as NFT positions.

A linear decay mechanism applies to the vested portion, allowing you to claim early at the cost of a penalty that burns a portion of your tokens. This approach prevents sudden surges in circulating supply by burning tokens from users who choose to claim early. It also incentivizes recipients to stay active on-chain while waiting for an optimal time to claim the remainder of their allocation.

The chart below illustrates how many tokens will be burned based on when users choose to claim their vested airdrop allocation.`
  },
  {
    title: 'Sonic Points',
    description: `Passive Points — Hold Assets
Users can earn passive points by holding whitelisted assets directly in their Web3 wallets, such as Rabby or MetaMask, including hardware wallets. Assets held on centralized exchanges are not eligible.

Please note that WETH, scUSD, scETH, scBTC, LBTC, SolvBTC, and SolvBTC.BBN earn activity points only, not passive points.,
Activity Points — Deploy Assets on Apps
By deploying whitelisted assets as liquidity on participating apps, users will earn activity points, which provide 2x the amount of points compared to simply holding assets passively. A list of participating apps is available on the points dashboard., App Points (Gems) — Earn Further Allocation
The S airdrop includes a developer-focused portion, where apps compete for an airdrop allocation known as Sonic Gems. Apps can redeem these Gems for S tokens, which they can then distribute to their users however they want.

To decide how these S tokens are distributed to their users, each app will run its own independent points program, entirely at its discretion. The app may consider various things, such as the amount of liquidity a user has deployed, the duration of deployment, and the specific pools to which a user has added liquidity.

As a user, you will be earning passive and activity points regardless. Your goal is to identify which app has the points program that will offer the highest return for your liquidity. The challenge lies in maximizing your overall rewards by combining the yield earned from providing liquidity with the points earned from the app's points program.,
Airdrop Points Dashboard
The Sonic points dashboard is a comprehensive platform where users can:

Check earned points

Check the list of participating apps

Get whitelisted assets through a simple interface

Generate a referral code and share with friends to earn extra points

View a leaderboard that displays the points and Gems earned by users and apps`
  },
  {
    title: 'Sonic Gems',
    description: `The S airdrop includes a developer-focused portion, where apps compete for an airdrop allocation known as Sonic Gems. Apps can redeem these Gems for S tokens, which they can then distribute to their users however they want. What are Sonic Gems?
Sonic Gems are airdrop points exclusively designed for apps. Each season, a fixed supply of Gems is allocated to apps based on performance metrics. Apps can track their progress through the points dashboard.

To distribute the S tokens earned through Gems to their users, apps must manage the process independently. For example, an app could:

Mint a new token representing its share of Gems.

Maintain an internal record of user balances.

Use the third-party Merkl program

Join Sonic Builders on Telegram for further support

Unlike Sonic Points, which are airdrop points designed for users, Gems empower apps to claim liquid S tokens instead of vested NFT airdrop position. Once the S tokens are claimed, it’s the app’s responsibility to determine how they’re distributed to their users.

While there’s no strict requirement for apps to share a specific percentage of their claimed S tokens with their users, the design of Gems incentivizes generosity. Apps that share a larger portion of their claimed S with their communities are rewarded more favorably compared to those that do not. Sonic Gems are distributed by considering factors such as category type, Sonic exclusivity, and effective reward distribution, promoting fairness and incentivizing active participation. 

The competitive PvP nature and fixed supply of Gems mean that an app's Gem balance may fluctuate daily, influenced by the performance of other apps on the platform.

Below are the key criteria that will determine an app's share of Gems in season 1.`
  },
  {
    title: 'Migration',
    description: `
    Sonic is an EVM blockchain featuring the native S token, which is used for transaction fees, staking, running validators, and participating in governance.

Sonic is migrating from the Fantom chain and its FTM token. Users holding FTM can now upgrade to S.

Here is an overview of the migration timeline and associated events:

Event,Period:
- Sonic launch: December 18, 2024
- Migration period: Launch onwards
- Two-way swap between FTM and S: First 90 days
- One-way swap (FTM to S only): After 90 days`
  }
]
