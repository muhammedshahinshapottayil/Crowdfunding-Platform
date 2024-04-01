import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  Evt__Contract__Deployed,
  Evt__Comments,
  Evt__Contract__Update__Deployed,
  Evt__Renewed,
  Evt__Donation,
  Evt__Fund__Withdrawed,
} from "../generated/KickStarter/KickStarter";
import { Proposal, Comment, Donation } from "../generated/schema";

export function handleCommentsPost(event: Evt__Comments): void {
  let comment = new Comment(event.transaction.hash.toHexString());
  comment.account = event.params.account;
  comment.contractAddress = event.params.contractAddress;
  comment.comment = event.params.message;
  comment.date = event.params.date;
  comment.save();
}
export function handleUpdateProposal(
  event: Evt__Contract__Update__Deployed
): void {
  const proposal = Proposal.load(
    genId(event.params.account, event.params.contractAddress)
  );
  if (proposal) {
    proposal.account = event.params.account;
    proposal.contractAddress = event.params.contractAddress;
    proposal.budget = event.params.budgetInEth;
    proposal.idea = event.params.idea;
    proposal.name = event.params.proposalName;
    proposal.save();
  }
}

export function handleProposalCreate(event: Evt__Contract__Deployed): void {
  const proposal = new Proposal(
    genId(event.params.account, event.params.contractAddress)
  );
  proposal.account = event.params.account;
  proposal.contractAddress = event.params.contractAddress;
  proposal.budget = event.params.budgetInEth;
  proposal.expiryDate = event.params.expiryTime;
  proposal.idea = event.params.idea;
  proposal.name = event.params.proposalName;
  proposal.save();
}

export function handleRenewContract(event: Evt__Renewed): void {
  const proposal = Proposal.load(
    genId(event.params.account, event.params.contractAddress)
  );
  if (proposal) {
    proposal.expiryDate = event.params.renewedDate;
    proposal.save();
  }
}

export function handleDonation(event: Evt__Donation) {
  const id = genId(event.params.donatorAddress, event.params.contractAddress);
  let donation;
  donation = Donation.load(id);
  if (!donation) {
    donation = new Donation(id);
    donation!.budget = event.params.amount;
  } else {
    donation!.budget = new BigInt(
      Number(donation!.budget) + Number(event.params.amount)
    );
  }
  donation!.account = event.params.donatorAddress;
  donation!.contractAddress = event.params.contractAddress;
  donation!.expiryDate = event.params.timestamp;
  donation!.status = true;
  donation.save();
}

export function handleWithdrawal(event: Evt__Fund__Withdrawed) {
  const id = genId(event.params.account, event.params.contractAddress);
  const donation = Donation.load(id);
  if (donation) {
    donation!.budget = new BigInt(0);
    donation!.expiryDate = event.block.timestamp;
    donation!.status = false;
    donation.save();
  }
}

function genId(acc: Address, conAcc: Address): string {
  return acc.toHexString() + conAcc.toHexString();
}
