pragma solidity ^0.8.0;

contract Donation {
    address public charity;
    mapping(address => uint256) public donations;
    uint256 public totalDonations;

    event DonationReceived(address indexed donor, uint256 amount, uint256 timestamp);

    constructor(address _charity) {
        require(_charity != address(0), "Charity address cannot be the zero address");
        charity = _charity;
    }

    function donate() public payable {
        require(msg.value > 0, "Donation must be greater than 0");
        donations[msg.sender] += msg.value;
        totalDonations += msg.value;
        emit DonationReceived(msg.sender, msg.value, block.timestamp);
    }

    function getDonation(address donor) public view returns (uint256) {
        return donations[donor];
    }
}
