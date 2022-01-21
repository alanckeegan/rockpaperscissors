const { EtherscanProvider } = require("@ethersproject/providers");
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
    await dai.connect(player1).approve(rockPaperScissors.address, ethers.utils.parseEther('1'))
    await rockPaperScissors.connect(player1).joinAndPlay(0);
  }

  const player1JoinsWithPaper = async() => {
    await dai.connect(player1).approve(rockPaperScissors.address, ethers.utils.parseEther('1'))
    await rockPaperScissors.connect(player1).joinAndPlay(1)
  }

  const player1JoinsWithInvalidAction = async() => {
    await dai.connect(player1).approve(rockPaperScissors.address, ethers.utils.parseEther('1'))
    await rockPaperScissors.connect(player1).joinAndPlay(4);
  }

  const player2JoinsWithRock = async() => {
    await dai.connect(player2).approve(rockPaperScissors.address, ethers.utils.parseEther('1'))
    await rockPaperScissors.connect(player2).joinAndPlay(0)
  }

  const player2JoinsWithScissors = async() => {
    await dai.connect(player2).approve(rockPaperScissors.address, ethers.utils.parseEther('1'))
    await rockPaperScissors.connect(player2).joinAndPlay(2)
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

  describe ('joinAndPlay()', () =>{

    describe('Dai transfer not approved', () => {

      it("Should throw revert error on method call", async () => {
        try {
          await rockPaperScissors.connect(player1).joinAndPlay(0);
        } catch (e) {
          assert.include(e.message, "revert");
          return;
        }
        assert.isOk(false);
      });

      it("Should not save player or move", async () => {
        try {
          await strip.connect(user).mint(1);
        } catch (e) { 
          // carry on execution
        }

        const playersLength = await rockPaperScissors.players.length;
        assert.strictEqual(playersLength, 0);
      });

    });

    describe('Valid joining method call', () => {

      it("Should transfer Dai", async () => {
        const p1StartingDai = await dai.balanceOf(player1Addr)
        await player1JoinsWithRock();
        assert.strictEqual(await dai.balanceOf(rockPaperScissors.address), ethers.utils.parseEther('1'));
      });

      it("Should throw error if p1 joins twice (even if valid)", async () =>  {
        try {
          await player1JoinsWithRock();
        } catch (e) {
          assert.include(e.message, "revert");
          return;
        }
        assert.isOk(false);
      })

      it("Should have a struct for p1 entry", async () =>  {
        playerStruct = await rockPaperScissors.players(0)
        structAddr = playerStruct.playerAddress
        gameAction = playerStruct.gameAction

        assert.strictEqual(player1Addr, structAddr)
        assert.strictEqual(0, gameAction)
      })

    })

    describe('Join with invalid game action', () => {


      it("Should throw error", async () =>  {
        try {
          await player1JoinsWithInvalidAction();
        } catch (e) {
          assert.include(e.message, "revert");
          return;
        }
        assert.isOk(false);
      })

    })

    describe('When second player joins', () => {

      it("Rock beats scissors!", async () => {
        const p1StartingDai = await dai.balanceOf(player1Addr)
       
        await player2JoinsWithScissors();
        assert.strictEqual(await dai.balanceOf(player1Addr), BigInt(p1StartingDai) + BigInt(ethers.utils.parseEther('2')));
      });

      it('Should have reset', async() => {
        try{
          await rockPaperScissors.players(0)
        } catch(e) {
          assert.include(e.message, 'revert')
          return
        }
        assert.isOk(false)
      }) 
      
      it ('Should have emptied contract', async() => {
        assert.strictEqual(await dai.balanceOf(rockPaperScissors.address), 0)
      })

      it("Paper beats Rock!", async () => {
        const p1StartingDai = await dai.balanceOf(player1Addr)
        await player1JoinsWithPaper();
        await player2JoinsWithRock();
        assert.strictEqual(await dai.balanceOf(player1Addr), BigInt(p1StartingDai) + BigInt(ethers.utils.parseEther('1')));
      });

      it("Scissors beats paper!", async () => {
        const p2StartingDai = await dai.balanceOf(player2Addr)
        await player1JoinsWithPaper();
        await player2JoinsWithScissors();
        assert.strictEqual(await dai.balanceOf(player2Addr), BigInt(p2StartingDai) + BigInt(ethers.utils.parseEther('1')));
      });

      it("Tie splits pot!", async () => {
        const p2StartingDai = await dai.balanceOf(player2Addr)
        const p1StartingDai = await dai.balanceOf(player1Addr)
        await player1JoinsWithRock();
        await player2JoinsWithRock();
        assert.strictEqual(await dai.balanceOf(player2Addr), p2StartingDai);
        assert.strictEqual(await dai.balanceOf(player1Addr), p1StartingDai);
      });

    })



    
  })
})