// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title PredictionMarketCPMM
 * @notice Enhanced prediction market with Constant Product Market Maker (CPMM) algorithm
 * @dev Implements x * y = k formula with slippage protection
 */
contract PredictionMarketCPMM is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ Constants ============
    
    uint256 public constant FEE_BPS = 200; // 2% fee
    uint256 public constant MIN_LIQUIDITY = 1e18;
    uint256 public constant MAX_SLIPPAGE_BPS = 1000; // 10% max slippage
    uint256 public constant BPS_DENOMINATOR = 10000;

    // ============ Enums ============
    
    enum MarketStatus { Open, Closed, Resolved, Cancelled }
    enum Outcome { Yes, No, Invalid }

    // ============ Structs ============
    
    struct Market {
        uint256 id;
        address creator;
        string question;
        string category;
        uint256 endDate;
        uint256 yesPool;
        uint256 noPool;
        uint256 k;              // Constant product (yesPool * noPool)
        uint256 totalVolume;
        uint256 totalFees;
        MarketStatus status;
        Outcome outcome;
        bool isResolved;
        uint256 resolutionTime;
    }
    
    struct Bet {
        address bettor;
        uint256 inputAmount;
        uint256 shares;         // Output shares received
        bool side;
        uint256 priceAtBet;
        uint256 priceImpact;    // Price impact in BPS
        uint256 timestamp;
        bool claimed;
    }

    struct TradeQuote {
        uint256 outputShares;
        uint256 fee;
        uint256 priceImpact;
        uint256 newYesPrice;
        uint256 newNoPrice;
        bool exceedsSlippage;
    }

    // ============ State Variables ============
    
    IERC20 public paymentToken;
    bool public useNativeToken;
    address public feeRecipient;
    uint256 public marketCounter;
    
    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => Bet[])) public userBets;
    mapping(uint256 => uint256) public marketBetCount;

    // ============ Events ============
    
    event MarketCreated(
        uint256 indexed marketId,
        address indexed creator,
        string question,
        uint256 initialLiquidity,
        uint256 k
    );
    
    event BetPlaced(
        uint256 indexed marketId,
        address indexed bettor,
        bool side,
        uint256 inputAmount,
        uint256 outputShares,
        uint256 priceImpact,
        uint256 fee
    );
    
    event MarketResolved(uint256 indexed marketId, Outcome outcome);
    event WinningsClaimed(uint256 indexed marketId, address indexed user, uint256 payout);
    event LiquidityAdded(uint256 indexed marketId, address indexed provider, uint256 amount);

    // ============ Constructor ============
    
    constructor(
        address _paymentToken,
        address _feeRecipient,
        address _owner
    ) Ownable(_owner) {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        paymentToken = IERC20(_paymentToken);
        useNativeToken = (_paymentToken == address(0));
        feeRecipient = _feeRecipient;
    }

    // ============ Core Functions ============
    
    /**
     * @notice Create a new CPMM prediction market
     * @param _question Prediction question
     * @param _category Market category
     * @param _endDate Market end timestamp
     * @param _initialLiquidity Initial liquidity (split 50/50)
     */
    function createMarket(
        string calldata _question,
        string calldata _category,
        uint256 _endDate,
        uint256 _initialLiquidity
    ) external payable nonReentrant returns (uint256) {
        require(bytes(_question).length > 0, "Empty question");
        require(_endDate > block.timestamp, "Invalid end date");
        require(_initialLiquidity >= MIN_LIQUIDITY, "Insufficient liquidity");
        
        // Transfer liquidity
        if (useNativeToken) {
            require(msg.value >= _initialLiquidity, "Insufficient ETH");
        } else {
            paymentToken.safeTransferFrom(msg.sender, address(this), _initialLiquidity);
        }
        
        uint256 marketId = ++marketCounter;
        
        // Initialize with 50/50 pools
        uint256 halfLiquidity = _initialLiquidity / 2;
        uint256 k = halfLiquidity * halfLiquidity;
        
        markets[marketId] = Market({
            id: marketId,
            creator: msg.sender,
            question: _question,
            category: _category,
            endDate: _endDate,
            yesPool: halfLiquidity,
            noPool: halfLiquidity,
            k: k,
            totalVolume: _initialLiquidity,
            totalFees: 0,
            status: MarketStatus.Open,
            outcome: Outcome.Invalid,
            isResolved: false,
            resolutionTime: 0
        });
        
        emit MarketCreated(marketId, msg.sender, _question, _initialLiquidity, k);
        return marketId;
    }
    
    /**
     * @notice Get quote for buying YES shares using CPMM
     * @dev Uses formula: newNoPool = noPool + input, newYesPool = k / newNoPool
     */
    function quoteYesBuy(uint256 _marketId, uint256 _inputAmount) public view returns (TradeQuote memory) {
        Market memory market = markets[_marketId];
        require(market.status == MarketStatus.Open, "Market not open");
        
        uint256 fee = (_inputAmount * FEE_BPS) / BPS_DENOMINATOR;
        uint256 amountAfterFee = _inputAmount - fee;
        
        // Current YES price
        uint256 totalPool = market.yesPool + market.noPool;
        uint256 currentYesPrice = (market.noPool * BPS_DENOMINATOR) / totalPool;
        
        // CPMM calculation
        uint256 newNoPool = market.noPool + amountAfterFee;
        uint256 newYesPool = market.k / newNoPool;
        uint256 outputShares = market.yesPool - newYesPool;
        
        // Price impact calculation
        uint256 effectivePrice = (_inputAmount * BPS_DENOMINATOR) / outputShares;
        uint256 priceImpact = effectivePrice > currentYesPrice 
            ? ((effectivePrice - currentYesPrice) * BPS_DENOMINATOR) / currentYesPrice 
            : 0;
        
        // New prices
        uint256 newTotal = newYesPool + newNoPool;
        uint256 newYesPrice = (newNoPool * BPS_DENOMINATOR) / newTotal;
        uint256 newNoPrice = (newYesPool * BPS_DENOMINATOR) / newTotal;
        
        return TradeQuote({
            outputShares: outputShares,
            fee: fee,
            priceImpact: priceImpact,
            newYesPrice: newYesPrice,
            newNoPrice: newNoPrice,
            exceedsSlippage: priceImpact > MAX_SLIPPAGE_BPS
        });
    }
    
    /**
     * @notice Get quote for buying NO shares using CPMM
     */
    function quoteNoBuy(uint256 _marketId, uint256 _inputAmount) public view returns (TradeQuote memory) {
        Market memory market = markets[_marketId];
        require(market.status == MarketStatus.Open, "Market not open");
        
        uint256 fee = (_inputAmount * FEE_BPS) / BPS_DENOMINATOR;
        uint256 amountAfterFee = _inputAmount - fee;
        
        // Current NO price
        uint256 totalPool = market.yesPool + market.noPool;
        uint256 currentNoPrice = (market.yesPool * BPS_DENOMINATOR) / totalPool;
        
        // CPMM calculation
        uint256 newYesPool = market.yesPool + amountAfterFee;
        uint256 newNoPool = market.k / newYesPool;
        uint256 outputShares = market.noPool - newNoPool;
        
        // Price impact
        uint256 effectivePrice = (_inputAmount * BPS_DENOMINATOR) / outputShares;
        uint256 priceImpact = effectivePrice > currentNoPrice 
            ? ((effectivePrice - currentNoPrice) * BPS_DENOMINATOR) / currentNoPrice 
            : 0;
        
        // New prices
        uint256 newTotal = newYesPool + newNoPool;
        uint256 newYesPrice = (newNoPool * BPS_DENOMINATOR) / newTotal;
        uint256 newNoPrice = (newYesPool * BPS_DENOMINATOR) / newTotal;
        
        return TradeQuote({
            outputShares: outputShares,
            fee: fee,
            priceImpact: priceImpact,
            newYesPrice: newYesPrice,
            newNoPrice: newNoPrice,
            exceedsSlippage: priceImpact > MAX_SLIPPAGE_BPS
        });
    }
    
    /**
     * @notice Place a bet with slippage protection
     * @param _marketId Market ID
     * @param _side true = YES, false = NO
     * @param _amount Input amount
     * @param _maxSlippageBps Maximum acceptable slippage in basis points
     */
    function placeBet(
        uint256 _marketId,
        bool _side,
        uint256 _amount,
        uint256 _maxSlippageBps
    ) external payable nonReentrant {
        Market storage market = markets[_marketId];
        require(market.status == MarketStatus.Open, "Market not open");
        require(block.timestamp < market.endDate, "Market expired");
        require(_amount >= MIN_LIQUIDITY / 100, "Amount too small");
        
        // Get quote
        TradeQuote memory quote = _side ? quoteYesBuy(_marketId, _amount) : quoteNoBuy(_marketId, _amount);
        
        // Check slippage
        require(quote.priceImpact <= _maxSlippageBps, "Slippage exceeds limit");
        require(!quote.exceedsSlippage, "Trade too large");
        
        // Transfer payment
        if (useNativeToken) {
            require(msg.value >= _amount, "Insufficient ETH");
        } else {
            paymentToken.safeTransferFrom(msg.sender, address(this), _amount);
        }
        
        // Execute trade
        uint256 amountAfterFee = _amount - quote.fee;
        if (_side) {
            market.noPool += amountAfterFee;
            market.yesPool = market.k / market.noPool;
        } else {
            market.yesPool += amountAfterFee;
            market.noPool = market.k / market.yesPool;
        }
        
        // Transfer fee
        market.totalFees += quote.fee;
        if (useNativeToken) {
            (bool success, ) = feeRecipient.call{value: quote.fee}("");
            require(success, "Fee transfer failed");
        } else {
            paymentToken.safeTransfer(feeRecipient, quote.fee);
        }
        
        // Record bet
        userBets[_marketId][msg.sender].push(Bet({
            bettor: msg.sender,
            inputAmount: _amount,
            shares: quote.outputShares,
            side: _side,
            priceAtBet: _side ? quote.newYesPrice : quote.newNoPrice,
            priceImpact: quote.priceImpact,
            timestamp: block.timestamp,
            claimed: false
        }));
        
        marketBetCount[_marketId]++;
        market.totalVolume += _amount;
        
        emit BetPlaced(_marketId, msg.sender, _side, _amount, quote.outputShares, quote.priceImpact, quote.fee);
    }
    
    /**
     * @notice Resolve market
     */
    function resolveMarket(uint256 _marketId, Outcome _outcome) external {
        Market storage market = markets[_marketId];
        require(msg.sender == owner() || msg.sender == market.creator, "Not authorized");
        require(block.timestamp >= market.endDate, "Market not expired");
        require(!market.isResolved, "Already resolved");
        
        market.status = MarketStatus.Resolved;
        market.outcome = _outcome;
        market.isResolved = true;
        market.resolutionTime = block.timestamp;
        
        emit MarketResolved(_marketId, _outcome);
    }
    
    /**
     * @notice Claim winnings - winners get proportional share of losing pool
     */
    function claimWinnings(uint256 _marketId) external nonReentrant {
        Market storage market = markets[_marketId];
        require(market.isResolved, "Not resolved");
        require(market.outcome != Outcome.Invalid, "Invalid outcome");
        
        Bet[] storage bets = userBets[_marketId][msg.sender];
        require(bets.length > 0, "No bets");
        
        uint256 totalPayout = 0;
        uint256 winningPool = market.outcome == Outcome.Yes ? market.yesPool : market.noPool;
        uint256 losingPool = market.outcome == Outcome.Yes ? market.noPool : market.yesPool;
        uint256 totalPool = winningPool + losingPool;
        
        for (uint256 i = 0; i < bets.length; i++) {
            if (bets[i].claimed) continue;
            
            bool won = (market.outcome == Outcome.Yes && bets[i].side) ||
                      (market.outcome == Outcome.No && !bets[i].side);
            
            if (won) {
                // Payout = shares * totalPool / winningPool
                uint256 payout = (bets[i].shares * totalPool) / winningPool;
                totalPayout += payout;
                bets[i].claimed = true;
            }
        }
        
        require(totalPayout > 0, "Nothing to claim");
        
        if (useNativeToken) {
            (bool success, ) = msg.sender.call{value: totalPayout}("");
            require(success, "Transfer failed");
        } else {
            paymentToken.safeTransfer(msg.sender, totalPayout);
        }
        
        emit WinningsClaimed(_marketId, msg.sender, totalPayout);
    }

    // ============ View Functions ============
    
    function getMarket(uint256 _marketId) external view returns (Market memory) {
        return markets[_marketId];
    }
    
    function getMarketPrices(uint256 _marketId) external view returns (uint256 yesPriceBps, uint256 noPriceBps) {
        Market memory market = markets[_marketId];
        uint256 total = market.yesPool + market.noPool;
        if (total == 0) return (5000, 5000);
        yesPriceBps = (market.noPool * BPS_DENOMINATOR) / total;
        noPriceBps = (market.yesPool * BPS_DENOMINATOR) / total;
    }
    
    function getUserBets(uint256 _marketId, address _user) external view returns (Bet[] memory) {
        return userBets[_marketId][_user];
    }
    
    function getMarketCount() external view returns (uint256) {
        return marketCounter;
    }
}
