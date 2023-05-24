// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IMSERC20 {
    /// @notice Simple return for name
    /// @return name of the currency
    function name() external view returns (string memory);

    /// @notice Simple return for symbol
    /// @return symbol of the currency
    function symbol() external view returns (string memory);

    /// @notice Simple return for decimals
    /// @return decimals the amount of decimals
    function decimals() external view returns (uint8);

    /// @notice Simple return for totalSupply
    /// @return totalSupply of the currency
    function totalSupply() external view returns (uint256);

    /// @notice Returns the balance of an account
    /// @param _owner The owner of the account that of which balance details are being requested
    function balanceOf(address _owner) external view returns (uint256 balance);

    /// @notice Main transfer request, this will simply call the internal function _maketransfer
    /// @param _to the person being paid
    /// @param _value the amount
    function transfer(
        address _to,
        uint256 _value
    ) external returns (bool success);

    /// @notice Function used to transfer on someone elses behalf. This emits the AllowanceTransfer event
    /// @param _from the paying account
    /// @param _to the account getting paid
    /// @param _value the amount
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) external returns (bool success);

    /// @notice Function that dictates how much someone else can spend on your behalf.
    /// Value must first be set to 0 to prevent a race condition
    /// @param _spender the person who is spending on anothers behalf
    /// @param _value the approved amount to be spent
    function approve(
        address _spender,
        uint256 _value
    ) external returns (bool success);

    /// @notice Simple function that returns the current allowance allocated to a person
    /// @param _owner the person who is going to pay
    /// @param _spender the person who has permission to use funds from the others account
    function allowance(
        address _owner,
        address _spender
    ) external view returns (uint256 remaining);

    /// @notice Event that is fired when allowance is changed
    /// @param owner the person who is the account holder
    /// @param spender the person spending on the others behalf
    /// @param value the amount they can spend
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
    /// @notice Event fired when a transfer is made
    /// @param from the person paying
    /// @param to the person being paid
    /// @param value the amount being paid
    event Transfer(address indexed from, address indexed to, uint256 value);
}
