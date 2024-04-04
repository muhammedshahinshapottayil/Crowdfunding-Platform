"use client";

import ProposalCard from "./ProposalCard";
import { gql, useQuery } from "@apollo/client";
import Loading from "~~/components/Loading";
import { Proposal } from "~~/types/utils";

const Page = () => {
  const PROPOSAL_GRAPHQL = `
  query MyQuery($currentTime: BigInt!) {
    proposals(
      where: { expiryDate_gt: $currentTime, status:true }
      orderBy: expiryDate
      orderDirection: desc
    ) {
      id
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
  const currentTime = Math.floor(Date.now() / 1000);
  const { data: proposalData, loading } = useQuery(PROPOSAL_GQL, {
    variables: { currentTime },
    fetchPolicy: "network-only",
  });

  if (loading) return <Loading />;
  return (
    <section>
      {proposalData && proposalData?.proposals.length > 0 ? (
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {proposalData?.proposals.map((proposal: Proposal) => (
              <ProposalCard
                key={proposal.id}
                name={proposal.name}
                idea={proposal.idea}
                budget={proposal.budget}
                expiryDate={proposal.expiryDate}
                contractAddress={proposal.contractAddress}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-screen text-xl font-bold">
          Waiting for proposals to be uploaded.
        </div>
      )}
    </section>
  );
};
export default Page;
