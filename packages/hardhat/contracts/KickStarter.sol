// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./Proposal.sol";

// Errors ----------------------------------
error Err__Profit__Withdraw__Failed();
error Err__Donation__Fails();
error Err__Creating__Proposal__Failed(address);
error Err__Updating__Proposal__Failed(address);
error Err__Renewing__Proposal__Failed(address);

contract KickStarter is Ownable, ReentrancyGuard {
	// Interfaces or Types----------------------

	// Storage
	mapping(address => uint256) s_contracts;
	// Events ----------------------------------
	event Evt__Donation(
		address indexed donatorAddress,
		address indexed contractAddress,
		uint256 indexed amount,
		uint256 timestamp
	);
	event Evt__Donation__Withdraw(
		address indexed account,
		address indexed contractAdddress,
		uint256 timestamp
	);
	event Evt__Profit__Withdraw(uint256 amount, uint256 timestamp);

	event Evt__Fund__Withdrawed(
		address indexed account,
		address indexed contractAddress
	);

	event Evt__Contract__Deployed(
		address indexed account,
		address indexed contractAddress,
		string proposalName,
		string idea,
		uint256 budgetInEth,
		uint256 expiryTime
	);

	event Evt__Contract__Update__Deployed(
		address indexed account,
		address indexed contractAddress,
		string proposalName,
		string idea,
		uint256 budgetInEth
	);

	event Evt__Comments(
		address indexed account,
		address indexed contractAddress,
		string message,
		uint256 date
	);

	event Evt__Renewed(
		address indexed account,
		address indexed contractAddress,
		uint256 renewedDate
	);

	// Modifiers--------------------------------

	constructor() Ownable() ReentrancyGuard() {}

	function createProposal(
		string memory proposalName,
		string memory idea,
		string memory details,
		uint256 budgetInEth
	) public payable {
		if (msg.value != 0.1 ether)
			revert Err__Creating__Proposal__Failed(tx.origin);
		uint256 time = block.timestamp;
		Proposal contractDeployed = new Proposal(
			proposalName,
			idea,
			details,
			budgetInEth,
			time
		);

		emit Evt__Contract__Deployed(
			tx.origin,
			address(contractDeployed),
			proposalName,
			idea,
			budgetInEth,
			time + 30 days
		);
	}

	function updateProposal(
		address contractAddress,
		string memory proposalName,
		string memory idea,
		string memory details,
		uint256 budgetInEth
	) public payable {
		if (msg.value != 0.1 ether)
			revert Err__Updating__Proposal__Failed(tx.origin);
		Proposal contractDeployed = Proposal(payable(address(contractAddress)));
		contractDeployed.updateProposal(
			proposalName,
			idea,
			details,
			budgetInEth
		);

		emit Evt__Contract__Update__Deployed(
			tx.origin,
			address(contractDeployed),
			proposalName,
			idea,
			budgetInEth
		);
	}

	function renewProposal(address contractAddress) public payable {
		if (msg.value > 0.05 ether)
			revert Err__Renewing__Proposal__Failed(contractAddress);
		Proposal contractDeployed = Proposal(payable(address(contractAddress)));
		contractDeployed.renewProposal();
		emit Evt__Renewed(
			tx.origin,
			contractAddress,
			block.timestamp + 30 days
		);
	}

	function donation(address contractAddress) public payable {
		if (msg.value <= 0) revert Err__Donation__Fails();
		Proposal contractDeployed = Proposal(payable(address(contractAddress)));
		contractDeployed.riseFund{ value: msg.value }();
		emit Evt__Donation(
			msg.sender,
			contractAddress,
			msg.value,
			block.timestamp
		);
	}

	function withdrawDonation(address contractAddress) public {
		Proposal contractDeployed = Proposal(payable(address(contractAddress)));
		contractDeployed.withdrawDeposits();
		emit Evt__Donation__Withdraw(
			msg.sender,
			contractAddress,
			block.timestamp
		);
	}

	function withdrawFunds(address contractAddress) public nonReentrant {
		Proposal contractDeployed = Proposal(payable(address(contractAddress)));
		contractDeployed.withdrawFunds();
		emit Evt__Fund__Withdrawed(tx.origin, contractAddress);
	}

	function withdrawProfit() public onlyOwner nonReentrant {
		if (address(this).balance <= 0) revert Err__Profit__Withdraw__Failed();

		(bool success, ) = payable(address(owner())).call{
			value: address(this).balance
		}("");
		if (!success) revert Err__Profit__Withdraw__Failed();
		emit Evt__Profit__Withdraw(address(this).balance, block.timestamp);
	}

	function comments(address contractAddress, string memory message) public {
		emit Evt__Comments(
			tx.origin,
			contractAddress,
			message,
			block.timestamp
		);
	}

	function pauseContract(address contractAddress) public onlyOwner {
		Proposal contractDeployed = Proposal(payable(address(contractAddress)));
		contractDeployed.pauseContract();
	}

	function getProposedIdea(
		address contractAddress
	) public view returns (Proposal.IdeaProposed memory) {
		Proposal contractDeployed = Proposal(payable(address(contractAddress)));
		return contractDeployed.getProposedIdea();
	}

	function fundRaised(address contractAddress) public view returns (uint256) {
		Proposal contractDeployed = Proposal(payable(address(contractAddress)));
		return contractDeployed.fundRaised();
	}

	function getFundWanted(
		address contractAddress
	) public view returns (uint256) {
		Proposal contractDeployed = Proposal(payable(address(contractAddress)));
		return contractDeployed.getFundWanted();
	}

	function projectOwner() public view returns (address) {
		return owner();
	}

	function contractBalance() public view returns (uint256) {
		return address(this).balance;
	}

	fallback() external payable {}

	receive() external payable {}
}
