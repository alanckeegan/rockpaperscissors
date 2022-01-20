const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("RockPaperScissors", function () {
  const daiAddress = "0x6b175474e89094c44da98b954eedeac495271d0f";
  const betAmount = ethers.utils.parseEther('1')
  const FTX = '0x2faf487a4414fe77e2327f0bf4ae2a264a776ad2';

  let player1, player2;
  let player2Addr, player1Addr;
  let rockPaperScissors;


  const player1JoinsWithRock = async() => {

  }

  const player1JoinsWithPaper = async() => {
    
  }

  const player2JoinsWithRock = async() => {
    
  }

  const player1JoinsWithPaper = async() => {
    
  }

  const player1NoBet = async() => {
    
  }  

  const player1InvalidGameAction = async() => {

  }
  
  before(async () => {
    player1 = await ethers.provider.getSigner(0);
    player2 = await ethers.provider.getSigner(1);
    player1Addr = await player1.getAddress()
    player2Addr = await player2.getAddress()

    // Impersonate FTX
    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [FTX]
    })
    FTXSigner = await ethers.provider.getSigner(FTX);
   
    // Steal 5 Dai from FTX
    
    dai = await ethers.getContractAt("IERC20", daiAddress);
    await dai.connect(FTXSigner).transfer(await player1Addr, ethers.utils.parseEther('5'))
    await dai.connect(FTXSigner).transfer(await player2Addr, ethers.utils.parseEther('5'))

    // Deploy contract

    const RockPaperScissors = await ethers.getContractFactory("RockPaperScissors");
    rockPaperScissors = await RockPaperScissors.deploy(daiAddress, betAmount);
    await rockPaperScissors.deployed();
});

  it("Players should have DAI", async function () {
    // const signer = await ethers.provider.getSigner(0);
    // signerAddr = await signer.getAddress();
    const p1DaiBalance = parseInt(ethers.utils.formatEther(await dai.balanceOf(player1Addr)));
    const p2DaiBalance = parseInt(ethers.utils.formatEther(await dai.balanceOf(player2Addr)));

    console.log(`${p1DaiBalance} Dai in p1 wallet`)
    console.log(`${p2DaiBalance} Dai in p2 wallet`)
    
    assert.isAbove(p1DaiBalance, 0)
    assert.isAbove(p2DaiBalance, 0)
  })
});
