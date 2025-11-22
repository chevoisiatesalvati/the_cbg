// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ButtonGame is Ownable, ReentrancyGuard {
    uint256 public timerDuration; // Timer duration in seconds
    uint256 public timerEnd; // Timestamp when timer ends
    uint256 public entryFee; // Fee to play the game (in wei)
    uint256 public prizePool; // Current prize pool (in wei)
    uint256 public initialPrizePool; // Initial prize pool for each new game (in wei)
    uint256 public progressiveJackpot; // Accumulated jackpot across all games (in wei)
    uint256 public gameRound; // Current game round number
    address public lastPlayer; // Last player who pressed the button
    bool public gameActive; // Whether the game is active

    // Free play tracking: address => last free play timestamp
    mapping(address => uint256) public lastFreePlay;
    uint256 public constant FREE_PLAY_COOLDOWN = 24 hours;

    // Winner history: round => winner info
    struct WinnerInfo {
        address winner;
        uint256 prize;
        uint256 timestamp;
        uint256 round;
    }
    WinnerInfo[] public winners;
    mapping(uint256 => WinnerInfo) public roundWinners; // round => winner info

    event ButtonPressed(address indexed player, uint256 newTimerEnd, uint256 newPrizePool, bool isFreePlay);
    event PrizeWon(address indexed winner, uint256 amount, uint256 round);
    event NewGameStarted(uint256 round, uint256 initialPrize);
    event TimerConfigured(uint256 newDuration);
    event EntryFeeConfigured(uint256 newFee);
    event InitialPrizePoolConfigured(uint256 newAmount);
    event GameStatusChanged(bool active);
    event ProgressiveJackpotUpdated(uint256 newAmount);

    constructor(
        address initialOwner,
        uint256 _initialTimerDuration,
        uint256 _initialEntryFee,
        uint256 _initialPrizePool
    ) Ownable(initialOwner) {
        timerDuration = _initialTimerDuration;
        entryFee = _initialEntryFee;
        initialPrizePool = _initialPrizePool;
        gameActive = true;
        gameRound = 1;
        
        // Start first game - prize pool will be set when contract receives funds
        // Owner should fund the contract after deployment
        prizePool = 0;
        timerEnd = block.timestamp + _initialTimerDuration;
        
        emit NewGameStarted(gameRound, _initialPrizePool);
    }

    /**
     * @dev Check if user is eligible for free play
     */
    function isEligibleForFreePlay(address user) public view returns (bool) {
        if (lastFreePlay[user] == 0) return true; // Never played before
        return block.timestamp >= lastFreePlay[user] + FREE_PLAY_COOLDOWN;
    }

    /**
     * @dev Press the button - resets timer and adds entry fee to prize pool
     * @param useFreePlay If true and user is eligible, play for free
     */
    function pressButton(bool useFreePlay) external payable nonReentrant {
        require(gameActive, "Game is not active");
        require(block.timestamp < timerEnd, "Timer has expired - new game will start automatically");
        
        bool isFree = useFreePlay && isEligibleForFreePlay(msg.sender);
        
        if (isFree) {
            // Free play - no payment required
            lastFreePlay[msg.sender] = block.timestamp;
        } else {
            // Paid play - require exact entry fee
            require(msg.value == entryFee, "Incorrect entry fee amount");
            prizePool += msg.value;
        }

        // Reset timer
        timerEnd = block.timestamp + timerDuration;
        lastPlayer = msg.sender;

        emit ButtonPressed(msg.sender, timerEnd, prizePool, isFree);
    }

    /**
     * @dev Claim prize when timer expires and automatically start new game
     */
    function claimPrize() external nonReentrant {
        require(gameActive, "Game is not active");
        require(block.timestamp >= timerEnd, "Timer has not expired yet");
        require(prizePool > 0 || lastPlayer != address(0), "No prize to claim");

        uint256 prize = prizePool;
        address winner = lastPlayer;
        uint256 currentRound = gameRound;

        // Record winner
        if (winner != address(0) && prize > 0) {
            WinnerInfo memory winnerInfo = WinnerInfo({
                winner: winner,
                prize: prize,
                timestamp: block.timestamp,
                round: currentRound
            });
            winners.push(winnerInfo);
            roundWinners[currentRound] = winnerInfo;

            // Transfer prize to winner
            (bool success, ) = winner.call{value: prize}("");
            require(success, "Prize transfer failed");

            emit PrizeWon(winner, prize, currentRound);
        }

        // Start new game automatically
        _startNewGame();
    }

    /**
     * @dev Internal function to start a new game
     */
    function _startNewGame() internal {
        gameRound++;
        
        // Reset game state - use contract balance or initial prize pool, whichever is available
        uint256 contractBalance = address(this).balance;
        prizePool = contractBalance >= initialPrizePool ? initialPrizePool : contractBalance;
        lastPlayer = address(0);
        timerEnd = block.timestamp + timerDuration;

        emit NewGameStarted(gameRound, prizePool);
    }

    /**
     * @dev Fund the initial prize pool (can be called by anyone)
     */
    function fundPrizePool() external payable {
        require(msg.value > 0, "Must send CELO");
        // Funds are added to contract balance and will be used in next game
    }

    /**
     * @dev Manually start a new game (admin only, for emergency)
     */
    function startNewGame() external onlyOwner {
        _startNewGame();
    }

    /**
     * @dev Add to progressive jackpot (can be called by anyone or contract)
     */
    function addToJackpot() external payable {
        require(msg.value > 0, "Must send CELO");
        progressiveJackpot += msg.value;
        emit ProgressiveJackpotUpdated(progressiveJackpot);
    }

    /**
     * @dev Admin function to configure timer duration
     */
    function setTimerDuration(uint256 _newDuration) external onlyOwner {
        require(_newDuration > 0, "Timer duration must be greater than 0");
        timerDuration = _newDuration;
        emit TimerConfigured(_newDuration);
    }

    /**
     * @dev Admin function to configure entry fee
     */
    function setEntryFee(uint256 _newFee) external onlyOwner {
        entryFee = _newFee;
        emit EntryFeeConfigured(_newFee);
    }

    /**
     * @dev Admin function to configure initial prize pool
     */
    function setInitialPrizePool(uint256 _newAmount) external onlyOwner {
        initialPrizePool = _newAmount;
        emit InitialPrizePoolConfigured(_newAmount);
    }

    /**
     * @dev Admin function to pause/resume game
     */
    function setGameActive(bool _active) external onlyOwner {
        gameActive = _active;
        emit GameStatusChanged(_active);
    }

    /**
     * @dev Get current game state
     */
    function getGameState() external view returns (
        uint256 _timerEnd,
        uint256 _prizePool,
        address _lastPlayer,
        bool _gameActive,
        uint256 _timeRemaining,
        uint256 _currentRound,
        uint256 _progressiveJackpot
    ) {
        _timerEnd = timerEnd;
        _prizePool = prizePool;
        _lastPlayer = lastPlayer;
        _gameActive = gameActive;
        _currentRound = gameRound;
        _progressiveJackpot = progressiveJackpot;
        
        if (block.timestamp < timerEnd) {
            _timeRemaining = timerEnd - block.timestamp;
        } else {
            _timeRemaining = 0;
        }
    }

    /**
     * @dev Get winner history
     */
    function getWinners(uint256 fromIndex, uint256 count) external view returns (WinnerInfo[] memory) {
        uint256 totalWinners = winners.length;
        if (fromIndex >= totalWinners) {
            return new WinnerInfo[](0);
        }
        
        uint256 endIndex = fromIndex + count;
        if (endIndex > totalWinners) {
            endIndex = totalWinners;
        }
        
        uint256 resultCount = endIndex - fromIndex;
        WinnerInfo[] memory result = new WinnerInfo[](resultCount);
        
        for (uint256 i = 0; i < resultCount; i++) {
            result[i] = winners[fromIndex + i];
        }
        
        return result;
    }

    /**
     * @dev Get total number of winners
     */
    function getWinnersCount() external view returns (uint256) {
        return winners.length;
    }

    /**
     * @dev Get latest winners (most recent first)
     */
    function getLatestWinners(uint256 count) external view returns (WinnerInfo[] memory) {
        uint256 totalWinners = winners.length;
        if (totalWinners == 0) {
            return new WinnerInfo[](0);
        }
        
        uint256 startIndex = totalWinners > count ? totalWinners - count : 0;
        uint256 resultCount = totalWinners - startIndex;
        WinnerInfo[] memory result = new WinnerInfo[](resultCount);
        
        for (uint256 i = 0; i < resultCount; i++) {
            result[i] = winners[startIndex + i];
        }
        
        return result;
    }

    /**
     * @dev Admin function to withdraw native tokens (emergency only)
     */
    function withdraw(uint256 amount) external onlyOwner nonReentrant {
        (bool success, ) = owner().call{value: amount}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Receive function to accept native tokens (for initial prize pool funding)
     */
    receive() external payable {
        // If no specific function called, add to progressive jackpot
        progressiveJackpot += msg.value;
        emit ProgressiveJackpotUpdated(progressiveJackpot);
    }
}
