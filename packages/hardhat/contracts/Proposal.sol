// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

error Err__Is__Contract(address);
error Err__Is__Not__Parent(address);
error Err__Is__Not__Owner(address);
error Err__Donation__Failed(address);
error Err__Withdrawal__Failed();

contract Proposal is Ownable, ReentrancyGuard, Pausable {
	struct IdeaProposed {
		string proposalName;
		string idea;
		string details;
		uint256 budgetInEth;
		uint256 date;
		uint256 expiryDate;
	}
	// Storage
	address private immutable i_parentAddress;
	IdeaProposed private s_proposalDetails;
	mapping(address => uint256) s_donators;
	// Events

	//Modifiers
	modifier isContract() {
		int256 size;
		address signerAddress = tx.origin;
		assembly {
			size := extcodesize(signerAddress)
		}
		if (size > 0) revert Err__Is__Contract(signerAddress);
		_;
	}

	modifier isParent() {
		if (msg.sender != i_parentAddress)
			revert Err__Is__Not__Parent(msg.sender);
		_;
	}

	modifier isOwner() {
		if (tx.origin != owner()) revert Err__Is__Not__Owner(tx.origin);
		_;
	}

	constructor(
		string memory proposalName,
		string memory idea,
		string memory details,
		uint256 budgetInEth,
		uint256 time
	) isContract() Ownable() ReentrancyGuard() Pausable() {
		s_proposalDetails = IdeaProposed({
			proposalName: proposalName,
			idea: idea,
			details: details,
			budgetInEth: budgetInEth,
			date: time,
			expiryDate: time + 30 days
		});
		i_parentAddress = msg.sender;
		transferOwnership(tx.origin);
	}

	function riseFund() public payable whenNotPaused {
		if (
			msg.value > getFundWanted() + 0.1 ether ||
			msg.value <= 0 ||
			block.timestamp > s_proposalDetails.expiryDate
		) revert Err__Donation__Failed(msg.sender);
		s_donators[tx.origin] = s_donators[tx.origin] + msg.value;
	}

	function withdrawFunds()
		public
		isParent
		isOwner
		nonReentrant
		whenNotPaused
	{
		if (
			getFundWanted() != 0 ||
			fundRaised() < s_proposalDetails.budgetInEth ||
			block.timestamp < s_proposalDetails.expiryDate
		) revert Err__Withdrawal__Failed();

		(bool success, ) = payable(address(owner())).call{
			value: address(this).balance
		}("");
		if (!success) revert Err__Withdrawal__Failed();
		_pause();
	}

	function withdrawDeposits() public isParent nonReentrant {
		uint256 amount = s_donators[tx.origin];
		if (amount <= 0) revert Err__Withdrawal__Failed();
		s_donators[tx.origin] = 0;
		(bool success, ) = payable(address(tx.origin)).call{ value: amount }(
			""
		);
		if (!success) revert Err__Withdrawal__Failed();
	}

	function updateProposal(
		string memory name,
		string memory idea,
		string memory details,
		uint256 budgetInEth
	) public isParent whenNotPaused {
		s_proposalDetails.budgetInEth = budgetInEth;
		s_proposalDetails.details = details;
		s_proposalDetails.idea = idea;
		s_proposalDetails.proposalName = name;
	}

	function renewProposal() public isOwner isParent whenNotPaused {
		s_proposalDetails.expiryDate = block.timestamp + 30 days;
	}

	function getProposedIdea()
		public
		view
		isParent
		returns (IdeaProposed memory)
	{
		return s_proposalDetails;
	}

	function fundRaised() public view isParent returns (uint256) {
		return address(this).balance;
	}

	function getFundWanted() public view isParent returns (uint256) {
		return s_proposalDetails.budgetInEth - address(this).balance;
	}

	function pauseContract() public isParent {
		_pause();
	}

	fallback() external payable {
		riseFund();
	}

	receive() external payable {
		riseFund();
	}
}
