import { useAccountBalance } from "~~/hooks/scaffold-eth";

function WithdrawButton({ onClick, address, budget }: { onClick: () => void; address: string; budget: number }) {
  const { balance } = useAccountBalance(address);

  const bool = Number(balance) >= budget / 1e18;
  return (
    <button
      title="Withdraw"
      onClick={() => {
        Boolean(bool) && onClick();
      }}
      className={`px-2 py-2 bg-${!bool ? "red" : "green"}-500 font-bold text-white rounded-md text-xs hover:bg-${
        !bool ? "red" : "green"
      }-600 focus:outline-none focus:ring-2 focus:ring-${!bool ? "red" : "green"}-500 focus:ring-opacity-50`}
    >
      {bool ? `Now` : "Can't"}
    </button>
  );
}

export default WithdrawButton;
