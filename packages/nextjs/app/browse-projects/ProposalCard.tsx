import Link from "next/link";
import { useAccountBalance } from "~~/hooks/scaffold-eth";

function ProposalCard({
  name,
  budget,
  expiryDate,
  idea,
  contractAddress,
}: {
  name: string;
  budget: number;
  expiryDate: number;
  idea: string;
  contractAddress: string;
}) {
  const { balance, isLoading, isError } = useAccountBalance(contractAddress);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
      <div className="p-6">
        <span className="text-blue-500 font-bold text-sm float-right">
          Fund: {isLoading || isError ? <span className="loading loading-dots loading-xs"></span> : balance} ETH
        </span>
        <h3 className="text-xl text-gray-800 font-bold mb-4">{name}</h3>
        <p className="text-gray-800 mb-4 text-sm font-bold">{idea}</p>
        <div className="flex items-center mb-2">
          <span className="text-gray-700 text-sm font-bold">Budget: Eth {budget / 1e18}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700 text-sm font-bold">
            Expiry Time: {new Date(expiryDate * 1000).toDateString()}
          </span>
          <span className="text-gray-700">
            <Link className="btn btn-info" href={`/${contractAddress}`}>
              Contribute
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}

export default ProposalCard;
