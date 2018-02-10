import React, { Component } from 'react';
import { all as names } from 'dog-names';

import { ServerContext } from 'lib/ServerProvider/ServerProvider';
import { GameContext } from 'lib/GameProvider/GameProvider';

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

class Bot extends Component {
  componentDidMount() {
    const { account: { account_id, balance } } = this.props;
    const { registerPlayer } = this.props.gameContext;
    const name = names[Math.abs(hashCode(account_id)) % names.length];
    registerPlayer(name, account_id, balance);
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
            <Bot serverContext={serverContext} gameContext={gameContext} {...props} />
          ) : null
        }
      </GameContext.Consumer>
    )})
  </ServerContext.Consumer>
);
