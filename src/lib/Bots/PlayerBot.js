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
    const { account: { account_id, balance } } = this.props;
    const { registerPlayer } = this.props.gameContext;
    registerPlayer(this.getName(), account_id, balance);
  }

  componentWillReceiveProps(nextProps) {
    const { gameContext: oldGameContext } = this.props;
    const { gameContext } = nextProps;
    if (oldGameContext.roundStatus === STATE_IDLE && gameContext.roundStatus === STATE_PLACING_BETS) {
      this.thinkAndPlaceBet();
    }
  }

  async thinkAndPlaceBet() {
    await think(randomInteger(1000, 5000));
    const { gameContext, account } = this.props;
    gameContext.placeBet(account.account_id, randomInteger(0, account.balance / 2), randomInteger(0, 100) > 50);
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
            <PlayerBot serverContext={serverContext} gameContext={gameContext} {...props} />
          ) : null
        }
      </GameContext.Consumer>
    )})
  </ServerContext.Consumer>
);
