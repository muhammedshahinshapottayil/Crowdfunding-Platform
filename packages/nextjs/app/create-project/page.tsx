"use client";

import { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import WithdrawButton from "~~/components/WithdrawButton";
import { Address, EtherInput, InputBase } from "~~/components/scaffold-eth";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { Proposal } from "~~/types/utils";
import { notification } from "~~/utils/scaffold-eth";

function Page() {
  const [name, setName] = useState<string>("");
  const [idea, setIdea] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [budget, setBudget] = useState<string>("");
  const [addressDetails, setAddressDetails] = useState<string>("");
  const [renewAddress, setRenewAddress] = useState<string>("");
  const [withdrawAddress, setWithdrawAddress] = useState<string>("");

  const [data, setData] = useState<Proposal[]>([]);

  const { address } = useAccount();

  const PROPOSAL_GRAPHQL = `
  query MyQuery($address: String!) {
    proposals(
      where: { account: $address }
      orderBy: expiryDate
      orderDirection: desc
    ) {
    idea
    name
    expiryDate
    contractAddress
    budget
    account
    }
  }
`;

  const PROPOSAL_GQL = gql(PROPOSAL_GRAPHQL);

  const { data: userProposals, refetch } = useQuery(PROPOSAL_GQL, {
    variables: { address },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    setData(userProposals?.proposals ?? []);
  }, [userProposals]);

  const clearAll = () => {
    setName("");
    setIdea("");
    setDetails("");
    setBudget("");
    setAddressDetails("");
  };

  const { writeAsync: createProposal } = useScaffoldContractWrite({
    contractName: "KickStarter",
    functionName: "createProposal",
    args: [name, idea, details, parseEther(budget)],
    value: parseEther("0.1"),
    blockConfirmations: 1,
    onBlockConfirmation: txnReceipt => {
      console.log("Transaction blockHash", txnReceipt.blockHash);
    },
  });

  const { writeAsync: withdrawFunds } = useScaffoldContractWrite({
    contractName: "KickStarter",
    functionName: "withdrawFunds",
    args: [withdrawAddress],
    blockConfirmations: 1,
    onBlockConfirmation: txnReceipt => {
      console.log("Transaction blockHash", txnReceipt.blockHash);
    },
  });

  const { writeAsync: renewProposal } = useScaffoldContractWrite({
    contractName: "KickStarter",
    functionName: "renewProposal",
    args: [renewAddress],
    value: parseEther("0.05"),
    blockConfirmations: 1,
    onBlockConfirmation: txnReceipt => {
      console.log("Transaction blockHash", txnReceipt.blockHash);
    },
  });

  const { writeAsync: updateProposal } = useScaffoldContractWrite({
    contractName: "KickStarter",
    functionName: "updateProposal",
    args: [addressDetails, name, idea, details, parseEther(budget)],
    value: parseEther("0.1"),
    blockConfirmations: 1,
    onBlockConfirmation: txnReceipt => {
      console.log("Transaction blockHash", txnReceipt.blockHash);
    },
  });

  const { data: contractDetails } = useScaffoldContractRead({
    contractName: "KickStarter",
    functionName: "getProposedIdea",
    args: [addressDetails.toString()],
    account: address,
  });

  useEffect(() => {
    if (contractDetails) setDetails(contractDetails.details);
  }, [contractDetails]);

  const fetchAgain = () => {
    setTimeout(() => {
      refetch();
    }, 30000);
  };

  const handleSubmit = async () => {
    try {
      if (!name || !idea || !details || !budget) notification.warning("Please make sure all fields are filled");
      else {
        addressDetails ? await updateProposal() : await createProposal();
        clearAll();
        fetchAgain();
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (renewAddress) {
      renewProposal();
      setRenewAddress("");
      fetchAgain();
    }
  }, [renewAddress]);

  useEffect(() => {
    if (withdrawAddress) {
      withdrawFunds();
      setWithdrawAddress("");
      fetchAgain();
    }
  }, [withdrawAddress]);

  const editData = (proposal: Proposal) => {
    setName(proposal.name);
    setIdea(proposal.idea);
    setAddressDetails(proposal.contractAddress);
    setBudget((proposal.budget / 1e18).toString());
  };

  const date = new Date().getTime();

  return (
    <section className="bg-gray-100">
      <div className="flex justify-center items-center h-screen ">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <h1 className="font-bold text-xl text-black">Create Proposal</h1>
          <div className="mb-2">
            <p className="font-bold text-xs text-gray-500">Proposal name</p>

            <InputBase
              onChange={(value: string) => {
                setName(value);
              }}
              value={name}
            />
          </div>
          <div className="mb-2">
            <p className="font-bold text-xs text-gray-500">Idea</p>

            <InputBase
              onChange={(value: string) => {
                setIdea(value);
              }}
              value={idea}
            />
          </div>
          <div className="mb-2">
            <p className="font-bold text-xs text-gray-500">Details</p>

            <InputBase
              onChange={(value: string) => {
                setDetails(value);
              }}
              value={details}
            />
          </div>
          <div className="mb-2">
            <p className="font-bold text-xs text-gray-500">Budget in ETH</p>
            <EtherInput
              value={budget}
              onChange={value => {
                setBudget(value);
              }}
            />
            <div className="flex justify-around mt-2">
              <button
                onClick={handleSubmit}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded-md"
              >
                Submit
              </button>
              <button
                onClick={clearAll}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-1 px-2 rounded-md"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center items-center">
        <div className="w-full px-4 py-2 max-w-3xl bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-4 py-2">
            <div className="">
              {data.length > 0 ? (
                <>
                  <h2 className="text-center text-lg font-bold">Proposals</h2>
                  <div className="max-h-80 overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <table className="table-auto min-w-full">
                      <tbody>
                        {data.map((item: Proposal) => (
                          <tr key={item.contractAddress} className="divide-x divide-gray-200">
                            <td className="border px-4 py-2 w-1/4 max-w-xs">
                              <Address address={item.contractAddress} />
                            </td>
                            <td className="border px-4 py-2 w-1/4 max-w-md">
                              <p>{item.name}</p>
                            </td>
                            <td className="border px-4 py-2 w-1/4 max-w-xs">
                              {new Date(item.expiryDate * 1000).toDateString()}
                            </td>
                            <td className="border px-4 py-2 w-1/4 max-w-2xl ">
                              <div className="flex  justify-around items-center">
                                <button
                                  title="Edit"
                                  onClick={() => {
                                    editData(item);
                                  }}
                                  className="px-2 py-2 font-bold bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 text-white rounded-md text-xs"
                                >
                                  Edit
                                </button>
                                <button
                                  title="Renew"
                                  onClick={() => {
                                    setRenewAddress(item.contractAddress);
                                  }}
                                  className="px-2 py-2 bg-blue-500 font-bold text-white rounded-md text-xs hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                                >
                                  Renew
                                </button>
                                {new Date(item.expiryDate * 1000).getTime() < date && (
                                  <WithdrawButton
                                    onClick={() => {
                                      setWithdrawAddress(item.contractAddress);
                                    }}
                                    budget={item.budget}
                                    address={item.contractAddress}
                                  />
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <h2 className="text-center text-gray-500 text-sm font-bold">No Proposals</h2>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Page;
