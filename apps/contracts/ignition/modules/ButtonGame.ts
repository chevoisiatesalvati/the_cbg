// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ButtonGameModule = buildModule("ButtonGameModule", (m) => {
  // Get deployer address
  const deployer = m.getAccount(0);

  // Parameters with defaults
  const initialTimerDuration = m.getParameter("initialTimerDuration", 300); // 5 minutes default
  const initialEntryFee = m.getParameter("initialEntryFee", "1000000000000000000"); // 1 CELO (18 decimals)

  // Deploy ButtonGame (no token needed, uses native CELO)
  const buttonGame = m.contract("ButtonGame", [
    deployer,
    initialTimerDuration,
    initialEntryFee,
  ]);

  return { buttonGame };
});

export default ButtonGameModule;

