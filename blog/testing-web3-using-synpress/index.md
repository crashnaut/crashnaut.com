---
title: "Testing Web3 Using Synpress"
slug: testing-web3-using-synpress
description: "Automate Web3 application testing with Synpress. Learn how to test MetaMask interactions, blockchain transactions, and DeFi applications using familiar Playwright patterns."
author: Mike Sell
date: 2025-10-18T00:00:00.000Z
tags: defi, blockchain, web3, playwright
---

## Introduction

You're comfortable with Playwright or Cypress. You can write E2E tests in your sleep. Then someone asks: *"Can you test our dApp?"*

You set up Playwright, write a test, click the "Connect Wallet" button... and hit a wall. How do you interact with MetaMask? How do you confirm transactions? How do you test against a blockchain?

**Synpress solves this.**

### What Makes Web3 Testing Different?

Traditional web apps interact with APIs and databases. Web3 apps interact with:
- **Wallets** (like MetaMask) that users install as browser extensions
- **Blockchains** (like Ethereum) that process transactions
- **Smart contracts** that execute business logic on-chain
- **Cryptocurrency** for gas fees and token swaps

This creates unique testing challenges:
- Wallet popups that appear outside your app's DOM
- Transaction confirmations that require user interaction
- Network switching and blockchain state management
- Gas fees and transaction timing

### Enter Synpress

Synpress is a testing framework built on Playwright that handles all the Web3-specific challenges:
- **Programmatic wallet control** (MetaMask, Phantom)
- **Transaction confirmations** and signature requests
- **Local blockchain testing** with Anvil
- **Wallet state management** and caching

If you know Playwright, you already know 90% of Synpress. It's just Playwright with Web3 superpowers.

> **Note:** This guide focuses on Playwright. Synpress also has experimental Cypress support.

## Prerequisites: Web3 Concepts You Need

If you're new to Web3, here are the key concepts you'll encounter:

### Wallets
- **MetaMask**: Browser extension that stores private keys and signs transactions
- **Wallet Address**: Public identifier (like `0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6`)
- **Private Key**: Secret key that controls the wallet (never share this!)

### Blockchains & Networks
- **Ethereum Mainnet**: The "production" blockchain (real money, real gas fees)
- **Testnets**: Free testing networks (Sepolia, Goerli) with test ETH
- **Local Networks**: Your own blockchain for testing (Anvil)

### Transactions
- **Gas**: Fee paid to execute transactions on Ethereum
- **Gas Price**: How much you pay per unit of gas
- **Transaction Hash**: Unique identifier for each transaction

### Smart Contracts
- **Contract Address**: Where the contract lives on the blockchain
- **ABI**: Application Binary Interface - tells you how to call contract functions
- **Events**: Logs emitted by smart contracts

### Common DeFi Patterns
- **Token Swap**: Exchange one token for another (like Uniswap)
- **Token Approval**: Permission for a contract to spend your tokens
- **Liquidity Pool**: Shared pool of tokens for trading

Don't worry if this feels overwhelming - Synpress handles most of the complexity for you!

## What Can Synpress Do?

Here's what Synpress brings to your testing toolkit:

**Wallet Automation**
- Control MetaMask programmatically
- Connect wallets, switch networks, confirm transactions
- Handle signature requests, token approvals
- Support for multiple wallets (MetaMask, Phantom)
- Built-in mock wallet for fast unit testing

**Blockchain Testing**
- Spin up local Ethereum nodes with Anvil
- Fork mainnet for realistic testing
- Set custom balances and blockchain state
- Fast, deterministic blockchain interactions

**Developer Experience**
- One-time wallet setup with browser state caching
- Full parallel test execution
- TypeScript support with full type safety
- All Playwright features (UI mode, traces, debugging)
- Test against real smart contracts locally

## Installation

If you don't have Playwright set up yet:

```bash
pnpm create playwright
```

Then add Synpress:

```bash
pnpm add -D @synthetixio/synpress
```

## Project Structure

Here's a basic structure for your Synpress tests:

```
your-project/
├── tests/
│   ├── e2e/
│   │   ├── wallet-connection.spec.ts
│   │   ├── token-swap.spec.ts
│   │   └── signature-requests.spec.ts
│   └── fixtures/
│       └── wallets.ts
├── playwright.config.ts
└── package.json
```

## Configuration

First, let's configure Playwright to work with Synpress. Create or update your `playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test';
import { defineWalletSetup } from '@synthetixio/synpress';

const SEED_PHRASE = process.env.SEED_PHRASE || 'test test test test test test test test test test test junk';
const WALLET_PASSWORD = process.env.WALLET_PASSWORD || 'TestPassword123!';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60000, // Web3 interactions can take time
  retries: 0, // Be careful with retries on blockchain tests
  workers: 3, // Parallel execution!
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'setup',
      testMatch: '**/*.setup.ts',
    },
    {
      name: 'chromium',
      use: {
        ...defineWalletSetup(SEED_PHRASE, WALLET_PASSWORD),
      },
      dependencies: ['setup'],
    },
  ],
});
```

## Setting Up Your Wallet Fixture

Synpress provides **built-in fixtures** for wallet operations. If you've used Playwright fixtures before, this will feel familiar.

### Using Built-in Fixtures

Synpress comes with built-in fixtures like MetaMask API access:

```typescript
import { testWithSynpress } from '@synthetixio/synpress';
import { test as base } from '@playwright/test';

const test = testWithSynpress(base);

// MetaMask fixture is automatically available
test('use built-in fixture', async ({ page, metamask }) => {
  // metamask fixture is ready to use
  await page.goto('/');
  await metamask.connectToDapp();
});
```

### Creating Custom Fixtures

You can also extend the test with custom fixtures in `tests/fixtures/wallets.ts`:

```typescript
import { test as base } from '@playwright/test';
import { testWithSynpress } from '@synthetixio/synpress';
import { MetaMask } from '@synthetixio/synpress/playwright';

export const test = testWithSynpress(base);

export const expect = test.expect;

// Export types for use in tests
type TestFixtures = {
  metamask: MetaMask;
};

export const walletTest = test.extend<TestFixtures>({
  metamask: async ({ context }, use) => {
    const metamask = new MetaMask(context);
    await use(metamask);
  },
});
```

> **Note:** Check the [official Synpress documentation](https://docs.synpress.io) for the complete fixture API reference.

## Basic Test: Wallet Connection

Let's write our first test. This is the "Hello World" of Web3 testing - connecting a wallet:

```typescript
// tests/e2e/wallet-connection.spec.ts
import { walletTest as test, expect } from '../fixtures/wallets';

test.describe('Wallet Connection', () => {
  test('should connect MetaMask to dApp', async ({ page, metamask }) => {
    // Navigate to your dApp
    await page.goto('/');
    
    // Find and click the "Connect Wallet" button
    // This triggers MetaMask to show a connection popup
    await page.click('[data-testid="connect-wallet"]');
    
    // Accept the MetaMask connection request
    // Synpress automatically handles the MetaMask popup
    await metamask.connectToDapp();
    
    // Verify the wallet is connected
    // Ethereum addresses are 40 characters starting with 0x
    const walletAddress = await page.locator('[data-testid="wallet-address"]').textContent();
    expect(walletAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  test('should display correct network', async ({ page, metamask }) => {
    await page.goto('/');
    await page.click('[data-testid="connect-wallet"]');
    await metamask.connectToDapp();
    
    // Switch to Sepolia testnet (free ETH for testing)
    await metamask.switchNetwork('sepolia');
    
    // Verify the network change is reflected in your dApp
    const network = await page.locator('[data-testid="current-network"]').textContent();
    expect(network).toBe('Sepolia');
  });
});
```

**What's happening here:**
1. **`page.click('[data-testid="connect-wallet"]')`** - Triggers your dApp's wallet connection flow
2. **`metamask.connectToDapp()`** - Synpress handles the MetaMask popup automatically
3. **Address validation** - Ensures we get a valid Ethereum address format
4. **Network switching** - Tests that your dApp responds to network changes

## Intermediate Test: Signature Requests

A common pattern in Web3 apps is asking users to sign messages. This is used for:
- **Authentication** (proving you own the wallet)
- **Off-chain data** (signing messages that aren't stored on blockchain)
- **Meta-transactions** (signing transactions for others to execute)

Here's how to test signature requests:

```typescript
// tests/e2e/signature-requests.spec.ts
import { walletTest as test, expect } from '../fixtures/wallets';

test.describe('Signature Requests', () => {
  test.beforeEach(async ({ page, metamask }) => {
    await page.goto('/');
    await page.click('[data-testid="connect-wallet"]');
    await metamask.connectToDapp();
  });

  test('should sign a message', async ({ page, metamask }) => {
    // Trigger a signature request in your dApp
    // This might be for login, voting, or any off-chain action
    await page.click('[data-testid="sign-message-button"]');
    
    // Wait for the signature request
    await page.waitForTimeout(1000); // Give MetaMask popup time to appear
    
    // Approve the signature in MetaMask
    await metamask.confirmSignature();
    
    // Verify the signature was successful
    await expect(page.locator('[data-testid="signature-status"]')).toHaveText('Signed');
  });

  test('should reject a signature request', async ({ page, metamask }) => {
    await page.click('[data-testid="sign-message-button"]');
    await page.waitForTimeout(1000);
    
    // Reject the signature (user clicks "Reject" in MetaMask)
    await metamask.rejectSignature();
    
    // Verify your dApp handles rejection gracefully
    await expect(page.locator('[data-testid="signature-status"]')).toHaveText('Rejected');
  });
});
```

**Key points:**
- **Signatures are free** - No gas fees, just cryptographic proof
- **Always test both paths** - Approval and rejection
- **Wait for popups** - MetaMask needs time to show signature requests

## Advanced Test: Token Swaps with Transaction Confirmation

Now let's get into the real stuff - testing a token swap flow. This is where Web3 testing gets complex because you're dealing with:
- **Real transactions** that cost gas fees
- **Smart contract interactions** 
- **Token approvals** (permission to spend tokens)
- **Slippage protection** (price changes during transaction)

```typescript
// tests/e2e/token-swap.spec.ts
import { walletTest as test, expect } from '../fixtures/wallets';

test.describe('Token Swap', () => {
  test.beforeEach(async ({ page, metamask }) => {
    await page.goto('/trade');
    await page.click('[data-testid="connect-wallet"]');
    await metamask.connectToDapp();
  });

  test('should execute a token swap', async ({ page, metamask }) => {
    // Step 1: Select tokens to swap
    await page.click('[data-testid="token-from-select"]');
    await page.fill('[data-testid="token-search"]', 'USDC');
    await page.click('[data-testid="token-USDC"]');
    
    await page.click('[data-testid="token-to-select"]');
    await page.fill('[data-testid="token-search"]', 'WETH');
    await page.click('[data-testid="token-WETH"]');
    
    // Step 2: Enter amount to swap
    await page.fill('[data-testid="amount-input"]', '100');
    
    // Step 3: Intercept API calls to verify backend integration
    const orderPromise = page.waitForResponse(
      response => response.url().includes('/api/v1/orders') && response.request().method() === 'POST'
    );
    
    // Step 4: Initiate the swap
    await page.click('[data-testid="swap-button"]');
    
    // Step 5: Review swap details in confirmation modal
    await expect(page.locator('[data-testid="swap-modal"]')).toBeVisible();
    
    // Verify swap details are correct
    const fromAmount = await page.locator('[data-testid="from-amount"]').textContent();
    expect(fromAmount).toContain('100 USDC');
    
    // Step 6: Confirm the swap in your dApp
    await page.click('[data-testid="confirm-swap"]');
    
    // Step 7: Confirm the transaction in MetaMask
    // This is where gas fees are paid and the transaction is sent to blockchain
    await metamask.confirmTransaction();
    
    // Step 8: Verify backend received the order
    const orderResponse = await orderPromise;
    expect(orderResponse.status()).toBe(201);
    
    // Step 9: Verify the order appears in the order book
    await expect(page.locator('[data-testid="order-book"]').first()).toContainText('USDC');
  });

  test('should handle insufficient balance error', async ({ page, metamask }) => {
    await page.click('[data-testid="token-from-select"]');
    await page.click('[data-testid="token-USDC"]');
    
    // Try to swap more tokens than the wallet has
    await page.fill('[data-testid="amount-input"]', '999999999');
    
    // Verify your dApp shows appropriate error
    await expect(page.locator('[data-testid="error-message"]'))
      .toContainText('Insufficient balance');
    
    // Verify swap button is disabled
    await expect(page.locator('[data-testid="swap-button"]')).toBeDisabled();
  });

  test('should reject transaction in MetaMask', async ({ page, metamask }) => {
    // Go through swap setup
    await page.click('[data-testid="token-from-select"]');
    await page.click('[data-testid="token-USDC"]');
    await page.fill('[data-testid="amount-input"]', '10');
    await page.click('[data-testid="swap-button"]');
    await page.click('[data-testid="confirm-swap"]');
    
    // User rejects the transaction in MetaMask
    await metamask.rejectTransaction();
    
    // Verify your dApp handles rejection gracefully
    await expect(page.locator('[data-testid="transaction-status"]'))
      .toContainText('Transaction rejected');
  });
});
```

**What's happening in this test:**
1. **Token Selection** - Choosing which tokens to swap
2. **Amount Input** - How much to swap
3. **API Integration** - Verifying backend receives the order
4. **Transaction Confirmation** - MetaMask popup for gas fees
5. **Error Handling** - Testing edge cases like insufficient balance
6. **Rejection Handling** - When users cancel transactions

## Anvil Integration: Local Blockchain Testing

Here's where Web3 testing gets interesting. **Anvil** (part of the Foundry toolkit) is a local Ethereum node you can spin up for testing. Think of it like a local database, but for blockchain:

- Fork mainnet and test against real contracts
- Instant transactions (no 12-second block times)
- Free gas
- Full control over blockchain state
- Deterministic and reproducible

First, install Foundry (which includes Anvil):

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

Now let's set up Anvil in your tests:

```typescript
// tests/e2e/anvil-setup.ts
import { test as setup } from '@playwright/test';
import { startAnvil } from '@synthetixio/synpress/anvil';

setup('start anvil', async () => {
  await startAnvil({
    forkUrl: process.env.MAINNET_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/your-api-key',
    forkBlockNumber: 18000000, // Optional: fork from specific block
    chainId: 1,
    port: 8545,
  });
});
```

Update your Playwright config to use this setup:

```typescript
export default defineConfig({
  // ... other config
  projects: [
    {
      name: 'setup',
      testMatch: '**/anvil-setup.ts',
    },
    {
      name: 'chromium',
      use: {
        ...defineWalletSetup(SEED_PHRASE, WALLET_PASSWORD),
      },
      dependencies: ['setup'],
    },
  ],
});
```

Now your tests will run against a local fork of mainnet:

```typescript
// tests/e2e/anvil-token-swap.spec.ts
import { walletTest as test, expect } from '../fixtures/wallets';

test.describe('Token Swap on Anvil Fork', () => {
  test('should swap tokens on forked mainnet', async ({ page, metamask }) => {
    // Your dApp should be configured to connect to localhost:8545
    await page.goto('/');
    
    // Connect wallet
    await page.click('[data-testid="connect-wallet"]');
    await metamask.connectToDapp();
    
    // Add custom network (localhost:8545)
    await metamask.addNetwork({
      name: 'Anvil Local',
      rpcUrl: 'http://127.0.0.1:8545',
      chainId: 1,
      symbol: 'ETH',
    });
    
    // Now execute your swap
    // Since we're on a fork, you have access to real mainnet state
    // but transactions are instant and free!
    await page.fill('[data-testid="amount-input"]', '1');
    await page.click('[data-testid="swap-button"]');
    await metamask.confirmTransaction();
    
    // Transaction confirms instantly on Anvil
    await expect(page.locator('[data-testid="transaction-status"]'))
      .toContainText('Confirmed', { timeout: 5000 });
  });
});
```

## Why Anvil + Synpress?

Coming from traditional E2E testing, Anvil gives you what you're used to:

1. **Speed**: Instant transactions (like mocking API responses)
2. **Isolation**: Each test can start with a fresh blockchain state
3. **Consistency**: Deterministic behavior (no flaky tests from network issues)
4. **Real data**: Fork mainnet to test against actual production contracts
5. **No setup overhead**: No test accounts, no faucet tokens, no gas fees

It's like having a seeded database for each test run, but for blockchain.

## Testing Without Real Wallets: Ethereum Wallet Mock

Synpress includes a **built-in mock wallet** that lets you test without MetaMask or any real wallet extension. This is perfect for:
- Fast unit/integration tests
- CI/CD pipelines where you don't need full wallet UI
- Testing basic Web3 interactions without the overhead

### Using the Mock Wallet

```typescript
import { testWithSynpress } from '@synthetixio/synpress';
import { test as base } from '@playwright/test';
import { createEthereumWalletMock } from '@synthetixio/synpress';

const test = testWithSynpress(base, {
  walletMock: true, // Enable mock wallet
});

test('test with mock wallet', async ({ page, wallet }) => {
  await page.goto('/');
  
  // The mock wallet automatically responds to connection requests
  await page.click('[data-testid="connect-wallet"]');
  
  // Mock wallet is connected instantly - no popup delays!
  const address = await page.locator('[data-testid="wallet-address"]').textContent();
  expect(address).toMatch(/^0x/);
});
```

### Benefits of Mock Wallet
- ⚡ **Blazing fast** - no browser extension overhead
- 🎯 **Deterministic** - same behavior every time
- 🔧 **Simple** - no MetaMask configuration needed
- 💰 **Free** - no need for test ETH on testnets

### When to Use Mock vs Real Wallet
- **Use Mock**: Unit tests, basic interactions, CI/CD
- **Use Real Wallet**: Full E2E tests, transaction confirmations, testing actual MetaMask UI/UX

## Multi-Wallet Support: MetaMask and Phantom

Synpress supports multiple wallet types:

### MetaMask (Ethereum)
```typescript
import { MetaMask } from '@synthetixio/synpress/playwright';

test('ethereum dapp', async ({ context, page }) => {
  const metamask = new MetaMask(context);
  await page.goto('/');
  await metamask.connectToDapp();
});
```

### Phantom (Solana)
For Solana dApps, use Phantom:

```typescript
import { Phantom } from '@synthetixio/synpress/playwright';

test('solana dapp', async ({ context, page }) => {
  const phantom = new Phantom(context);
  await page.goto('/');
  await phantom.connectToDapp();
});
```

This wallet-agnostic architecture means Synpress can expand to support more wallets in the future (Coinbase Wallet, Rainbow, etc.).

## Advanced: Testing Token Approvals

A common pattern in DeFi is token approvals. Here's how to test that flow:

```typescript
// tests/e2e/token-approvals.spec.ts
import { walletTest as test, expect } from '../fixtures/wallets';

test.describe('Token Approvals', () => {
  test('should approve token spending', async ({ page, metamask }) => {
    await page.goto('/trade');
    await page.click('[data-testid="connect-wallet"]');
    await metamask.connectToDapp();
    
    // Select a token that requires approval
    await page.click('[data-testid="token-from-select"]');
    await page.click('[data-testid="token-USDC"]');
    await page.fill('[data-testid="amount-input"]', '100');
    
    // Check if approval is needed
    const approveButton = page.locator('[data-testid="approve-button"]');
    if (await approveButton.isVisible()) {
      await approveButton.click();
      
      // Confirm the approval transaction
      await metamask.confirmTransaction();
      
      // Wait for approval to complete
      await expect(approveButton).not.toBeVisible({ timeout: 30000 });
    }
    
    // Now the swap button should be enabled
    await expect(page.locator('[data-testid="swap-button"]')).toBeEnabled();
  });

  test('should handle approval rejection', async ({ page, metamask }) => {
    await page.goto('/trade');
    await page.click('[data-testid="connect-wallet"]');
    await metamask.connectToDapp();
    
    await page.click('[data-testid="token-from-select"]');
    await page.click('[data-testid="token-DAI"]');
    await page.fill('[data-testid="amount-input"]', '50');
    
    const approveButton = page.locator('[data-testid="approve-button"]');
    if (await approveButton.isVisible()) {
      await approveButton.click();
      
      // Reject the approval
      await metamask.rejectTransaction();
      
      // Verify error handling
      await expect(page.locator('[data-testid="error-message"]'))
        .toContainText('Approval rejected');
    }
  });
});
```

## Running Your Tests

Run all tests:

```bash
npx playwright test
```

Run tests in UI mode (highly recommended for debugging):

```bash
npx playwright test --ui
```

Run a specific test file:

```bash
npx playwright test tests/e2e/token-swap.spec.ts
```

Run tests in parallel (this is where Synpress shines):

```bash
npx playwright test --workers=4
```

## Debugging Tips

1. **Use `--headed` mode**: See what's happening
   ```bash
   npx playwright test --headed
   ```

2. **Use `--debug` mode**: Step through tests
   ```bash
   npx playwright test --debug
   ```

3. **Inspect MetaMask state**: Add this to your test
   ```typescript
   const address = await metamask.getAccountAddress();
   console.log('Current address:', address);
   
   const balance = await metamask.getBalance();
   console.log('Current balance:', balance);
   ```

4. **Screenshot before assertion failures**:
   ```typescript
   await page.screenshot({ path: 'debug-screenshot.png' });
   ```

## Troubleshooting: Common Issues & Solutions

### 1. **MetaMask Popup Not Appearing**

**Problem:** You click "Connect Wallet" but MetaMask doesn't show up.

**Solutions:**
```typescript
// Add explicit waits for MetaMask popups
await page.click('[data-testid="connect-wallet"]');
await page.waitForTimeout(2000); // Give MetaMask time to load
await metamask.connectToDapp();

// Or wait for the popup to actually appear
await page.waitForSelector('[data-testid="metamask-popup"]', { timeout: 10000 });
```

### 2. **Tests Failing Due to Network Issues**

**Problem:** Tests work locally but fail in CI/CD.

**Solutions:**
```typescript
// Use testnets instead of mainnet in CI
test.beforeEach(async ({ metamask }) => {
  await metamask.switchNetwork('sepolia'); // Free testnet
});

// Or use Anvil for consistent local testing
await startAnvil({ forkUrl: process.env.MAINNET_RPC_URL });
```

### 3. **Transaction Timeouts**

**Problem:** Transactions take too long and tests timeout.

**Solutions:**
```typescript
// Increase timeout for blockchain operations
test.setTimeout(120000); // 2 minutes

// Or use Anvil for instant transactions
await startAnvil({ forkUrl: process.env.MAINNET_RPC_URL });
```

### 4. **Wallet State Persisting Between Tests**

**Problem:** Test A affects Test B because wallet state carries over.

**Solutions:**
```typescript
test.afterEach(async ({ page, context }) => {
  // Disconnect from dApp
  await page.evaluate(() => {
    window.ethereum?.request({ 
      method: 'wallet_revokePermissions',
      params: [{ eth_accounts: {} }]
    });
  });
  
  // Clear browser storage
  await context.clearCookies();
});
```

### 5. **Running Out of Test ETH**

**Problem:** Tests fail because wallet has no ETH for gas fees.

**Solutions:**
```typescript
// Use Anvil to set arbitrary balances
await anvil.setBalance(
  '0xYourAddress',
  ethers.utils.parseEther('1000') // 1000 ETH
);

// Or use faucets for testnets
// Sepolia: https://sepoliafaucet.com/
// Goerli: https://goerlifaucet.com/
```

### 6. **Flaky Tests Due to Network Congestion**

**Problem:** Tests pass/fail randomly due to blockchain network issues.

**Solutions:**
```typescript
// Use local Anvil fork for consistent testing
await startAnvil({ 
  forkUrl: process.env.MAINNET_RPC_URL,
  forkBlockNumber: 18000000 // Pin to specific block
});

// Or retry failed tests
test.describe.configure({ retries: 2 });
```

### 7. **Debugging MetaMask State**

**Problem:** Need to inspect what's happening in MetaMask.

**Solutions:**
```typescript
// Log MetaMask state
const address = await metamask.getAccountAddress();
console.log('Current address:', address);

const balance = await metamask.getBalance();
console.log('Current balance:', balance);

// Take screenshots for debugging
await page.screenshot({ path: 'debug-metamask.png' });
```

## Common Pitfalls

### 1. **Not waiting for MetaMask popups**

MetaMask operations take time. Always add appropriate waits:

```typescript
await page.click('[data-testid="swap-button"]');
await page.waitForTimeout(1000); // Give MetaMask popup time to appear
await metamask.confirmTransaction();
```

### 2. **Forgetting to handle network switching**

If your test needs a specific network:

```typescript
test.beforeEach(async ({ metamask }) => {
  await metamask.switchNetwork('mainnet');
});
```

### 3. **Not cleaning up state between tests**

If tests are interfering with each other:

```typescript
test.afterEach(async ({ page, context }) => {
  // Disconnect from dApp
  await page.evaluate(() => window.ethereum?.request({ 
    method: 'wallet_revokePermissions',
    params: [{ eth_accounts: {} }]
  }));
});
```

### 4. **Running out of test ETH**

When using Anvil, you can set arbitrary balances:

```typescript
// In your anvil setup
await anvil.setBalance(
  '0xYourAddress',
  ethers.utils.parseEther('1000')
);
```

## Real-World Example Structure

Here's how I structure my Web3 test suite:

```
tests/
├── e2e/
│   ├── setup/
│   │   ├── anvil.setup.ts          # Start Anvil
│   │   └── wallet.setup.ts         # Configure MetaMask
│   ├── specs/
│   │   ├── authentication/
│   │   │   ├── wallet-connection.spec.ts
│   │   │   └── wallet-switching.spec.ts
│   │   ├── trading/
│   │   │   ├── token-swap.spec.ts
│   │   │   ├── limit-orders.spec.ts
│   │   │   └── order-cancellation.spec.ts
│   │   ├── staking/
│   │   │   ├── stake-tokens.spec.ts
│   │   │   └── unstake-tokens.spec.ts
│   │   └── governance/
│   │       ├── create-proposal.spec.ts
│   │       └── vote-proposal.spec.ts
│   ├── fixtures/
│   │   ├── wallets.ts
│   │   └── anvil.ts
│   └── utils/
│       ├── blockchain.ts           # Helper functions for blockchain ops
│       └── test-data.ts            # Test constants
├── playwright.config.ts
└── package.json
```

## Environment Variables

Create a `.env.test` file:

```bash
# Wallet
SEED_PHRASE="test test test test test test test test test test test junk"
WALLET_PASSWORD="TestPassword123!"

# RPC URLs
MAINNET_RPC_URL="https://eth-mainnet.g.alchemy.com/v2/your-api-key"
SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/your-api-key"

# Anvil
ANVIL_FORK_URL="$MAINNET_RPC_URL"
ANVIL_FORK_BLOCK_NUMBER="18000000"

# App
APP_URL="http://localhost:3000"
```

Load it in your tests:

```typescript
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });
```

## Important Notes & Gotchas

### Test Isolation with Anvil
Blockchain state persists between tests. If test A buys 100 tokens, test B starts with those tokens already purchased. Always reset:

```typescript
test.beforeEach(async () => {
  // Reset Anvil to a clean state
  await anvil.reset();
});
```

Think of it like database transactions in API testing - you need to clean up between tests.

### Framework Support
- **Playwright**: Fully supported (recommended)
- **Cypress**: Experimental support

### Wallet Popups
MetaMask operations can take a moment. Add small waits after triggering wallet interactions:

```typescript
await page.click('[data-testid="swap-button"]');
await page.waitForTimeout(1000); // Give MetaMask popup time
await metamask.confirmTransaction();
```

## Conclusion

If you're an SDET being asked to test Web3 applications, Synpress is your answer. It gives you:

- **Familiar patterns** - Same Playwright concepts you already know
- **Wallet automation** - No more manual MetaMask clicking
- **Local blockchain testing** - Fast, deterministic, and free
- **Parallel execution** - Scale your test suite efficiently
- **Mock wallets** - Fast feedback loops for development
- **Multi-wallet support** - MetaMask, Phantom, and more

### The Learning Curve is Minimal

Coming from traditional E2E testing, Synpress feels familiar:
- **Fixtures** - Same concept, just with wallet objects
- **Page objects** - Same patterns, just with Web3 interactions
- **Assertions** - Same expectations, just with blockchain data
- **Debugging** - Same tools, just with wallet state

### What You Can Test Now

You now have patterns for:
- ✅ **Wallet connections** and network switching
- ✅ **Signature requests** (approval/rejection)  
- ✅ **Token swaps** with transaction confirmation
- ✅ **Token approvals** and spending permissions
- ✅ **Error handling** for insufficient balances
- ✅ **Local blockchain testing** with Anvil
- ✅ **Mock wallets** for fast feedback
- ✅ **Multi-wallet support** (MetaMask, Phantom)

### The Future is Web3

Web3 testing doesn't have to be mysterious or painful. With Synpress, it's just E2E testing with extra steps. As Web3 becomes mainstream, having these testing skills will be invaluable.

**Start with Synpress today** - your future self will thank you when Web3 testing becomes the norm, not the exception.

## Resources

- [Synpress GitHub](https://github.com/synpress-io/synpress)
- [Synpress Documentation](https://synpress.io)
- [Playwright Documentation](https://playwright.dev)
- [Foundry/Anvil Documentation](https://book.getfoundry.sh/anvil/)

---

*Have questions or run into issues? Feel free to reach out or open an issue on the Synpress GitHub repo. The maintainers are responsive and the community is growing.*
