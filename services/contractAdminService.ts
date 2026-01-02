/**
 * Contract Admin Service
 * Checks if a wallet address is the owner/admin of the SOUL token contract
 */

import { IProvider } from '@web3auth/base';
import { ethers } from 'ethers';

// Known owner address (from deployment)
const KNOWN_OWNER_ADDRESS = '0xa3776C306A704cebDa63440d158a8E914267f958';

// SOUL Token Contract ABI (for AccessControl contracts)
const SOUL_TOKEN_ABI = [
  "function owner() external view returns (address)",
  "function hasRole(bytes32 role, address account) external view returns (bool)",
  "function DEFAULT_ADMIN_ROLE() external view returns (bytes32)",
  "function getRoleAdmin(bytes32 role) external view returns (bytes32)",
];

/**
 * Check if an address is the contract owner/admin
 */
export async function isContractOwner(
  address: string,
  provider: IProvider,
  contractAddress: string
): Promise<boolean> {
  try {
    if (!address || !contractAddress) {
      console.log('[Admin Check] Missing address or contract address');
      return false;
    }

    // Normalize addresses for comparison
    const normalizedAddress = address.toLowerCase();
    const normalizedContractAddress = contractAddress.toLowerCase();

    // Quick check: if address matches known owner, return true immediately
    if (normalizedAddress === KNOWN_OWNER_ADDRESS.toLowerCase()) {
      console.log('[Admin Check] Address matches known owner:', normalizedAddress);
      return true;
    }

    // Try to check via contract
    try {
      const ethersProvider = new ethers.BrowserProvider(provider as any);
      const contract = new ethers.Contract(normalizedContractAddress, SOUL_TOKEN_ABI, ethersProvider);

      // First, try checking DEFAULT_ADMIN_ROLE (for AccessControl contracts)
      try {
        const adminRole = await contract.DEFAULT_ADMIN_ROLE();
        console.log('[Admin Check] Admin role:', adminRole);
        
        const hasRole = await contract.hasRole(adminRole, normalizedAddress);
        console.log('[Admin Check] Has admin role:', hasRole, 'for address:', normalizedAddress);
        
        if (hasRole) {
          return true;
        }
      } catch (roleError) {
        console.log('[Admin Check] Error checking DEFAULT_ADMIN_ROLE:', roleError);
      }

      // Fallback: try to get owner (for Ownable contracts)
      try {
        const owner = await contract.owner();
        const isOwner = owner.toLowerCase() === normalizedAddress;
        console.log('[Admin Check] Owner check:', isOwner, 'owner:', owner, 'address:', normalizedAddress);
        return isOwner;
      } catch (ownerError) {
        console.log('[Admin Check] Contract does not have owner() function');
      }

      return false;
    } catch (providerError) {
      console.error('[Admin Check] Provider error:', providerError);
      // Fallback to known owner check
      return normalizedAddress === KNOWN_OWNER_ADDRESS.toLowerCase();
    }
  } catch (error) {
    console.error('[Admin Check] Error checking contract ownership:', error);
    // Fallback: check against known owner address
    if (address) {
      return address.toLowerCase() === KNOWN_OWNER_ADDRESS.toLowerCase();
    }
    return false;
  }
}

/**
 * Get contract owner address
 */
export async function getContractOwner(
  provider: IProvider,
  contractAddress: string
): Promise<string | null> {
  try {
    if (!contractAddress) return null;

    const ethersProvider = new ethers.BrowserProvider(provider as any);
    const contract = new ethers.Contract(contractAddress, SOUL_TOKEN_ABI, ethersProvider);

    try {
      const owner = await contract.owner();
      return owner;
    } catch {
      // If owner() doesn't exist, return null
      return null;
    }
  } catch (error) {
    console.error('Error getting contract owner:', error);
    return null;
  }
}

/**
 * Check admin status for multiple contracts
 */
export async function checkAdminStatus(
  address: string,
  provider: IProvider,
  contractAddresses: {
    soulToken?: string;
    tokenSale?: string;
    vesting?: string;
    liquidityManager?: string;
  }
): Promise<{
  isAdmin: boolean;
  isSoulTokenOwner: boolean;
  isTokenSaleOwner: boolean;
  isVestingOwner: boolean;
  isLiquidityManagerOwner: boolean;
}> {
  const results = {
    isAdmin: false,
    isSoulTokenOwner: false,
    isTokenSaleOwner: false,
    isVestingOwner: false,
    isLiquidityManagerOwner: false,
  };

  try {
    // Check SOUL token contract ownership (primary admin check)
    if (contractAddresses.soulToken) {
      results.isSoulTokenOwner = await isContractOwner(
        address,
        provider,
        contractAddresses.soulToken
      );
      if (results.isSoulTokenOwner) {
        results.isAdmin = true;
      }
    }

    // Check other contracts (optional - for granular permissions)
    if (contractAddresses.tokenSale) {
      results.isTokenSaleOwner = await isContractOwner(
        address,
        provider,
        contractAddresses.tokenSale
      );
    }

    if (contractAddresses.vesting) {
      results.isVestingOwner = await isContractOwner(
        address,
        provider,
        contractAddresses.vesting
      );
    }

    if (contractAddresses.liquidityManager) {
      results.isLiquidityManagerOwner = await isContractOwner(
        address,
        provider,
        contractAddresses.liquidityManager
      );
    }

    return results;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return results;
  }
}

