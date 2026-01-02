/**
 * Contract Admin Service
 * Checks if a wallet address is the owner of the SOUL token contract
 */

import { IProvider } from '@web3auth/base';
import { ethers } from 'ethers';

// SOUL Token Contract ABI (simplified - only owner function)
const SOUL_TOKEN_ABI = [
  "function owner() external view returns (address)",
  "function hasRole(bytes32 role, address account) external view returns (bool)",
  "function DEFAULT_ADMIN_ROLE() external view returns (bytes32)",
];

/**
 * Check if an address is the contract owner
 */
export async function isContractOwner(
  address: string,
  provider: IProvider,
  contractAddress: string
): Promise<boolean> {
  try {
    if (!address || !contractAddress) return false;

    const ethersProvider = new ethers.BrowserProvider(provider as any);
    const contract = new ethers.Contract(contractAddress, SOUL_TOKEN_ABI, ethersProvider);

    // Try to get owner (for Ownable contracts)
    try {
      const owner = await contract.owner();
      return owner.toLowerCase() === address.toLowerCase();
    } catch {
      // If owner() doesn't exist, try checking DEFAULT_ADMIN_ROLE
      try {
        const adminRole = await contract.DEFAULT_ADMIN_ROLE();
        const hasRole = await contract.hasRole(adminRole, address);
        return hasRole;
      } catch {
        return false;
      }
    }
  } catch (error) {
    console.error('Error checking contract ownership:', error);
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

