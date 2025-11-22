// Contract ABIs and addresses
export const BUTTON_GAME_ABI = [
  {
    inputs: [],
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
    inputs: [],
    name: "getGameState",
    outputs: [
      {
        internalType: "uint256",
        name: "_timerEnd",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_prizePool",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_lastPlayer",
        type: "address",
      },
      {
        internalType: "bool",
        name: "_gameActive",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "_timeRemaining",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "entryFee",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Contract addresses - these will be set after deployment
// For now, using placeholder addresses that should be updated after deployment
export const BUTTON_GAME_ADDRESS = (process.env.NEXT_PUBLIC_BUTTON_GAME_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

