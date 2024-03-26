"use client";

import { useAccount } from "wagmi";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

const OwnerWithdrawalButton = () => {
  const { address } = useAccount();

  const { data: ownerAddress } = useScaffoldContractRead({
    contractName: "KickStarter",
    functionName: "projectOwner",
    account: address,
  });
  const { data: currentBalance } = useScaffoldContractRead({
    contractName: "KickStarter",
    functionName: "contractBalance",
    account: address,
  });

  const { writeAsync: withdrawProfit } = useScaffoldContractWrite({
    contractName: "KickStarter",
    functionName: "withdrawProfit",
    blockConfirmations: 1,
    onBlockConfirmation: txnReceipt => {
      console.log("Transaction blockHash", txnReceipt.blockHash);
    },
  });

  return ownerAddress === address && Number(currentBalance) / 1e18 ? (
    <button
      onClick={() => {
        withdrawProfit();
      }}
      className="fixed bottom-12 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Withdraw {Number(currentBalance) / 1e18} Eth
    </button>
  ) : (
    ""
  );
};

export default OwnerWithdrawalButton;
