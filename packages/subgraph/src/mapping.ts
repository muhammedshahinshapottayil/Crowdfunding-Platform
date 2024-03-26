import { Address } from "@graphprotocol/graph-ts";
import {
  Evt__Contract__Deployed,
  Evt__Comments,
  Evt__Contract__Update__Deployed,
  Evt__Renewed
} from "../generated/KickStarter/KickStarter";
import { Proposal, Comment } from "../generated/schema";

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

export function handleRenewContract(
  event: Evt__Renewed
): void {
  
  const proposal = Proposal.load(
    genId(event.params.account, event.params.contractAddress)
  );
  if (proposal) {
    proposal.expiryDate = event.params.renewedDate;
    proposal.save();
  }
}

function genId(acc: Address, conAcc: Address): string {
  return acc.toHexString() + conAcc.toHexString();
}
