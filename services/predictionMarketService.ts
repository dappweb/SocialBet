/**
 * Prediction Market Service
 * Handles on-chain prediction market operations on Sepolia
 */

import { IProvider } from '@web3auth/base';
import { ethers } from 'ethers';

// PredictionMarket Contract ABI (simplified)
const PREDICTION_MARKET_ABI = [
    "function createMarket(string memory _question, string memory _category, uint256 _endDate, uint256 _initialLiquidity) external payable returns (uint256)",
    "function placeBet(uint256 _marketId, bool _side, uint256 _amount) external payable",
    "function resolveMarket(uint256 _marketId, uint8 _outcome) external",
    "function claimWinnings(uint256 _marketId) external",
    "function getMarket(uint256 _marketId) external view returns (tuple(uint256 id, address creator, string question, string category, uint256 endDate, uint256 yesPool, uint256 noPool, uint256 totalVolume, uint8 status, uint8 outcome, bool isResolved, uint256 resolutionTime))",
    "function getUserBets(uint256 _marketId, address _user) external view returns (tuple(address bettor, uint256 amount, bool side, uint256 priceAtBet, uint256 timestamp, bool claimed)[])",
    "function getMarketPrices(uint256 _marketId) external view returns (uint256 yesPriceBps, uint256 noPriceBps)",
    "function calculatePayout(uint256 _marketId, bool _side, uint256 _amount) external view returns (uint256)",
    "function getClaimableAmount(uint256 _marketId, address _user) external view returns (uint256)",
    "function getMarketCount() external view returns (uint256)",
    "function paymentToken() external view returns (address)",
    "function useNativeToken() external view returns (bool)",
    "event MarketCreated(uint256 indexed marketId, address indexed creator, string question, string category, uint256 endDate)",
    "event BetPlaced(uint256 indexed marketId, address indexed bettor, bool side, uint256 amount, uint256 priceAtBet, uint256 yesPool, uint256 noPool)",
    "event MarketResolved(uint256 indexed marketId, uint8 outcome, uint256 resolutionTime)",
    "event BetClaimed(uint256 indexed marketId, address indexed bettor, uint256 amount, uint256 payout)"
];

export interface MarketData {
    id: number;
    creator: string;
    question: string;
    category: string;
    endDate: number;
    yesPool: string;
    noPool: string;
    totalVolume: string;
    status: number; // 0=Open, 1=Closed, 2=Resolved, 3=Cancelled
    outcome: number; // 0=Yes, 1=No, 2=Invalid
    isResolved: boolean;
    resolutionTime: number;
}

export interface BetData {
    bettor: string;
    amount: string;
    side: boolean; // true = YES, false = NO
    priceAtBet: number;
    timestamp: number;
    claimed: boolean;
}

export interface MarketPrices {
    yesPriceBps: number; // 0-10000 (0-100%)
    noPriceBps: number;
}

/**
 * Get contract instance
 */
function getContract(provider: IProvider, contractAddress: string): ethers.Contract {
    const ethersProvider = new ethers.BrowserProvider(provider as any);
    return new ethers.Contract(contractAddress, PREDICTION_MARKET_ABI, ethersProvider);
}

/**
 * Get signer for transactions
 */
async function getSigner(provider: IProvider): Promise<ethers.JsonRpcSigner> {
    const ethersProvider = new ethers.BrowserProvider(provider as any);
    return await ethersProvider.getSigner();
}

/**
 * Create a new prediction market on-chain
 */
export async function createMarket(
    provider: IProvider,
    contractAddress: string,
    question: string,
    category: string,
    endDate: Date,
    initialLiquidity: number // in tokens (will be converted to wei)
): Promise<{ success: boolean; marketId?: number; txHash?: string; error?: string }> {
    try {
        const signer = await getSigner(provider);
        const contract = new ethers.Contract(contractAddress, PREDICTION_MARKET_ABI, signer);
        
        // Check if using native token
        const useNative = await contract.useNativeToken();
        const liquidityWei = ethers.parseEther(initialLiquidity.toString());
        
        let tx;
        if (useNative) {
            tx = await contract.createMarket(
                question,
                category,
                Math.floor(endDate.getTime() / 1000),
                liquidityWei,
                { value: liquidityWei }
            );
        } else {
            tx = await contract.createMarket(
                question,
                category,
                Math.floor(endDate.getTime() / 1000),
                liquidityWei
            );
        }
        
        const receipt = await tx.wait();
        
        // Parse MarketCreated event
        const event = receipt.logs.find((log: any) => {
            try {
                const parsed = contract.interface.parseLog(log);
                return parsed?.name === 'MarketCreated';
            } catch {
                return false;
            }
        });
        
        let marketId: number | undefined;
        if (event) {
            const parsed = contract.interface.parseLog(event);
            marketId = Number(parsed?.args[0]);
        }
        
        return {
            success: true,
            marketId,
            txHash: receipt.hash,
        };
    } catch (error: any) {
        console.error('Error creating market:', error);
        return {
            success: false,
            error: error.message || 'Failed to create market',
        };
    }
}

/**
 * Place a bet on a market
 */
export async function placeBet(
    provider: IProvider,
    contractAddress: string,
    marketId: number,
    side: 'YES' | 'NO',
    amount: number // in tokens
): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
        const signer = await getSigner(provider);
        const contract = new ethers.Contract(contractAddress, PREDICTION_MARKET_ABI, signer);
        
        const useNative = await contract.useNativeToken();
        const amountWei = ethers.parseEther(amount.toString());
        const betSide = side === 'YES';
        
        let tx;
        if (useNative) {
            tx = await contract.placeBet(marketId, betSide, amountWei, { value: amountWei });
        } else {
            tx = await contract.placeBet(marketId, betSide, amountWei);
        }
        
        const receipt = await tx.wait();
        
        return {
            success: true,
            txHash: receipt.hash,
        };
    } catch (error: any) {
        console.error('Error placing bet:', error);
        return {
            success: false,
            error: error.message || 'Failed to place bet',
        };
    }
}

/**
 * Get market data from blockchain
 */
export async function getMarket(
    provider: IProvider,
    contractAddress: string,
    marketId: number
): Promise<MarketData | null> {
    try {
        const contract = getContract(provider, contractAddress);
        const market = await contract.getMarket(marketId);
        
        return {
            id: Number(market.id),
            creator: market.creator,
            question: market.question,
            category: market.category,
            endDate: Number(market.endDate),
            yesPool: market.yesPool.toString(),
            noPool: market.noPool.toString(),
            totalVolume: market.totalVolume.toString(),
            status: Number(market.status),
            outcome: Number(market.outcome),
            isResolved: market.isResolved,
            resolutionTime: Number(market.resolutionTime),
        };
    } catch (error) {
        console.error('Error getting market:', error);
        return null;
    }
}

/**
 * Get market prices (YES/NO percentages)
 */
export async function getMarketPrices(
    provider: IProvider,
    contractAddress: string,
    marketId: number
): Promise<MarketPrices | null> {
    try {
        const contract = getContract(provider, contractAddress);
        const [yesPriceBps, noPriceBps] = await contract.getMarketPrices(marketId);
        
        return {
            yesPriceBps: Number(yesPriceBps),
            noPriceBps: Number(noPriceBps),
        };
    } catch (error) {
        console.error('Error getting market prices:', error);
        return null;
    }
}

/**
 * Get user's bets for a market
 */
export async function getUserBets(
    provider: IProvider,
    contractAddress: string,
    marketId: number,
    userAddress: string
): Promise<BetData[]> {
    try {
        const contract = getContract(provider, contractAddress);
        const bets = await contract.getUserBets(marketId, userAddress);
        
        return bets.map((bet: any) => ({
            bettor: bet.bettor,
            amount: bet.amount.toString(),
            side: bet.side,
            priceAtBet: Number(bet.priceAtBet),
            timestamp: Number(bet.timestamp),
            claimed: bet.claimed,
        }));
    } catch (error) {
        console.error('Error getting user bets:', error);
        return [];
    }
}

/**
 * Calculate potential payout for a bet
 */
export async function calculatePayout(
    provider: IProvider,
    contractAddress: string,
    marketId: number,
    side: 'YES' | 'NO',
    amount: number
): Promise<number | null> {
    try {
        const contract = getContract(provider, contractAddress);
        const payout = await contract.calculatePayout(marketId, side === 'YES', ethers.parseEther(amount.toString()));
        return parseFloat(ethers.formatEther(payout));
    } catch (error) {
        console.error('Error calculating payout:', error);
        return null;
    }
}

/**
 * Resolve a market (owner or creator only)
 */
export async function resolveMarket(
    provider: IProvider,
    contractAddress: string,
    marketId: number,
    outcome: 'YES' | 'NO' | 'INVALID'
): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
        const signer = await getSigner(provider);
        const contract = new ethers.Contract(contractAddress, PREDICTION_MARKET_ABI, signer);
        
        const outcomeValue = outcome === 'YES' ? 0 : outcome === 'NO' ? 1 : 2;
        const tx = await contract.resolveMarket(marketId, outcomeValue);
        const receipt = await tx.wait();
        
        return {
            success: true,
            txHash: receipt.hash,
        };
    } catch (error: any) {
        console.error('Error resolving market:', error);
        return {
            success: false,
            error: error.message || 'Failed to resolve market',
        };
    }
}

/**
 * Claim winnings from resolved market
 */
export async function claimWinnings(
    provider: IProvider,
    contractAddress: string,
    marketId: number
): Promise<{ success: boolean; txHash?: string; amount?: string; error?: string }> {
    try {
        const signer = await getSigner(provider);
        const contract = new ethers.Contract(contractAddress, PREDICTION_MARKET_ABI, signer);
        
        const tx = await contract.claimWinnings(marketId);
        const receipt = await tx.wait();
        
        // Parse BetClaimed event to get amount
        let amount: string | undefined;
        const event = receipt.logs.find((log: any) => {
            try {
                const parsed = contract.interface.parseLog(log);
                return parsed?.name === 'BetClaimed';
            } catch {
                return false;
            }
        });
        
        if (event) {
            const parsed = contract.interface.parseLog(event);
            amount = parsed?.args[2]?.toString(); // payout amount
        }
        
        return {
            success: true,
            txHash: receipt.hash,
            amount,
        };
    } catch (error: any) {
        console.error('Error claiming winnings:', error);
        return {
            success: false,
            error: error.message || 'Failed to claim winnings',
        };
    }
}

/**
 * Get claimable amount for a user
 */
export async function getClaimableAmount(
    provider: IProvider,
    contractAddress: string,
    marketId: number,
    userAddress: string
): Promise<number | null> {
    try {
        const contract = getContract(provider, contractAddress);
        const amount = await contract.getClaimableAmount(marketId, userAddress);
        return parseFloat(ethers.formatEther(amount));
    } catch (error) {
        console.error('Error getting claimable amount:', error);
        return null;
    }
}

/**
 * Get total number of markets
 */
export async function getMarketCount(
    provider: IProvider,
    contractAddress: string
): Promise<number> {
    try {
        const contract = getContract(provider, contractAddress);
        const count = await contract.getMarketCount();
        return Number(count);
    } catch (error) {
        console.error('Error getting market count:', error);
        return 0;
    }
}

