## Quick Guide

**Problem:** Web3 testing is hard - wallet popups, blockchain transactions, gas fees, network switching.

**Solution:** Synpress = Playwright + Web3 wallet automation. If you know Playwright, you already know most of Synpress.

### What Synpress Solves

- **Wallet automation** - Control MetaMask/Phantom programmatically
- **Transaction handling** - Confirm/reject transactions automatically  
- **Local blockchain** - Test with Anvil (instant, free transactions)
- **Mock wallets** - Fast unit tests without real wallets
- **Multi-wallet support** - MetaMask, Phantom, and more

### Quick Setup

```bash
pnpm add -D @synthetixio/synpress
```

```typescript
import { testWithSynpress } from '@synthetixio/synpress';
import { MetaMask } from '@synthetixio/synpress/playwright';

const test = testWithSynpress(baseTest);

test('connect wallet', async ({ context, page }) => {
  const metamask = new MetaMask(context);
  
  await page.goto('http://localhost:3000');
  await page.click('[data-testid="connect-wallet"]');
  await metamask.connectToDapp();
  
  // Wallet is now connected!
});
```

### Local Blockchain Testing

```typescript
import { startAnvil } from '@synthetixio/synpress/anvil';

test.beforeAll(async () => {
  await startAnvil({ 
    forkUrl: process.env.MAINNET_RPC_URL,
    forkBlockNumber: 18000000 
  });
});
```

**Benefits:** Instant transactions, free gas, deterministic state, real contract data.

### Key Patterns

```typescript
// Wallet connection
await metamask.connectToDapp();

// Transaction confirmation  
await metamask.confirmTransaction();

// Signature requests
await metamask.confirmSignature();

// Network switching
await metamask.switchNetwork('sepolia');

// Error handling
await metamask.rejectTransaction();
```

**The pitch:** If you're an SDET asked to test a Web3 dApp, this is the tool. The learning curve from Playwright is minimal - same concepts, just with wallet automation.

