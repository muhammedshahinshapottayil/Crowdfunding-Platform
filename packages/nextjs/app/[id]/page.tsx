"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { gql, useQuery } from "@apollo/client";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import Loading from "~~/components/Loading";
import { Address, EtherInput, InputBase } from "~~/components/scaffold-eth";
import { useAccountBalance, useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { Messages, ProposalOnChain } from "~~/types/utils";

function Page() {
  const { id } = useParams();
  const { address } = useAccount();
  const [message, setMessage] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const [comments, setComments] = useState<Messages[]>([]);
  const { balance } = useAccountBalance(id.toString());

  const PROPOSAL_GRAPHQL = `
  query MyQuery($address: String!) {
    comments(
      where: { contractAddress: $address }
      orderBy: date
      orderDirection: desc
    ) {
      account
      comment
      date
    }
  }

`;

  const PROPOSAL_GQL = gql(PROPOSAL_GRAPHQL);

  const { data: commentsData } = useQuery(PROPOSAL_GQL, {
    variables: { address: id },
    fetchPolicy: "network-only",
  });

  const [data, setData] = useState<ProposalOnChain>({
    budgetInEth: 0,
    date: "",
    details: "",
    expiryDate: "",
    idea: "",
    proposalName: "",
  });

  const { data: response, isLoading } = useScaffoldContractRead({
    contractName: "KickStarter",
    functionName: "getProposedIdea",
    args: [id.toString()],
    account: address,
  });
  const { writeAsync: donate } = useScaffoldContractWrite({
    contractName: "KickStarter",
    functionName: "donation",
    args: [id.toString()],
    value: parseEther(value),
    blockConfirmations: 1,
    onBlockConfirmation: txnReceipt => {
      console.log("Transaction blockHash", txnReceipt.blockHash);
    },
  });

  const { writeAsync: comment } = useScaffoldContractWrite({
    contractName: "KickStarter",
    functionName: "comments",
    args: [id.toString(), message],
    blockConfirmations: 1,
    onBlockConfirmation: txnReceipt => {
      console.log("Transaction blockHash", txnReceipt.blockHash);
    },
  });

  const { writeAsync: withdrawDonation } = useScaffoldContractWrite({
    contractName: "KickStarter",
    functionName: "withdrawDonation",
    args: [id.toString()],
    blockConfirmations: 1,
    onBlockConfirmation: txnReceipt => {
      console.log("Transaction blockHash", txnReceipt.blockHash);
    },
  });

  useEffect(() => {
    const getData = () => {
      const budgetInEth = Number(response?.budgetInEth) / 1e18;
      const date = new Date(Number(response?.date) * 1000).toDateString();
      const expiryDate = new Date(Number(response?.expiryDate) * 1000).toDateString();
      setData({
        budgetInEth,
        date,
        expiryDate,
        details: response?.details || "",
        idea: response?.idea || "",
        proposalName: response?.proposalName || "",
      });
    };
    if (id && address && response) getData();
  }, [id, address, response]);

  useEffect(() => {
    setComments(commentsData?.comments ?? []);
  }, [commentsData]);

  const handleComment = async () => {
    await comment();
    setMessage("");
    const date = new Date();
    const isoString = date.toISOString();
    const timestamp = Math.floor(new Date(isoString).getTime() / 1000);
    setComments([
      {
        account: address,
        comment: message,
        date: timestamp,
      },
      ...commentsData?.comments,
    ]);

    // setTimeout(async () => {
    //   const { data }: any = await refetchComments();
    //   setComments(data?.comments ?? []);
    // }, 4000);
  };

  if (isLoading) return <Loading />;

  return response ? (
    <section className="bg-gray-100">
      <div className="flex justify-center items-center h-screen ">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">
            {data.proposalName} <span className="float-right text-sm text-blue-500 mt-2"> Balance: {balance}</span>
          </h2>

          <div className="mb-4">
            <p className="text-sm font-bold text-gray-600">
              Budget in ETH: <span className="text-gray-800 text-sm font-bold">{data.budgetInEth}</span>
            </p>
          </div>
          <div className="mb-4">
            <p className="text-gray-600 text-sm font-bold">
              Date: <span className="text-gray-800">{data.date}</span>
            </p>
          </div>
          <div className="mb-4">
            <p className="text-gray-600 text-sm font-bold">
              Expiry Date: <span className="text-gray-800">{data.expiryDate}</span>
            </p>
          </div>
          <div className="mb-4">
            <p className="text-gray-600 text-sm font-bold">Details:</p>
            <p className="text-gray-800 text-sm font-bold">{data.details}</p>
          </div>
          <div className="mb-4">
            <EtherInput
              value={value}
              onChange={value => {
                setValue(value);
              }}
            />
            <div className="flex justify-around mt-2">
              <button
                onClick={() => {
                  donate();
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded-md"
              >
                Donate
              </button>
              <button
                onClick={() => {
                  withdrawDonation();
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-1 px-2 rounded-md"
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center items-center">
        <div className="w-full px-4 py-2 max-w-3xl bg-white shadow-md rounded-lg overflow-hidden">
          <div className="flex justify-around">
            <InputBase placeholder="Add comment" value={message} onChange={value => setMessage(value)} />
            <button
              onClick={handleComment}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded-md"
            >
              Comment
            </button>
          </div>
          <div className="px-4 py-2">
            <div className="">
              {comments.length > 0 ? (
                <>
                  <h2 className="text-center text-lg font-bold">Comments</h2>
                  <div className="max-h-80 overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <table className="table-auto min-w-full">
                      <tbody>
                        {comments.map((item: Messages) => (
                          <tr key={item.date} className="divide-x divide-gray-200">
                            <td className="border px-4 py-2 w-1/4 max-w-xs">
                              <Address address={item.account} />
                            </td>
                            <td className="border px-4 py-2 w-1/2 max-w-md">
                              <p>{item.comment}</p>
                            </td>
                            <td className="border px-4 py-2 w-1/4 max-w-xs">
                              {new Date(item.date * 1000).toDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <h2 className="text-center text-gray-500 text-sm font-bold">No Comments</h2>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  ) : (
    <Loading />
  );
}

export default Page;
