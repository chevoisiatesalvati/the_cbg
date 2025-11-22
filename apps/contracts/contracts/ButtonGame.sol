// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ButtonGame is Ownable {
    uint256 public timerDuration; // Timer duration in seconds
    uint256 public timerEnd; // Timestamp when timer ends
    uint256 public entryFee; // Fee to play the game (in wei)
    uint256 public prizePool; // Current prize pool (in wei)
    address public lastPlayer; // Last player who pressed the button
    bool public gameActive; // Whether the game is active

    event ButtonPressed(address indexed player, uint256 newTimerEnd, uint256 newPrizePool);
    event PrizeWon(address indexed winner, uint256 amount);
    event TimerConfigured(uint256 newDuration);
    event EntryFeeConfigured(uint256 newFee);
    event GameStatusChanged(bool active);

    constructor(
        address initialOwner,
        uint256 _initialTimerDuration,
        uint256 _initialEntryFee
    ) Ownable(initialOwner) {
        timerDuration = _initialTimerDuration;
        entryFee = _initialEntryFee;
        gameActive = true;
        timerEnd = block.timestamp + _initialTimerDuration;
    }

    /**
     * @dev Press the button - resets timer and adds entry fee to prize pool
     */
    function pressButton() external payable {
        require(gameActive, "Game is not active");
        require(block.timestamp < timerEnd, "Timer has expired - prize should be claimed first");
        require(msg.value == entryFee, "Incorrect entry fee amount");

        // Update prize pool
        prizePool += msg.value;

        // Reset timer
        timerEnd = block.timestamp + timerDuration;
        lastPlayer = msg.sender;

        emit ButtonPressed(msg.sender, timerEnd, prizePool);
    }

    /**
     * @dev Claim prize when timer expires
     */
    function claimPrize() external {
        require(gameActive, "Game is not active");
        require(block.timestamp >= timerEnd, "Timer has not expired yet");
        require(prizePool > 0, "No prize to claim");
        require(lastPlayer != address(0), "No last player");

        uint256 prize = prizePool;
        address winner = lastPlayer;

        // Reset game state
        prizePool = 0;
        lastPlayer = address(0);
        timerEnd = block.timestamp + timerDuration;

        // Transfer prize to winner
        (bool success, ) = winner.call{value: prize}("");
        require(success, "Prize transfer failed");

        emit PrizeWon(winner, prize);
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
        uint256 _timeRemaining
    ) {
        _timerEnd = timerEnd;
        _prizePool = prizePool;
        _lastPlayer = lastPlayer;
        _gameActive = gameActive;
        
        if (block.timestamp < timerEnd) {
            _timeRemaining = timerEnd - block.timestamp;
        } else {
            _timeRemaining = 0;
        }
    }

    /**
     * @dev Admin function to withdraw native tokens (emergency only)
     */
    function withdraw(uint256 amount) external onlyOwner {
        (bool success, ) = owner().call{value: amount}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Receive function to accept native tokens
     */
    receive() external payable {
        // Allow contract to receive native tokens
    }
}
