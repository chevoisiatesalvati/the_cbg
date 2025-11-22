// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ButtonGameModule = buildModule("ButtonGameModule", (m) => {
  // Get deployer address
  const deployer = m.getAccount(0);

  // Parameters with defaults
  const initialTimerDuration = m.getParameter("initialTimerDuration", 300); // 5 minutes default
  const initialEntryFee = m.getParameter("initialEntryFee", "10000000000000000"); // 0.01 CELO (18 decimals)
  const initialPrizePool = m.getParameter("initialPrizePool", "5000000000000000000"); // 5 CELO initial prize pool

  // Deploy ButtonGame (no token needed, uses native CELO)
  const buttonGame = m.contract("ButtonGame", [
    deployer,
    initialTimerDuration,
    initialEntryFee,
    initialPrizePool,
  ]);

  return { buttonGame };
});

export default ButtonGameModule;

