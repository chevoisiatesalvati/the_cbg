// Contract ABIs and addresses
export const BUTTON_GAME_ABI = [
  {
    inputs: [{ internalType: "bool", name: "useFreePlay", type: "bool" }],
    name: "pressButton",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "claimPrize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "sponsorshipAmount", type: "uint256" }],
    name: "claimPrizeAndStartNewGame",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "getGameState",
    outputs: [
      { internalType: "uint256", name: "_timerEnd", type: "uint256" },
      { internalType: "uint256", name: "_prizePool", type: "uint256" },
      { internalType: "address", name: "_lastPlayer", type: "address" },
      { internalType: "bool", name: "_gameActive", type: "bool" },
      { internalType: "uint256", name: "_timeRemaining", type: "uint256" },
      { internalType: "uint256", name: "_currentRound", type: "uint256" },
      { internalType: "uint256", name: "_progressiveJackpot", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "entryFee",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "isEligibleForFreePlay",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "lastFreePlay",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "count", type: "uint256" }],
    name: "getLatestWinners",
    outputs: [
      {
        components: [
          { internalType: "address", name: "winner", type: "address" },
          { internalType: "uint256", name: "prize", type: "uint256" },
          { internalType: "uint256", name: "timestamp", type: "uint256" },
          { internalType: "uint256", name: "round", type: "uint256" },
        ],
        internalType: "struct ButtonGame.WinnerInfo[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getWinnersCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "progressiveJackpot",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "gameRound",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "timerDuration",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "timerEnd",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "initialPrizePool",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "player", type: "address" },
      { indexed: false, internalType: "uint256", name: "newTimerEnd", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "newPrizePool", type: "uint256" },
      { indexed: false, internalType: "bool", name: "isFreePlay", type: "bool" },
    ],
    name: "ButtonPressed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "winner", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "round", type: "uint256" },
    ],
    name: "PrizeWon",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint256", name: "round", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "initialPrize", type: "uint256" },
    ],
    name: "NewGameStarted",
    type: "event",
  },
] as const;

// Contract addresses - these will be set after deployment
export const BUTTON_GAME_ADDRESS = (process.env.NEXT_PUBLIC_BUTTON_GAME_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

// Debug: Log contract address on module load
if (typeof window !== "undefined") {
  console.log("[DEBUG] Contract Address Configuration:", {
    envVar: process.env.NEXT_PUBLIC_BUTTON_GAME_ADDRESS,
    resolvedAddress: BUTTON_GAME_ADDRESS,
    isZeroAddress: BUTTON_GAME_ADDRESS === "0x0000000000000000000000000000000000000000",
  });
}
