/**
 * CPMM Prediction Market Service
 * Handles on-chain operations with the PredictionMarketCPMM contract
 */

import { IProvider } from '@web3auth/base';
import { ethers } from 'ethers';

// CPMM Contract ABI
const CPMM_ABI = [
    "function createMarket(string calldata _question, string calldata _category, uint256 _endDate, uint256 _initialLiquidity) external payable returns (uint256)",
    "function placeBet(uint256 _marketId, bool _side, uint256 _amount, uint256 _maxSlippageBps) external payable",
    "function resolveMarket(uint256 _marketId, uint8 _outcome) external",
    "function claimWinnings(uint256 _marketId) external",
    "function getMarket(uint256 _marketId) external view returns (tuple(uint256 id, address creator, string question, string category, uint256 endDate, uint256 yesPool, uint256 noPool, uint256 k, uint256 totalVolume, uint256 totalFees, uint8 status, uint8 outcome, bool isResolved, uint256 resolutionTime))",
    "function getMarketPrices(uint256 _marketId) external view returns (uint256 yesPriceBps, uint256 noPriceBps)",
    "function quoteYesBuy(uint256 _marketId, uint256 _inputAmount) external view returns (tuple(uint256 outputShares, uint256 fee, uint256 priceImpact, uint256 newYesPrice, uint256 newNoPrice, bool exceedsSlippage))",
    "function quoteNoBuy(uint256 _marketId, uint256 _inputAmount) external view returns (tuple(uint256 outputShares, uint256 fee, uint256 priceImpact, uint256 newYesPrice, uint256 newNoPrice, bool exceedsSlippage))",
    "function getUserBets(uint256 _marketId, address _user) external view returns (tuple(address bettor, uint256 inputAmount, uint256 shares, bool side, uint256 priceAtBet, uint256 priceImpact, uint256 timestamp, bool claimed)[])",
    "function getMarketCount() external view returns (uint256)",
    "function paymentToken() external view returns (address)",
    "function useNativeToken() external view returns (bool)",
    "function FEE_BPS() external view returns (uint256)",
    "function MAX_SLIPPAGE_BPS() external view returns (uint256)",
    "event MarketCreated(uint256 indexed marketId, address indexed creator, string question, uint256 initialLiquidity, uint256 k)",
    "event BetPlaced(uint256 indexed marketId, address indexed bettor, bool side, uint256 inputAmount, uint256 outputShares, uint256 priceImpact, uint256 fee)",
    "event MarketResolved(uint256 indexed marketId, uint8 outcome)",
    "event WinningsClaimed(uint256 indexed marketId, address indexed user, uint256 payout)"
];

export interface CPMMMarketData {
    id: number;
    creator: string;
    question: string;
    category: string;
    endDate: number;
    yesPool: string;
    noPool: string;
    k: string;
    totalVolume: string;
    totalFees: string;
    status: number;
    outcome: number;
    isResolved: boolean;
    resolutionTime: number;
}

export interface CPMMTradeQuote {
    outputShares: string;
    fee: string;
    priceImpact: number; // in BPS
    newYesPrice: number;
    newNoPrice: number;
    exceedsSlippage: boolean;
}

export interface CPMMBetData {
    bettor: string;
    inputAmount: string;
    shares: string;
    side: boolean;
    priceAtBet: number;
    priceImpact: number;
    timestamp: number;
    claimed: boolean;
}

function getContract(provider: IProvider, contractAddress: string): ethers.Contract {
    const ethersProvider = new ethers.BrowserProvider(provider as any);
    return new ethers.Contract(contractAddress, CPMM_ABI, ethersProvider);
}

async function getSigner(provider: IProvider): Promise<ethers.JsonRpcSigner> {
    const ethersProvider = new ethers.BrowserProvider(provider as any);
    return await ethersProvider.getSigner();
}

/**
 * Get trade quote for YES bet
 */
export async function getYesQuote(
    provider: IProvider,
    contractAddress: string,
    marketId: number,
    amount: number
): Promise<CPMMTradeQuote | null> {
    try {
        const contract = getContract(provider, contractAddress);
        const amountWei = ethers.parseEther(amount.toString());
        const quote = await contract.quoteYesBuy(marketId, amountWei);
        
        return {
            outputShares: ethers.formatEther(quote.outputShares),
            fee: ethers.formatEther(quote.fee),
            priceImpact: Number(quote.priceImpact),
            newYesPrice: Number(quote.newYesPrice),
            newNoPrice: Number(quote.newNoPrice),
            exceedsSlippage: quote.exceedsSlippage,
        };
    } catch (error) {
        console.error('Error getting YES quote:', error);
        return null;
    }
}

/**
 * Get trade quote for NO bet
 */
export async function getNoQuote(
    provider: IProvider,
    contractAddress: string,
    marketId: number,
    amount: number
): Promise<CPMMTradeQuote | null> {
    try {
        const contract = getContract(provider, contractAddress);
        const amountWei = ethers.parseEther(amount.toString());
        const quote = await contract.quoteNoBuy(marketId, amountWei);
        
        return {
            outputShares: ethers.formatEther(quote.outputShares),
            fee: ethers.formatEther(quote.fee),
            priceImpact: Number(quote.priceImpact),
            newYesPrice: Number(quote.newYesPrice),
            newNoPrice: Number(quote.newNoPrice),
            exceedsSlippage: quote.exceedsSlippage,
        };
    } catch (error) {
        console.error('Error getting NO quote:', error);
        return null;
    }
}

/**
 * Place bet with slippage protection
 */
export async function placeBetCPMM(
    provider: IProvider,
    contractAddress: string,
    marketId: number,
    side: 'YES' | 'NO',
    amount: number,
    maxSlippageBps: number = 500 // Default 5%
): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
        const signer = await getSigner(provider);
        const contract = new ethers.Contract(contractAddress, CPMM_ABI, signer);
        
        const useNative = await contract.useNativeToken();
        const amountWei = ethers.parseEther(amount.toString());
        const betSide = side === 'YES';
        
        // Approve token if not using native
        if (!useNative) {
            const paymentTokenAddress = await contract.paymentToken();
            await ensureTokenApproval(provider, paymentTokenAddress, contractAddress, amountWei);
        }
        
        let tx;
        if (useNative) {
            tx = await contract.placeBet(marketId, betSide, amountWei, maxSlippageBps, { value: amountWei });
        } else {
            tx = await contract.placeBet(marketId, betSide, amountWei, maxSlippageBps);
        }
        
        const receipt = await tx.wait();
        
        return {
            success: true,
            txHash: receipt.hash,
        };
    } catch (error: any) {
        console.error('Error placing CPMM bet:', error);
        return {
            success: false,
            error: error.message || 'Failed to place bet',
        };
    }
}

/**
 * Create CPMM market
 */
export async function createCPMMMarket(
    provider: IProvider,
    contractAddress: string,
    question: string,
    category: string,
    endDate: Date,
    initialLiquidity: number
): Promise<{ success: boolean; marketId?: number; txHash?: string; error?: string }> {
    try {
        const signer = await getSigner(provider);
        const contract = new ethers.Contract(contractAddress, CPMM_ABI, signer);
        
        const useNative = await contract.useNativeToken();
        const liquidityWei = ethers.parseEther(initialLiquidity.toString());
        
        if (!useNative) {
            const paymentTokenAddress = await contract.paymentToken();
            await ensureTokenApproval(provider, paymentTokenAddress, contractAddress, liquidityWei);
        }
        
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
        let marketId: number | undefined;
        const event = receipt.logs.find((log: any) => {
            try {
                const parsed = contract.interface.parseLog(log);
                return parsed?.name === 'MarketCreated';
            } catch {
                return false;
            }
        });
        
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
        console.error('Error creating CPMM market:', error);
        return {
            success: false,
            error: error.message || 'Failed to create market',
        };
    }
}

/**
 * Get market data
 */
export async function getCPMMMarket(
    provider: IProvider,
    contractAddress: string,
    marketId: number
): Promise<CPMMMarketData | null> {
    try {
        const contract = getContract(provider, contractAddress);
        const market = await contract.getMarket(marketId);
        
        return {
            id: Number(market.id),
            creator: market.creator,
            question: market.question,
            category: market.category,
            endDate: Number(market.endDate),
            yesPool: ethers.formatEther(market.yesPool),
            noPool: ethers.formatEther(market.noPool),
            k: market.k.toString(),
            totalVolume: ethers.formatEther(market.totalVolume),
            totalFees: ethers.formatEther(market.totalFees),
            status: Number(market.status),
            outcome: Number(market.outcome),
            isResolved: market.isResolved,
            resolutionTime: Number(market.resolutionTime),
        };
    } catch (error) {
        console.error('Error getting CPMM market:', error);
        return null;
    }
}

/**
 * Get market prices
 */
export async function getCPMMMarketPrices(
    provider: IProvider,
    contractAddress: string,
    marketId: number
): Promise<{ yesPriceBps: number; noPriceBps: number } | null> {
    try {
        const contract = getContract(provider, contractAddress);
        const [yesPriceBps, noPriceBps] = await contract.getMarketPrices(marketId);
        
        return {
            yesPriceBps: Number(yesPriceBps),
            noPriceBps: Number(noPriceBps),
        };
    } catch (error) {
        console.error('Error getting CPMM market prices:', error);
        return null;
    }
}

/**
 * Claim winnings
 */
export async function claimCPMMWinnings(
    provider: IProvider,
    contractAddress: string,
    marketId: number
): Promise<{ success: boolean; txHash?: string; payout?: string; error?: string }> {
    try {
        const signer = await getSigner(provider);
        const contract = new ethers.Contract(contractAddress, CPMM_ABI, signer);
        
        const tx = await contract.claimWinnings(marketId);
        const receipt = await tx.wait();
        
        // Parse WinningsClaimed event
        let payout: string | undefined;
        const event = receipt.logs.find((log: any) => {
            try {
                const parsed = contract.interface.parseLog(log);
                return parsed?.name === 'WinningsClaimed';
            } catch {
                return false;
            }
        });
        
        if (event) {
            const parsed = contract.interface.parseLog(event);
            payout = ethers.formatEther(parsed?.args[2]);
        }
        
        return {
            success: true,
            txHash: receipt.hash,
            payout,
        };
    } catch (error: any) {
        console.error('Error claiming CPMM winnings:', error);
        return {
            success: false,
            error: error.message || 'Failed to claim winnings',
        };
    }
}

/**
 * Ensure token approval
 */
async function ensureTokenApproval(
    provider: IProvider,
    tokenAddress: string,
    spenderAddress: string,
    amount: bigint
): Promise<boolean> {
    try {
        const signer = await getSigner(provider);
        const userAddress = await signer.getAddress();
        
        const ERC20_ABI = [
            "function allowance(address owner, address spender) external view returns (uint256)",
            "function approve(address spender, uint256 amount) external returns (bool)"
        ];
        
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
        const currentAllowance = await tokenContract.allowance(userAddress, spenderAddress);
        
        if (currentAllowance < amount) {
            const approveTx = await tokenContract.approve(spenderAddress, amount);
            await approveTx.wait();
        }
        
        return true;
    } catch (error: any) {
        throw new Error(`Token approval failed: ${error.message}`);
    }
}

export default {
    getYesQuote,
    getNoQuote,
    placeBetCPMM,
    createCPMMMarket,
    getCPMMMarket,
    getCPMMMarketPrices,
    claimCPMMWinnings,
};
