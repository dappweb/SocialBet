# Fiat On-Ramp Integration

## Overview

Complete fiat on-ramp integration allowing users to purchase cryptocurrency (ETH) with fiat currency (USD, EUR, etc.) and convert it to SOUL tokens. Supports multiple providers for maximum availability and user choice.

## ✅ Implemented Features

### 1. Multi-Provider Support

**Providers Supported**:
- ✅ **Web3Auth** - Built-in secure on-ramp (primary)
- ✅ **MoonPay** - Credit card & bank transfer
- ✅ **Transak** - Global payment methods
- ✅ **Ramp** - Fast & secure payments

**Service**: `services/fiatOnRampService.ts`

**Features**:
- Automatic provider fallback
- Provider selection UI
- Configurable via environment variables
- Wallet address integration

### 2. FiatOnRampModal Component

**Component**: `components/FiatOnRampModal.tsx`

**Features**:
- ✅ Amount input with preset options ($25, $50, $100, $250, $500, $1000)
- ✅ Provider selection (Web3Auth, MoonPay, Transak, Ramp)
- ✅ SOUL token preview (shows how many SOUL tokens will be received)
- ✅ Real-time calculations
- ✅ Wallet address validation
- ✅ Error handling
- ✅ Dark mode support

### 3. Integration Points

**SoulPurchaseModal**:
- ✅ Opens FiatOnRampModal when "Fiat (USD)" is selected
- ✅ Handles purchase success callback
- ✅ Updates SOUL balance after purchase

**BetModal**:
- ✅ "Buy SOUL Tokens" button when insufficient balance
- ✅ Opens FiatOnRampModal with suggested amount
- ✅ Refreshes balance after purchase

**tokenTrading.ts**:
- ✅ Updated `buySoulWithFiat()` to use fiat on-ramp service
- ✅ Supports wallet address parameter
- ✅ Returns transaction details

## 🔧 Configuration

### Environment Variables

Add to `.env.local`:

```env
# MoonPay (Optional)
VITE_MOONPAY_API_KEY=your_moonpay_api_key

# Transak (Optional)
VITE_TRANSAK_API_KEY=your_transak_api_key

# Ramp (Optional)
VITE_RAMP_API_KEY=your_ramp_api_key
```

**Note**: Web3Auth works without additional API keys if Web3Auth is already configured.

### Getting API Keys

1. **MoonPay**:
   - Sign up at https://www.moonpay.com/
   - Get API key from dashboard
   - Supports credit cards, bank transfers

2. **Transak**:
   - Sign up at https://transak.com/
   - Get API key from developer dashboard
   - Supports 100+ payment methods globally

3. **Ramp**:
   - Sign up at https://ramp.network/
   - Get API key from dashboard
   - Fast KYC and payments

## 📊 User Flow

### Buying SOUL with Fiat

1. **User clicks "Buy SOUL" or "Purchase SOUL"**
2. **SoulPurchaseModal opens**
3. **User selects "Fiat (USD)" payment method**
4. **FiatOnRampModal opens**:
   - User enters amount (or selects preset)
   - User selects provider
   - Preview shows SOUL tokens to receive
5. **User clicks "Buy with [Provider]"**
6. **External window opens** (provider's checkout)
7. **User completes purchase**:
   - KYC verification (if required)
   - Payment processing
   - ETH delivered to wallet
8. **User can then purchase SOUL tokens** with the ETH

### Insufficient Balance Flow

1. **User tries to place bet** with insufficient SOUL
2. **BetModal shows "Insufficient SOUL Balance" message**
3. **"Buy SOUL Tokens" button appears**
4. **FiatOnRampModal opens** with suggested amount
5. **User completes fiat purchase**
6. **Balance refreshes automatically**
7. **User can retry bet**

## 💰 Pricing & Fees

### SOUL Token Price
- **Price**: $0.05 USD per SOUL
- **ETH Price**: ~$2000 USD per ETH (approximate)

### Provider Fees
- **Web3Auth**: Varies by provider
- **MoonPay**: ~3.5% + network fees
- **Transak**: ~1-3% depending on payment method
- **Ramp**: ~2-4% depending on payment method

### Platform Fees
- **2.5%** platform fee on all SOUL token trades
- Applied after fiat purchase (when converting ETH to SOUL)

## 🔄 Integration Details

### Service Functions

**`fiatOnRampService.ts`**:

```typescript
// Main function - tries multiple providers
buyCryptoWithFiat(config, web3auth?, preferredProvider?)

// Individual provider functions
buyCryptoWithWeb3Auth(web3auth, config)
buyCryptoWithMoonPay(config)
buyCryptoWithTransak(config)
buyCryptoWithRamp(config)

// Utility functions
getAvailableProviders() // Returns list of configured providers
```

### Component Usage

**FiatOnRampModal**:
```tsx
<FiatOnRampModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onSuccess={(soulAmount) => {
    // Handle successful purchase
    updateBalance(soulAmount);
  }}
  defaultAmount={50} // Optional default amount
/>
```

## 🎯 Features

### 1. Automatic Provider Fallback
- Tries preferred provider first
- Falls back to other providers if preferred fails
- Ensures maximum availability

### 2. Real-Time Calculations
- Shows SOUL tokens to receive
- Updates as user changes amount
- Displays price per SOUL

### 3. Wallet Integration
- Automatically uses connected wallet address
- Validates wallet connection
- Shows clear error if wallet not connected

### 4. User Experience
- Preset amounts for quick selection
- Provider comparison
- Clear instructions
- Error messages
- Success notifications

## 🔐 Security

### KYC/AML
- All providers handle KYC/AML compliance
- User verification required for larger amounts
- Secure payment processing

### Wallet Security
- Uses user's connected wallet
- No private key exposure
- Secure transaction handling

## 📝 Implementation Notes

### Current Flow
1. User buys ETH with fiat (via on-ramp)
2. ETH is delivered to user's wallet
3. User can then use ETH to buy SOUL tokens (separate flow)

### Future Enhancement
- Direct fiat → SOUL conversion (one-step process)
- Automatic SOUL token purchase after ETH receipt
- Integration with DEX for instant conversion

## 🚀 Usage Examples

### From SoulPurchaseModal
```typescript
// When user selects "Fiat" payment method
setIsFiatModalOpen(true);
```

### From BetModal
```typescript
// When user has insufficient balance
<button onClick={() => setIsFiatModalOpen(true)}>
  Buy SOUL Tokens
</button>
```

### Direct Usage
```typescript
import { buyCryptoWithFiat } from '../services/fiatOnRampService';

const result = await buyCryptoWithFiat({
  amount: 100,
  currency: 'USD',
  walletAddress: userWalletAddress,
}, web3auth, 'moonpay');
```

## 📊 Provider Comparison

| Provider | Fees | Payment Methods | KYC | Speed |
|----------|------|----------------|-----|-------|
| Web3Auth | Varies | Multiple | Yes | Fast |
| MoonPay | ~3.5% | Credit Card, Bank | Yes | Medium |
| Transak | 1-3% | 100+ methods | Yes | Fast |
| Ramp | 2-4% | Credit Card, Bank | Yes | Very Fast |

## ✅ Status

**Fiat On-Ramp Integration: COMPLETE**

- ✅ Multi-provider support
- ✅ FiatOnRampModal component
- ✅ Integration with SoulPurchaseModal
- ✅ Integration with BetModal
- ✅ Service layer implementation
- ✅ Error handling
- ✅ User experience optimization

## 🔄 Next Steps

1. **Test with real API keys** (when available)
2. **Add direct fiat → SOUL conversion** (future enhancement)
3. **Monitor provider availability** and performance
4. **Add analytics** for fiat purchases
5. **Implement off-ramp** (fiat withdrawal) functionality

## 📚 Related Documentation

- `SOUL_TOKEN_INTEGRATION.md` - SOUL token usage
- `SOUL_TOKEN_TRADING.md` - Token trading features
- `PREDICTION_MARKET_SEPOLIA.md` - Prediction market details

