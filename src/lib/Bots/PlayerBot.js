import React, { Component } from 'react';
import { all as names } from 'dog-names';

import { ServerContext } from 'lib/ServerProvider/ServerProvider';
import { GameContext, STATE_IDLE, STATE_PLACING_BETS } from 'lib/GameProvider/GameProvider';

// @see http://erlycoder.com/49/javascript-hash-functions-to-convert-string-into-integer-hash-
const hashCode = (str) => {
  var hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

const randomInteger = (min, max) => min + Math.round(Math.random() * (max - min));
const think = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class PlayerBot extends Component {
  componentDidMount() {
    const { account: { accountId, balance } } = this.props;
    const { registerPlayer } = this.props.gameContext;
    registerPlayer(this.getName(), accountId, balance);
  }

  componentWillReceiveProps(nextProps) {
    const { gameContext: oldGameContext, account: oldAccount } = this.props;
    const { gameContext, account: { accountId, balance } } = nextProps;
    if (oldGameContext.roundStatus === STATE_IDLE && gameContext.roundStatus === STATE_PLACING_BETS) {
      this.thinkAndPlaceBet();
    }
    if (oldAccount.balance !== balance) {
      gameContext.updatePlayer(accountId, { balance });
    }
  }

  async thinkAndPlaceBet() {
    await think(randomInteger(500, 2100));
    const { gameContext, serverContext, account, identity, dealerAccountId } = this.props;
    const amount = randomInteger(0, Math.floor(account.balance / 3));
    if (!amount) return;
    const expectedTransactionMemo = gameContext.placeBet(account.accountId, amount, randomInteger(0, 100) > 50);
    if (expectedTransactionMemo) {
      const transaction = serverContext.makeTransaction(
        identity.publicKey,
        dealerAccountId,
        amount,
        expectedTransactionMemo,
        (transaction, sdk) => {
          const keys = sdk.Keypair.fromSecret(identity.secret);
          transaction.sign(keys);
        }
      );
      transaction.catch((err) => console.log('Transaction failed', err, amount));
    }
  }

  getName() {
    const { account: { accountId } } = this.props;
    return names[Math.abs(hashCode(accountId)) % names.length];
  }

  render() {
    return null;
  }
}

export default (props) => (
  <ServerContext.Consumer>
    {(serverContext) => (
      <GameContext.Consumer>
        {(gameContext) =>
          serverContext && gameContext ? (
            <PlayerBot serverContext={serverContext} gameContext={gameContext} {...props} />
          ) : null
        }
      </GameContext.Consumer>
    )})
  </ServerContext.Consumer>
);
