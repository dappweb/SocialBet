/**
 * Token Sale Service
 * Handles interactions with SoulTokenSale smart contract
 */

import { IProvider } from '@web3auth/base';
import { ethers } from 'ethers';

// Contract ABI (simplified - full ABI would be imported from artifacts)
const TOKEN_SALE_ABI = [
  "function buyTokens(uint256 _amount) external payable",
  "function claimRefund() external",
  "function getSaleProgress() external view returns (uint256)",
  "function getTokensForAmount(uint256 _amount) external view returns (uint256)",
  "function canPurchase(address _user) external view returns (bool)",
  "function contributions(address) external view returns (uint256)",
  "function tokensPurchased(address) external view returns (uint256)",
  "function totalRaised() external view returns (uint256)",
  "function hardCap() external view returns (uint256)",
  "function softCap() external view returns (uint256)",
  "function currentPhase() external view returns (uint8)",
  "function whitelist(address) external view returns (bool)",
  "function whitelistEnabled() external view returns (bool)",
  "function saleStartTime() external view returns (uint256)",
  "function saleEndTime() external view returns (uint256)",
  "function tokenPrice() external view returns (uint256)",
  "function minPurchase() external view returns (uint256)",
  "function maxPurchase() external view returns (uint256)",
];

export interface SaleInfo {
  totalRaised: number;
  hardCap: number;
  softCap: number;
  progress: number;
  currentPhase: number;
  tokenPrice: number;
  minPurchase: number;
  maxPurchase: number;
  startTime: number;
  endTime: number;
  whitelistEnabled: boolean;
  isWhitelisted: boolean;
  canPurchase: boolean;
}

export interface PurchaseResult {
  success: boolean;
  transactionHash?: string;
  tokensReceived?: number;
  error?: string;
}

/**
 * Get token sale contract instance
 */
function getTokenSaleContract(provider: IProvider, contractAddress: string): ethers.Contract {
  const ethersProvider = new ethers.BrowserProvider(provider as any);
  return new ethers.Contract(contractAddress, TOKEN_SALE_ABI, ethersProvider);
}

/**
 * Get sale information
 */
export async function getSaleInfo(
  provider: IProvider,
  contractAddress: string,
  userAddress?: string
): Promise<SaleInfo> {
  try {
    const contract = getTokenSaleContract(provider, contractAddress);
    
    const [
      totalRaised,
      hardCap,
      softCap,
      progress,
      currentPhase,
      tokenPrice,
      minPurchase,
      maxPurchase,
      startTime,
      endTime,
      whitelistEnabled,
    ] = await Promise.all([
      contract.totalRaised(),
      contract.hardCap(),
      contract.softCap(),
      contract.getSaleProgress(),
      contract.currentPhase(),
      contract.tokenPrice(),
      contract.minPurchase(),
      contract.maxPurchase(),
      contract.saleStartTime(),
      contract.saleEndTime(),
      contract.whitelistEnabled(),
    ]);

    let isWhitelisted = false;
    let canPurchase = false;

    if (userAddress) {
      if (whitelistEnabled) {
        isWhitelisted = await contract.whitelist(userAddress);
      }
      canPurchase = await contract.canPurchase(userAddress);
    }

    return {
      totalRaised: Number(ethers.formatEther(totalRaised)),
      hardCap: Number(ethers.formatEther(hardCap)),
      softCap: Number(ethers.formatEther(softCap)),
      progress: Number(progress),
      currentPhase: Number(currentPhase),
      tokenPrice: Number(ethers.formatEther(tokenPrice)),
      minPurchase: Number(ethers.formatEther(minPurchase)),
      maxPurchase: Number(ethers.formatEther(maxPurchase)),
      startTime: Number(startTime) * 1000, // Convert to milliseconds
      endTime: Number(endTime) * 1000,
      whitelistEnabled,
      isWhitelisted,
      canPurchase,
    };
  } catch (error: any) {
    console.error('Error getting sale info:', error);
    throw new Error(`Failed to get sale info: ${error.message}`);
  }
}

/**
 * Purchase tokens
 */
export async function purchaseTokens(
  provider: IProvider,
  contractAddress: string,
  amountETH: number
): Promise<PurchaseResult> {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider as any);
    const signer = await ethersProvider.getSigner();
    const contract = new ethers.Contract(contractAddress, TOKEN_SALE_ABI, signer);

    const amountWei = ethers.parseEther(amountETH.toString());
    
    // Get tokens to receive
    const tokensToReceive = await contract.getTokensForAmount(amountWei);
    
    // Execute purchase
    const tx = await contract.buyTokens(amountWei, { value: amountWei });
    const receipt = await tx.wait();

    return {
      success: true,
      transactionHash: receipt.hash,
      tokensReceived: Number(ethers.formatEther(tokensToReceive)),
    };
  } catch (error: any) {
    console.error('Purchase error:', error);
    return {
      success: false,
      error: error.message || 'Purchase failed',
    };
  }
}

/**
 * Claim refund
 */
export async function claimRefund(
  provider: IProvider,
  contractAddress: string
): Promise<PurchaseResult> {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider as any);
    const signer = await ethersProvider.getSigner();
    const contract = new ethers.Contract(contractAddress, TOKEN_SALE_ABI, signer);

    const tx = await contract.claimRefund();
    const receipt = await tx.wait();

    return {
      success: true,
      transactionHash: receipt.hash,
    };
  } catch (error: any) {
    console.error('Refund error:', error);
    return {
      success: false,
      error: error.message || 'Refund failed',
    };
  }
}

/**
 * Get user contribution
 */
export async function getUserContribution(
  provider: IProvider,
  contractAddress: string,
  userAddress: string
): Promise<{ contributed: number; tokensPurchased: number }> {
  try {
    const contract = getTokenSaleContract(provider, contractAddress);
    
    const [contributed, tokensPurchased] = await Promise.all([
      contract.contributions(userAddress),
      contract.tokensPurchased(userAddress),
    ]);

    return {
      contributed: Number(ethers.formatEther(contributed)),
      tokensPurchased: Number(ethers.formatEther(tokensPurchased)),
    };
  } catch (error: any) {
    console.error('Error getting user contribution:', error);
    return { contributed: 0, tokensPurchased: 0 };
  }
}

/**
 * Calculate tokens for amount
 */
export async function calculateTokensForAmount(
  provider: IProvider,
  contractAddress: string,
  amountETH: number
): Promise<number> {
  try {
    const contract = getTokenSaleContract(provider, contractAddress);
    const amountWei = ethers.parseEther(amountETH.toString());
    const tokens = await contract.getTokensForAmount(amountWei);
    return Number(ethers.formatEther(tokens));
  } catch (error: any) {
    console.error('Error calculating tokens:', error);
    throw new Error(`Failed to calculate tokens: ${error.message}`);
  }
}

