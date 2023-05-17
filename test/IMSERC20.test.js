const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

function getTimestamp(addSeconds) {
  var d = new Date();
  var n = d.getTime();
  return Math.floor(n / 1000) + addSeconds;
}

describe("Deployment Sets", function () {
  async function deployMSERC20Fixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const MSERC20 = await ethers.getContractFactory("MSERC20");
    const MSERC20Contract = await MSERC20.deploy("MSERC20TEST", "MSERC20TESTSYMBOL", "4", "1000");
    return { MSERC20Contract, owner, addr1, addr2 };
  }

  it("Should set the right name", async function () {
    const { MSERC20Contract } = await loadFixture(deployMSERC20Fixture);
    expect(await MSERC20Contract.name()).to.equal("MSERC20TEST");
  });

  it("Should set the right Symbol", async function () {
    const { MSERC20Contract } = await loadFixture(deployMSERC20Fixture);
    expect(await MSERC20Contract.symbol()).to.equal("MSERC20TESTSYMBOL");
  });

  it("Should set the right requestLimit", async function () {
    const { MSERC20Contract } = await loadFixture(deployMSERC20Fixture);
    expect(await MSERC20Contract.requestLimit()).to.equal(4);
  });

  it("Should set the right Total Supply", async function () {
    const { MSERC20Contract } = await loadFixture(deployMSERC20Fixture);
    expect(await MSERC20Contract.totalSupply()).to.equal(1000);
  });

  it("Should return the right decimals", async function () {
    const { MSERC20Contract } = await loadFixture(deployMSERC20Fixture);
    expect(await MSERC20Contract.decimals()).to.equal(18);
  });

  it("Should set the give the owner of the contract the correct amount, (mybalance)", async function () {
    const { MSERC20Contract } = await loadFixture(deployMSERC20Fixture);
    expect(await MSERC20Contract.myBalance()).to.equal(1000);
  });

  it("Should set the give the owner of the contract the correct amount, (balanceOf)", async function () {
    const { MSERC20Contract, owner } = await loadFixture(deployMSERC20Fixture);
    expect(await MSERC20Contract.balanceOf(owner.address)).to.equal(1000);
  });
});

describe("Request tests", function () {
  //check amount race condition
  this.timeout(5 * 1000);

  async function deployMSERC20Fixture() {
    const [owner, addr1, addr2, addr3, addr4, addr5, addr6] = await ethers.getSigners();
    const MSERC20 = await ethers.getContractFactory("MSERC20");
    const MSERC20Contract = await MSERC20.deploy("MSERC20TEST", "MSERC20TESTSYMBOL", "5", "1000");
    return { MSERC20Contract, owner, addr1, addr2, addr3, addr4, addr5, addr6 };
  }

  it("Should emit a new request event", async function () {
    // return new Promise(async (resolve, reject) => {
    const { MSERC20Contract, owner, addr1 } = await loadFixture(deployMSERC20Fixture);
    const timeset = getTimestamp(8000);
    await expect(MSERC20Contract.connect(addr1).addNewRequest(owner.address, 10, timeset)).to.emit(MSERC20Contract, "NewRequest").withArgs(addr1.address, owner.address, 10);
    //   resolve();
    // });
  });

  it("Should update the correct request count", async function () {
    // return new Promise(async (resolve, reject) => {
    const { MSERC20Contract, owner, addr1, addr2 } = await loadFixture(deployMSERC20Fixture);
    const timeset = getTimestamp(8000);
    await MSERC20Contract.connect(addr1).addNewRequest(owner.address, 10, timeset);
    expect(await MSERC20Contract.connect(addr1).getRequestCount()).to.equal(1);
    await MSERC20Contract.connect(addr1).addNewRequest(addr2.address, 10, timeset);
    expect(await MSERC20Contract.connect(addr1).getRequestCount()).to.equal(2);
  });

  it("Should return the right expiry", async function () {
    const { MSERC20Contract, owner, addr1 } = await loadFixture(deployMSERC20Fixture);
    const timeset = getTimestamp(8000);
    const addr1connect = MSERC20Contract.connect(addr1);
    await addr1connect.addNewRequest(owner.address, 10, timeset);
    expect(await addr1connect.getRequestExpiry(addr1.address, owner.address)).to.be.equal(timeset);
  });

  it("Should return the right amount", async function () {
    const { MSERC20Contract, owner, addr1 } = await loadFixture(deployMSERC20Fixture);
    const timeset = getTimestamp(8000);
    const addr1connect = MSERC20Contract.connect(addr1);
    await addr1connect.addNewRequest(owner.address, 10, timeset);
    expect(await addr1connect.getRequestAmount(addr1.address, owner.address)).to.be.equal(10);
  });

  it("Should fail if expiry requested for non existant request", async function () {
    const { MSERC20Contract, owner, addr1, addr2 } = await loadFixture(deployMSERC20Fixture);
    const timeset = getTimestamp(8000);
    const addr1connect = MSERC20Contract.connect(addr1);
    await addr1connect.addNewRequest(owner.address, 10, timeset);
    await expect(addr1connect.getRequestExpiry(addr2.address, owner.address)).to.be.revertedWith("MSERC20: No request found");
  });

  it("Should fail if amount requested for non existant request", async function () {
    const { MSERC20Contract, owner, addr1, addr2 } = await loadFixture(deployMSERC20Fixture);
    const timeset = getTimestamp(8000);
    const addr1connect = MSERC20Contract.connect(addr1);
    await addr1connect.addNewRequest(owner.address, 10, timeset);
    await expect(addr1connect.getRequestAmount(addr2.address, owner.address)).to.be.revertedWith("MSERC20: No request found");
  });

  it("Should fail if max requests are reached", async function () {
    const { MSERC20Contract, owner, addr1, addr2, addr3, addr4, addr5, addr6 } = await loadFixture(deployMSERC20Fixture);
    const timeset = getTimestamp(8000);
    const addr1connect = MSERC20Contract.connect(addr1);
    await addr1connect.addNewRequest(owner.address, 10, timeset);
    await addr1connect.addNewRequest(addr2.address, 10, timeset);
    await addr1connect.addNewRequest(addr3.address, 10, timeset);
    await addr1connect.addNewRequest(addr4.address, 10, timeset);
    await addr1connect.addNewRequest(addr5.address, 10, timeset);
    await expect(addr1connect.addNewRequest(addr6.address, 10, timeset)).to.be.revertedWith("MSERC20: Max requests reached");
  });

  it("Should fail if time is in the past", async function () {
    const { MSERC20Contract, owner, addr1, addr2 } = await loadFixture(deployMSERC20Fixture);
    const addr1connect = MSERC20Contract.connect(addr1);
    const timeset = getTimestamp(-100);
    await expect(addr1connect.addNewRequest(owner.address, 10, timeset)).to.be.revertedWith("MSERC20: Time is in the past");
  });

  it("Should fail if time is not more then 10 minutes in future", async function () {
    const { MSERC20Contract, owner, addr1, addr2 } = await loadFixture(deployMSERC20Fixture);
    const addr1connect = MSERC20Contract.connect(addr1);
    const timeset = getTimestamp(200);
    await expect(addr1connect.addNewRequest(owner.address, 10, timeset)).to.be.revertedWith("MSERC: Time must be at least 10 minutes in the future");
  });

  it("Should fail if time more then 24 hours", async function () {
    const { MSERC20Contract, owner, addr1, addr2 } = await loadFixture(deployMSERC20Fixture);
    const addr1connect = MSERC20Contract.connect(addr1);
    const timeset = getTimestamp(86500);
    await expect(addr1connect.addNewRequest(owner.address, 10, timeset)).to.be.revertedWith("MSERC20: Time is too far in the future, Cannot be more then 24 hours");
  });

  it("Should fail if request already exists", async function () {
    const { MSERC20Contract, owner, addr1 } = await loadFixture(deployMSERC20Fixture);
    const timeset = getTimestamp(8000);
    const addr1connect = MSERC20Contract.connect(addr1);
    await addr1connect.addNewRequest(owner.address, 10, timeset);
    await expect(addr1connect.addNewRequest(owner.address, 10, timeset)).to.be.revertedWith("MSERC20: Request for this account already exists");
  });

  it("Should fail if amount is 0", async function () {
    const { MSERC20Contract, owner, addr1 } = await loadFixture(deployMSERC20Fixture);
    const timeset = getTimestamp(8000);
    const addr1connect = MSERC20Contract.connect(addr1);
    await expect(addr1connect.addNewRequest(owner.address, 0, timeset)).to.be.revertedWith("MSERC20: Amount cant be 0");
  });

  it("Should fail you make a request to yourself", async function () {
    const { MSERC20Contract, owner, addr1 } = await loadFixture(deployMSERC20Fixture);
    const timeset = getTimestamp(8000);
    const addr1connect = MSERC20Contract.connect(addr1);
    await expect(addr1connect.addNewRequest(addr1.address, 0, timeset)).to.be.revertedWith("MSERC20: Cannot make a request to yourself");
  });
});

describe("Remove Request tests", function () {
  this.timeout(5 * 1000);

  async function deployMSERC20Fixture() {
    const [owner, addr1, addr2, addr3, addr4, addr5, addr6] = await ethers.getSigners();
    const MSERC20 = await ethers.getContractFactory("MSERC20");
    const MSERC20Contract = await MSERC20.deploy("MSERC20TEST", "MSERC20TESTSYMBOL", "5", "1000");
    return { MSERC20Contract, owner, addr1, addr2, addr3, addr4, addr5, addr6 };
  }

  it("Should emit the correct event", async function () {
    const { MSERC20Contract, owner, addr1 } = await loadFixture(deployMSERC20Fixture);
    const timeset = getTimestamp(8000);
    const addr1connect = MSERC20Contract.connect(addr1);
    await addr1connect.addNewRequest(owner.address, 10, timeset);
    await expect(addr1connect.removeRequest(addr1.address, owner.address)).to.emit(MSERC20Contract, "RemoveRequest").withArgs(addr1.address, addr1.address, owner.address);
  });
  it("Should fail if no request exists", async function () {
    const { MSERC20Contract, owner, addr1 } = await loadFixture(deployMSERC20Fixture);
    const addr1connect = MSERC20Contract.connect(addr1);
    await expect(addr1connect.removeRequest(addr1.address, owner.address)).to.be.revertedWith("MSERC20: no requests for recipient");
  });

  it("Should remove the request", async function () {
    const { MSERC20Contract, owner, addr1 } = await loadFixture(deployMSERC20Fixture);
    const timeset = getTimestamp(8000);
    const addr1connect = MSERC20Contract.connect(addr1);
    await addr1connect.addNewRequest(owner.address, 10, timeset);
    await expect(addr1connect.removeRequest(addr1.address, owner.address)).to.not.be.reverted;
    await expect(addr1connect.removeRequest(addr1.address, owner.address)).to.be.revertedWith("MSERC20: no requests for recipient");
  });

  it("Should remove request if sender is the recipient", async function () {
    const { MSERC20Contract, owner, addr1 } = await loadFixture(deployMSERC20Fixture);
    const timeset = getTimestamp(8000);
    const addr1connect = MSERC20Contract.connect(addr1);
    await addr1connect.addNewRequest(owner.address, 10, timeset);
    await expect(MSERC20Contract.removeRequest(addr1.address, owner.address)).to.emit(MSERC20Contract, "RemoveRequest").withArgs(owner.address, addr1.address, owner.address);
  });

  it("Should decrease the request count", async function () {
    const { MSERC20Contract, owner, addr1 } = await loadFixture(deployMSERC20Fixture);
    const timeset = getTimestamp(8000);
    const addr1connect = MSERC20Contract.connect(addr1);
    await addr1connect.addNewRequest(owner.address, 10, timeset);
    await addr1connect.removeRequest(addr1.address, owner.address);
    expect(await addr1connect.getRequestCount()).to.be.equal(0);
  });

  it("Should fail if sender is not the recipient or requester (Not recipient)", async function () {
    const { MSERC20Contract, owner, addr1, addr2 } = await loadFixture(deployMSERC20Fixture);
    const timeset = getTimestamp(8000);
    const addr1connect = MSERC20Contract.connect(addr1);
    await addr1connect.addNewRequest(owner.address, 10, timeset);
    await expect(MSERC20Contract.connect(addr2).removeRequest(addr1.address, owner.address)).to.be.revertedWith("MSERC20: Cannot delete someone elses request");
  });
});

describe("Transfer Tests", function () {
  this.timeout(5 * 1000);

  async function deployMSERC20Fixture() {
    const [owner, addr1, addr2, addr3, addr4, addr5, addr6] = await ethers.getSigners();
    const MSERC20 = await ethers.getContractFactory("MSERC20");
    const MSERC20Contract = await MSERC20.deploy("MSERC20TEST", "MSERC20TESTSYMBOL", "5", "1000");
    return { MSERC20Contract, owner, addr1, addr2, addr3, addr4, addr5, addr6 };
  }

  it("Should call the correct transfer event", async function () {
    const { MSERC20Contract, owner, addr1 } = await loadFixture(deployMSERC20Fixture);
    const timeset = getTimestamp(8000);
    const addr1connect = MSERC20Contract.connect(addr1);
    await addr1connect.addNewRequest(owner.address, 10, timeset);
    await expect(MSERC20Contract.transfer(addr1.address, 10)).to.emit(MSERC20Contract, "Transfer").withArgs(owner.address, addr1.address, 10);
  });

  it("Should transfer between accounts", async function () {
    const { MSERC20Contract, owner, addr1 } = await loadFixture(deployMSERC20Fixture);
    const timeset = getTimestamp(8000);
    const addr1connect = MSERC20Contract.connect(addr1);
    await addr1connect.addNewRequest(owner.address, 10, timeset);
    await MSERC20Contract.transfer(addr1.address, 10);
    expect(await MSERC20Contract.balanceOf(owner.address)).to.be.equal(990);
    expect(await MSERC20Contract.balanceOf(addr1.address)).to.be.equal(10);
  });

  it("Should call the remove request after transfer", async function () {
    const { MSERC20Contract, owner, addr1 } = await loadFixture(deployMSERC20Fixture);
    const timeset = getTimestamp(8000);
    const addr1connect = MSERC20Contract.connect(addr1);
    await addr1connect.addNewRequest(owner.address, 10, timeset);
    await expect(MSERC20Contract.transfer(addr1.address, 10)).to.emit(MSERC20Contract, "RemoveRequest").withArgs(owner.address, addr1.address, owner.address);
  });

  it("Should fail if you try to transfer twice", async function () {
    const { MSERC20Contract, owner, addr1 } = await loadFixture(deployMSERC20Fixture);
    const timeset = getTimestamp(8000);
    const addr1connect = MSERC20Contract.connect(addr1);
    await addr1connect.addNewRequest(owner.address, 10, timeset);
    await MSERC20Contract.transfer(addr1.address, 10);
    await expect(MSERC20Contract.transfer(addr1.address, 10)).to.be.revertedWith("MSERC20: No request found");
  });

  it("Should call the remove request after expired found", async function () {
    const { MSERC20Contract, owner, addr1 } = await loadFixture(deployMSERC20Fixture);
    const timeset = getTimestamp(8000);
    const addr1connect = MSERC20Contract.connect(addr1);
    await addr1connect.addNewRequest(owner.address, 10, timeset);
    await time.increase(9000);
    await expect(MSERC20Contract.transfer(addr1.address, 10)).to.emit(MSERC20Contract, "RemoveRequest").withArgs(owner.address, addr1.address, owner.address).and.to.be.revertedWith("MSERC20: Request has expired");
  });

  it("Should fail correctly if request has expired", async function () {
    const { MSERC20Contract, owner, addr1 } = await loadFixture(deployMSERC20Fixture);
    const timeset = getTimestamp(8000);
    const addr1connect = MSERC20Contract.connect(addr1);
    await addr1connect.addNewRequest(owner.address, 10, timeset);
    await time.increase(9000);
    await expect(MSERC20Contract.transfer(addr1.address, 10)).to.be.revertedWith("MSERC20: Request has expired");
  });

  it("Should fail no request is present", async function () {
    const { MSERC20Contract, owner, addr1 } = await loadFixture(deployMSERC20Fixture);
    const timeset = getTimestamp(8000);
    const addr1connect = MSERC20Contract.connect(addr1);
    await expect(addr1connect.transfer(owner.address, 10)).to.be.revertedWith("MSERC20: No request found");
  });

  it("Should fail if request amounts do not match", async function () {
    const { MSERC20Contract, owner, addr1 } = await loadFixture(deployMSERC20Fixture);
    const timeset = getTimestamp(8000);
    const addr1connect = MSERC20Contract.connect(addr1);
    await addr1connect.addNewRequest(owner.address, 10, timeset);
    await expect(MSERC20Contract.transfer(addr1.address, 100)).to.be.revertedWith("MSERC20: Request amounts do not match");
  });

  it("Should fail if balance is not sufficient", async function () {
    const { MSERC20Contract, owner, addr1 } = await loadFixture(deployMSERC20Fixture);
    const timeset = getTimestamp(8000);
    const addr1connect = MSERC20Contract.connect(addr1);
    await addr1connect.addNewRequest(owner.address, 1001, timeset);
    await expect(MSERC20Contract.transfer(addr1.address, 1001)).to.be.revertedWith("MSERC20: transfer amount exceeds balance");
  });

  it("Should fail if the request expires", async function () {
    const { MSERC20Contract, owner, addr1 } = await loadFixture(deployMSERC20Fixture);
    const timeset = getTimestamp(800);
    const addr1connect = MSERC20Contract.connect(addr1);
    await addr1connect.addNewRequest(owner.address, 10, timeset);
    await time.increase(1000);
    await expect(MSERC20Contract.transfer(addr1.address, 10)).to.be.revertedWith("MSERC20: Request has expired");
  });
});

describe("Approval and allowance", function () {
  async function deployMSERC20Fixture() {
    const [owner, addr1, addr2, addr3, addr4, addr5, addr6] = await ethers.getSigners();
    const MSERC20 = await ethers.getContractFactory("MSERC20");
    const MSERC20Contract = await MSERC20.deploy("MSERC20TEST", "MSERC20TESTSYMBOL", "5", "1000");
    return { MSERC20Contract, owner, addr1, addr2, addr3, addr4, addr5, addr6 };
  }

  it("Should emit the correct event", async function () {
    const { MSERC20Contract, owner, addr1 } = await loadFixture(deployMSERC20Fixture);
    await expect(MSERC20Contract.approve(addr1.address, 10)).to.emit(MSERC20Contract, "Approval").withArgs(owner.address, addr1.address, 10);
  });

  it("Should set the allowance correctly", async function () {
    const { MSERC20Contract, owner, addr1 } = await loadFixture(deployMSERC20Fixture);
    await MSERC20Contract.approve(addr1.address, 10);
    expect(await MSERC20Contract.allowance(owner.address, addr1.address)).to.be.equal(10);
  });

  it("Should fail if not 0 innitially", async function () {
    const { MSERC20Contract, owner, addr1 } = await loadFixture(deployMSERC20Fixture);
    await MSERC20Contract.approve(addr1.address, 10);
    await expect(MSERC20Contract.approve(addr1.address, 10)).to.be.revertedWith("MSERC20: Amount must first be set to 0 before changing");
  });

  it("Should fail if one sets their own account allowance", async function () {
    const { MSERC20Contract, owner, addr1 } = await loadFixture(deployMSERC20Fixture);
    await expect(MSERC20Contract.approve(owner.address, 10)).to.be.revertedWith("MSERC20: Cannot set own allowance");
  });

  it("Should change if set to 0 first", async function () {
    const { MSERC20Contract, owner, addr1 } = await loadFixture(deployMSERC20Fixture);
    await MSERC20Contract.approve(addr1.address, 10);
    await MSERC20Contract.approve(addr1.address, 0);
    await MSERC20Contract.approve(addr1.address, 20);
    expect(await MSERC20Contract.allowance(owner.address, addr1.address)).to.be.equal(20);
  });
});

describe("Transfer from with approval", function () {
  async function deployMSERC20Fixture() {
    const [owner, addr1, addr2, addr3, addr4, addr5, addr6] = await ethers.getSigners();
    const MSERC20 = await ethers.getContractFactory("MSERC20");
    const MSERC20Contract = await MSERC20.deploy("MSERC20TEST", "MSERC20TESTSYMBOL", "5", "1000");
    return { MSERC20Contract, owner, addr1, addr2, addr3, addr4, addr5, addr6 };
  }

  it("Should emit the correct Transfer event", async function () {
    const { MSERC20Contract, owner, addr1, addr2 } = await loadFixture(deployMSERC20Fixture);
    const timeset = getTimestamp(8000);
    await MSERC20Contract.connect(addr2).addNewRequest(owner.address, 10, timeset);
    await MSERC20Contract.approve(addr1.address, 20);
    await expect(MSERC20Contract.connect(addr1).transferFrom(owner.address, addr2.address, 10)).to.emit(MSERC20Contract, "Transfer").withArgs(owner.address, addr2.address, 10);
  });

  it("Should emit the correct AllowanceTransfer event", async function () {
    const { MSERC20Contract, owner, addr1, addr2 } = await loadFixture(deployMSERC20Fixture);
    const timeset = getTimestamp(8000);
    await MSERC20Contract.connect(addr2).addNewRequest(owner.address, 10, timeset);
    await MSERC20Contract.approve(addr1.address, 20);
    await expect(MSERC20Contract.connect(addr1).transferFrom(owner.address, addr2.address, 10)).to.emit(MSERC20Contract, "AllowanceTransfer").withArgs(owner.address, addr1.address, addr2.address, 10);
  });

  it("Should transfer the correct amount", async function () {
    const { MSERC20Contract, owner, addr1, addr2 } = await loadFixture(deployMSERC20Fixture);
    const timeset = getTimestamp(8000);
    await MSERC20Contract.connect(addr2).addNewRequest(owner.address, 10, timeset);
    await MSERC20Contract.approve(addr1.address, 20);
    await MSERC20Contract.connect(addr1).transferFrom(owner.address, addr2.address, 10);
    expect(await MSERC20Contract.balanceOf(addr2.address)).to.be.equal(10);
    expect(await MSERC20Contract.balanceOf(owner.address)).to.be.equal(990);
  });

  it("Should decrease the allowance", async function () {
    const { MSERC20Contract, owner, addr1, addr2 } = await loadFixture(deployMSERC20Fixture);
    const timeset = getTimestamp(8000);
    await MSERC20Contract.connect(addr2).addNewRequest(owner.address, 10, timeset);
    await MSERC20Contract.approve(addr1.address, 20);
    await MSERC20Contract.connect(addr1).transferFrom(owner.address, addr2.address, 10);
    expect(await MSERC20Contract.allowance(owner.address, addr1.address)).to.be.equal(10);
  });

  it("Should fail if called from own account", async function () {
    const { MSERC20Contract, owner, addr1, addr2 } = await loadFixture(deployMSERC20Fixture);
    await expect(MSERC20Contract.transferFrom(owner.address, addr2.address, 10)).to.be.revertedWith("MSERC20: Incorrect method for transfer from own account, use `transfer` instead.");
  });

  it("Should fail if sender is not on allowance list", async function () {
    const { MSERC20Contract, owner, addr1, addr2 } = await loadFixture(deployMSERC20Fixture);
    const timeset = getTimestamp(8000);
    await MSERC20Contract.connect(addr2).addNewRequest(owner.address, 10, timeset);
    await expect(MSERC20Contract.connect(addr1).transferFrom(owner.address, addr2.address, 10)).to.be.revertedWith("MSERC20: Sender not on the allowanace list, Or approve is still pending");
  });

  it("Should fail if senders allowance is not high enough", async function () {
    const { MSERC20Contract, owner, addr1, addr2 } = await loadFixture(deployMSERC20Fixture);
    const timeset = getTimestamp(8000);
    await MSERC20Contract.approve(addr1.address, 5);
    await MSERC20Contract.connect(addr2).addNewRequest(owner.address, 10, timeset);
    await expect(MSERC20Contract.connect(addr1).transferFrom(owner.address, addr2.address, 10)).to.be.revertedWith("MSERC20: Sender's allowence is not high enough");
  });
});
