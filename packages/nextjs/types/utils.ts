export type Tuple<T, MaxLength extends number = 10, Current extends T[] = []> = Current["length"] extends MaxLength
  ? Current
  : Current | Tuple<T, MaxLength, [T, ...Current]>;

export type Proposal = {
  id: string;
  account: string;
  contractAddress: string;
  name: string;
  idea: string;
  budget: number;
  expiryDate: number;
};

export type ProposalOnChain = {
  budgetInEth: number;
  date: string;
  details: string;
  expiryDate: string;
  idea: string;
  proposalName: string;
};

export type Messages = { comment: string; date: number; account: string };
