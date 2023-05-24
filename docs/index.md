# Solidity API

## IMSERC20

### name

```solidity
function name() external view returns (string)
```

Simple return for name

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | name of the currency |

### symbol

```solidity
function symbol() external view returns (string)
```

Simple return for symbol

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | symbol of the currency |

### decimals

```solidity
function decimals() external view returns (uint8)
```

Simple return for decimals

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint8 | decimals the amount of decimals |

### totalSupply

```solidity
function totalSupply() external view returns (uint256)
```

Simple return for totalSupply

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | totalSupply of the currency |

### balanceOf

```solidity
function balanceOf(address _owner) external view returns (uint256 balance)
```

Returns the balance of an account

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _owner | address | The owner of the account that of which balance details are being requested |

### transfer

```solidity
function transfer(address _to, uint256 _value) external returns (bool success)
```

Main transfer request, this will simply call the internal function _maketransfer

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _to | address | the person being paid |
| _value | uint256 | the amount |

### transferFrom

```solidity
function transferFrom(address _from, address _to, uint256 _value) external returns (bool success)
```

Function used to transfer on someone elses behalf. This emits the AllowanceTransfer event

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _from | address | the paying account |
| _to | address | the account getting paid |
| _value | uint256 | the amount |

### approve

```solidity
function approve(address _spender, uint256 _value) external returns (bool success)
```

Function that dictates how much someone else can spend on your behalf.
Value must first be set to 0 to prevent a race condition

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _spender | address | the person who is spending on anothers behalf |
| _value | uint256 | the approved amount to be spent |

### allowance

```solidity
function allowance(address _owner, address _spender) external view returns (uint256 remaining)
```

Simple function that returns the current allowance allocated to a person

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _owner | address | the person who is going to pay |
| _spender | address | the person who has permission to use funds from the others account |

### Approval

```solidity
event Approval(address owner, address spender, uint256 value)
```

Event that is fired when allowance is changed

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| owner | address | the person who is the account holder |
| spender | address | the person spending on the others behalf |
| value | uint256 | the amount they can spend |

### Transfer

```solidity
event Transfer(address from, address to, uint256 value)
```

Event fired when a transfer is made

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| from | address | the person paying |
| to | address | the person being paid |
| value | uint256 | the amount being paid |

## MSERC20

This contract requires to to request payment before its made

_Hooks may be introduced in a later stage_

### request

```solidity
struct request {
  uint256 amount;
  uint256 endtime;
}
```

### _balances

```solidity
mapping(address => uint256) _balances
```

### _totalSupply

```solidity
uint256 _totalSupply
```

### constructor

```solidity
constructor(string name_, string symbol_, uint16 requestLimit_, uint256 initial) public
```

Constructor of the class, will set the total supply,innitial supply and
set this balance to the owner of the contract

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| name_ | string | The name of the token |
| symbol_ | string | The symbol of the token |
| requestLimit_ | uint16 | The max requests one account can request at a time |
| initial | uint256 | The innitial cap of coins, this will be allocated to the owner |

### name

```solidity
function name() public view returns (string)
```

Simple return for name

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | name of the currency |

### symbol

```solidity
function symbol() public view returns (string)
```

Simple return for symbol

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | symbol of the currency |

### totalSupply

```solidity
function totalSupply() public view returns (uint256)
```

Simple return for totalSupply

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | totalSupply of the currency |

### decimals

```solidity
function decimals() public pure returns (uint8)
```

Simple return for decimals

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint8 | decimals which is by default 18, however method can be overridden |

### balanceOf

```solidity
function balanceOf(address account) public view returns (uint256)
```

Returns the balance of an account

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| account | address | that is being requested balance details of |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | balance of account |

### myBalance

```solidity
function myBalance() public view returns (uint256)
```

Simple function that a requester can use to get their own balance

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | balance of requester |

### requestLimit

```solidity
function requestLimit() public view returns (uint16)
```

Simple function that can be used to get the global request limit

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint16 | balance of requester |

### isNotEmpty

```solidity
function isNotEmpty(struct MSERC20.request inrequest) internal pure returns (bool)
```

Helper function that checks if a given request is null

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| inrequest | struct MSERC20.request | the request being checked |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | requestnotempty which is boolean |

### getRequestExpiry

```solidity
function getRequestExpiry(address requester, address recipient) public view returns (uint256)
```

Function to get the request expiry of an existing transaction

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| requester | address | of the request |
| recipient | address | of the request |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | requestExpiry of request |

### getRequestCount

```solidity
function getRequestCount() public view returns (uint32)
```

Function that returns how many requests that you have made

### getRequestAmount

```solidity
function getRequestAmount(address requester, address recipient) public view returns (uint256)
```

Function to get the request amount of an existing transaction

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| requester | address | the person paying |
| recipient | address | the person being paid |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | requestAmount of request |

### transfer

```solidity
function transfer(address recipient, uint256 amount) public returns (bool)
```

Main transfer request, this will simply call the internal function _maketransfer

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| recipient | address | the person being paid |
| amount | uint256 | the amount |

### transferFrom

```solidity
function transferFrom(address _from, address _to, uint256 _value) public returns (bool success)
```

Function used to transfer on someone elses behalf. This emits the AllowanceTransfer event

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _from | address | the paying account |
| _to | address | the account getting paid |
| _value | uint256 | the amount |

### _maketransfer

```solidity
function _maketransfer(address sender, address recipient, uint256 amount) internal returns (bool)
```

Internal function that actually does the transfer logic, this function is not overridable by design. This emits the Transfer event

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| sender | address | the person paying |
| recipient | address | the person being paid |
| amount | uint256 | the amount |

### addNewRequest

```solidity
function addNewRequest(address requestee, uint256 amount, uint256 time) public returns (bool)
```

Makes a new request from the caller of the contract to the requetee. This emits the NewRequest event

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| requestee | address | the person requesting contract caller is requesting payment from |
| amount | uint256 | amount of the payment |
| time | uint256 | the expiry of the request |

### _removeRequest

```solidity
function _removeRequest(address requester, address recipient) internal returns (bool)
```

Helper function that is used to remove a request from the requests array. This emits the RemoveRequest event

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| requester | address | the person who is requesting payment |
| recipient | address | the person having payment requested from |

### removeRequest

```solidity
function removeRequest(address requester, address recipient) public returns (bool)
```

Function that is called to remove a request from the pool, this can be either the requester or the recipient.
This will simply return the internal _removeRequest function

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| requester | address | the person who is requesting payment |
| recipient | address | the person having payment requested from |

### approve

```solidity
function approve(address _spender, uint256 _value) public returns (bool success)
```

Function that dictates how much someone else can spend on your behalf.
Value must first be set to 0 to prevent a race condition

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _spender | address | the person who is spending on anothers behalf |
| _value | uint256 | the approved amount to be spent |

### allowance

```solidity
function allowance(address _owner, address _spender) public view returns (uint256 remaining)
```

Simple function that returns the current allowance allocated to a person

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _owner | address | the person who is going to pay |
| _spender | address | the person who has permission to use funds from the others account |

### NewRequest

```solidity
event NewRequest(address sender, address recipient, uint256 amount)
```

Event that is fired when a new request is made

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| sender | address | the person who is requesting payment |
| recipient | address | the person having payment requested from |
| amount | uint256 | the amount being requested |

### RemoveRequest

```solidity
event RemoveRequest(address actualSender, address sender, address recipient)
```

Event that is fired when a request is removed

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| actualSender | address | the person calling this contract |
| sender | address | the person who is requesting payment |
| recipient | address | the person having payment requested from |

### AllowanceTransfer

```solidity
event AllowanceTransfer(address accholder, address sender, address recipient, uint256 amount)
```

Event that is fired when someone makes a transfer on someone elses behalf

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| accholder | address | the account holder |
| sender | address | the person calling this contract |
| recipient | address | the person who is receiving money |
| amount | uint256 | the amount being transfered |

