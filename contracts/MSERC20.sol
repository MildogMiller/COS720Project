// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import "./IMSERC20.sol";

/// @title Mutually secure ERC20
/// @author Adir Miller
/// @notice This contract requires to to request payment before its made
/// @dev Hooks may be introduced in a later stage
contract MSERC20 is IMSERC20 {

    /// @notice Struct of the requests
    struct request {
        uint256 amount;
        uint256 endtime;
    }

    mapping(address => uint256) internal _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    mapping(address => mapping(address => request)) private _requests;
    mapping(address => uint32) private _requestcount;

    string private _name;
    string private _symbol;
    uint256 internal _totalSupply;
    uint16 private _requestLimit;

    constructor(
        string memory name_,
        string memory symbol_,
        uint16 requestLimit_,
        uint256 initial
    ) {
        _name = name_;
        _symbol = symbol_;
        _requestLimit = requestLimit_;
        _balances[msg.sender] = initial;
        _totalSupply = initial;
    }

    /// @notice Simple return for name
    /// @return name of the currency
    function name() public view override returns (string memory) {
        return _name;
    }

    /// @notice Simple return for symbol
    /// @return symbol of the currency
    function symbol() public view override returns (string memory) {
        return _symbol;
    }

    /// @notice Simple return for symbol
    /// @return symbol of the currency
    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }


    function decimals() public pure override returns (uint8) {
        return 18;
    }

    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }

    function myBalance() public view returns (uint256) {
        return _balances[msg.sender];
    }

    function requestLimit() public view returns (uint16) {
        return _requestLimit;
    }

    function getRequestExpiry(
        address requester,
        address recipient
    ) public view returns (uint256) {
        require(
            isNotEmpty(_requests[requester][recipient]),
            "MSERC20: No request found"
        );
        return _requests[requester][recipient].endtime;
    }

    function getRequestAmount(
        address requester,
        address recipient
    ) public view returns (uint256) {
        require(
            isNotEmpty(_requests[requester][recipient]),
            "MSERC20: No request found"
        );
        return _requests[requester][recipient].amount;
    }

    function getRequestCount() public view returns (uint32) {
        return _requestcount[msg.sender];
    }

    function isNotEmpty(request memory inrequest) internal pure returns (bool) {
        return inrequest.amount != 0 && inrequest.endtime != 0;
    }

    function transfer(
        address recipient,
        uint256 amount
    ) public override returns (bool) {
        _maketransfer(msg.sender, recipient, amount);
        return true;
    }

    //need to make sure they are allowed
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        require(
            _from != msg.sender,
            "MSERC20: Incorrect method for transfer from own account, use `transfer` instead."
        );
        //check if sender is on the allowance list
        require(
            _allowances[_from][msg.sender] > 0,
            "MSERC20: Sender not on the allowanace list, Or approve is still pending"
        );
        require(
            _allowances[_from][msg.sender] > _value,
            "MSERC20: Sender's allowence is not high enough"
        );
        _maketransfer(_from, _to, _value);
        _allowances[_from][msg.sender] -= _value; //decrease their allowance
        emit AllowanceTransfer(_from,msg.sender,_to,_value);
        return true;
    }

    function _maketransfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal returns (bool) {
        require(
            isNotEmpty(_requests[recipient][sender]),
            "MSERC20: No request found"
        );
        require(
            _requests[recipient][sender].amount == amount,
            "MSERC20: Request amounts do not match"
        );
        require(
            _balances[sender] >= amount,
            "MSERC20: transfer amount exceeds balance"
        );
        assert(amount >= 0);// is an assert since we know the requests cant be 0s
        assert(recipient!=sender);// is an assert since we know the requests cant have this issue
        if (_requests[recipient][sender].endtime < block.timestamp) {
            _removeRequest(recipient, sender);
            revert("MSERC20: Request has expired");
        }
        //overflow and underflow impossible
        //do the transfer
        _balances[sender] -= amount;
        _balances[recipient] += amount;
        _removeRequest(recipient, sender);
        emit Transfer(sender, recipient, amount);
        return true;
    }

    function addNewRequest(
        address requestee,
        uint256 amount,
        uint256 time
    ) public returns (bool) {
        require(
            _requestcount[msg.sender] + 1 <= _requestLimit,
            "MSERC20: Max requests reached"
        );
        require(time > block.timestamp, "MSERC20: Time is in the past");
        require(
            time < block.timestamp + 86400,
            "MSERC20: Time is too far in the future, Cannot be more then 24 hours"
        );
        require(
            time > block.timestamp + 600,
            "MSERC: Time must be at least 10 minutes in the future"
        );
        require(
            !isNotEmpty(_requests[msg.sender][requestee]),
            "MSERC20: Request for this account already exists"
        );
        require(
            requestee != msg.sender,
            "MSERC20: Cannot make a request to yourself"
        );
        require(amount > 0, "MSERC20: Amount cant be 0");
        assert(amount >= 0);
        _requestcount[msg.sender]++;
        _requests[msg.sender][requestee] = request(amount, time);
        emit NewRequest(msg.sender, requestee, amount);
        return true;
    }

    function _removeRequest(
        address requester,
        address recipient
    ) internal returns (bool) {
        require(
            isNotEmpty(_requests[requester][recipient]),
            "MSERC20: no requests for recipient"
        );
        assert(requester != address(0));
        delete _requests[requester][recipient];
        _requestcount[requester]--;
        emit RemoveRequest(msg.sender, requester, recipient);
        return true;
    }

    //slight race condition,
    function removeRequest(address requester,address recipient) public returns (bool) {
        require(
            requester==msg.sender||recipient==msg.sender,"MSERC20: Cannot delete someone elses request"
        );
        _removeRequest(requester, recipient);
        return true;
    }

    function approve(
        address _spender,
        uint256 _value
    ) public override returns (bool success) {
        require(
            _allowances[msg.sender][_spender] == 0|| _value==0,
            "MSERC20: Amount must first be set to 0 before changing"
        ); //version of compare and swap, prevents race condition
        require(msg.sender!=_spender,"MSERC20: Cannot set own allowance");
        _allowances[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(
        address _owner,
        address _spender
    ) public view override returns (uint256 remaining) {
        return _allowances[_owner][_spender];
    }


    //new events
    event NewRequest(
        address indexed sender,
        address indexed recipient,
        uint256 amount
    );
    event RemoveRequest(
        address indexed actualSender,
        address indexed sender,
        address indexed recipient
    );
    event AllowanceTransfer(
        address indexed accholder,
        address indexed sender,
        address indexed recipient,
        uint256 amount
    );
}
