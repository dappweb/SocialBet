/**
 * Contract Configuration Utility
 * Helps resolve contract addresses based on network
 */

/**
 * Get contract address for current network
 */
export function getContractAddress(chainId?: number): string {
  // Try environment variables first
  const sepoliaAddress = import.meta.env.VITE_SOUL_TOKEN_SEPOLIA;
  const mainnetAddress = import.meta.env.VITE_SOUL_TOKEN_MAINNET;
  const localAddress = import.meta.env.VITE_SOUL_TOKEN_LOCAL;

  if (!chainId) {
    // Default to sepolia if no chainId provided
    return sepoliaAddress || '';
  }

  // Mainnet
  if (chainId === 1) {
    return mainnetAddress || '';
  }

  // Sepolia
  if (chainId === 11155111) {
    return sepoliaAddress || '';
  }

  // Localhost / Hardhat
  if (chainId === 31337 || chainId === 1337) {
    return localAddress || '';
  }

  // Default to sepolia
  return sepoliaAddress || '';
}

/**
 * Get platform address for fees (market creation, etc.)
 */
export function getPlatformAddress(): string {
  return import.meta.env.VITE_PLATFORM_ADDRESS || '';
}

/**
 * Check if contract is configured for current network
 */
export function isContractConfigured(chainId?: number): boolean {
  const address = getContractAddress(chainId);
  return address !== '' && address.startsWith('0x');
}

/**
 * Get network name from chainId
 */
export function getNetworkName(chainId?: number): string {
  if (!chainId) return 'Unknown';
  
  switch (chainId) {
    case 1:
      return 'Ethereum Mainnet';
    case 11155111:
      return 'Sepolia Testnet';
    case 31337:
    case 1337:
      return 'Localhost';
    case 56:
      return 'BSC Mainnet';
    case 97:
      return 'BSC Testnet';
    default:
      return `Chain ${chainId}`;
  }
}






