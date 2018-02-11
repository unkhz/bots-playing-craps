import React, { Component } from 'react';
import { all as names } from 'dog-names';

import { ServerContext } from 'lib/ServerProvider/ServerProvider';
import { GameContext, STATE_DECIDING_WINS, STATE_COLLECTING_WINS } from 'lib/GameProvider/GameProvider';

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

class DealerBot extends Component {
  componentDidMount() {
    const { account: { account_id, balance } } = this.props;
    const { registerDealer } = this.props.gameContext;
    registerDealer(this.getName(), account_id, balance);
  }

  componentWillReceiveProps(nextProps) {
    const { gameContext: oldGameContext, account: oldAccount } = this.props;
    const { gameContext, account: { accountId, balance } } = nextProps;
    if (oldGameContext.roundStatus === STATE_DECIDING_WINS && gameContext.roundStatus === STATE_COLLECTING_WINS) {
      this.payWinners();
    }
    if (oldAccount.balance !== balance) {
      gameContext.updateDealer(accountId, { balance });
    }
  }

  async payWinners() {
    const { gameContext: { winners }, serverContext, identity } = this.props;
    const payments = [...winners];
    while (payments.length > 0) {
      const { accountId, expectedTransactionMemo, amount, name } = payments.pop();
      console.log(`${this.getName()} pays ${amount} XLM to ${name}`);
      await serverContext.makeTransaction(
        identity.publicKey,
        accountId,
        amount,
        expectedTransactionMemo,
        (transaction, sdk) => {
          const keys = sdk.Keypair.fromSecret(identity.secret);
          transaction.sign(keys);
        }
      );
    }
  }

  getName() {
    const { account: { account_id } } = this.props;
    return names[Math.abs(hashCode(account_id)) % names.length];
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
            <DealerBot serverContext={serverContext} gameContext={gameContext} {...props} />
          ) : null
        }
      </GameContext.Consumer>
    )})
  </ServerContext.Consumer>
);
