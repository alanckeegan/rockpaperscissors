//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RockPaperScissors {
    IERC20 public gameCurrency;
    uint public betAmount;
    Player[] public players;
    struct Player {
        // I know using int instead of uint looks weird, but it will make sense when I determineWinner()
        address playerAddress;
        int gameAction;
    }

    // Construtor function sets what currency can be bet at deployment
    // And what the bet amount is (went with a fixed bet amount)
    constructor(address _gameCurrencyAddress, uint _betAmount) {
        gameCurrency = IERC20(_gameCurrencyAddress);
        betAmount = _betAmount;
    }

    // Going to do single function to join, bet, and play 
    // Realistically very cheatable...second player could see first player's move on chain
    function joinAndPlay(int _gameAction) external {

        // Make sure there aren't already two players
        // Shouldn't ever happen but dunno, maybe a transaction could get stuck?
        require(players.length < 2, "Game is full, wait for current players to finish");

        // Make sure person didn't hit join twice and try to play themselves
        if(players.length == 1){
            require(players[0].playerAddress != msg.sender, "You're already in the game");
        }

        // Require bet
        require(gameCurrency.transferFrom(msg.sender, address(this), betAmount), 'Did not receive wager');

        // Require valid gameAction (0, 1, 2) for ('rock', 'paper', 'scissors')
        require(_gameAction == 0 || _gameAction == 1 || _gameAction == 2, 'Invalid game action');

        players.push(Player(msg.sender, _gameAction));

        if (players.length == 2) { 
            determineWinner(); 
        }
    }




    // Determine winner with subtraciton
    // Revert if any payouts fail
    function determineWinner() internal {
        int diff =  players[0].gameAction - players[1].gameAction;

        // Split pot on tie
        // Revert if any transfers fail
        if (diff == 0) {
            require(gameCurrency.transfer(players[0].playerAddress, betAmount), 'Failed to pay Player 1 split pot');
            require(gameCurrency.transfer(players[1].playerAddress, betAmount), 'Failed to pay Player 2 split pot');
        } else if (diff == 1 || diff == -2) {
            require(gameCurrency.transfer(players[0].playerAddress, gameCurrency.balanceOf(address(this))), 'Payout failed');
        } else {
            require(gameCurrency.transfer(players[1].playerAddress, gameCurrency.balanceOf(address(this))), 'Payout failed');
        }

        // reset game
        delete players;
    }


}
