pragma solidity ^0.8.0;

contract Expenditure {
    address public admin;
    uint256 public totalExpenditures;

    struct ExpenditureRecord {
        address recipient;
        uint256 amount;
        string purpose;
        uint256 timestamp;
    }

    ExpenditureRecord[] public expenditures;

    event FundsDisbursed(address indexed recipient, uint256 amount, string purpose, uint256 timestamp);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    function disburseFunds(address _recipient, uint256 _amount, string memory _purpose) public onlyAdmin {
        require(_recipient != address(0), "Recipient address cannot be the zero address");
        require(_amount > 0, "Amount must be greater than 0");

        ExpenditureRecord memory newExpenditure = ExpenditureRecord({
            recipient: _recipient,
            amount: _amount,
            purpose: _purpose,
            timestamp: block.timestamp
        });

        expenditures.push(newExpenditure);
        totalExpenditures += _amount;

        emit FundsDisbursed(_recipient, _amount, _purpose, block.timestamp);
    }

    function getExpenditures() public view returns (ExpenditureRecord[] memory) {
        return expenditures;
    }
}
