import React from 'react';
import { Text } from 'rebass';

import Participant from './Participant';

const Player = (props) => {
  const { player, bets, lastWin } = props;
  const bet = bets.find(({ accountId }) => accountId === player.accountId);
  return (
    <Participant
      {...props}
      footer={
        bet ? (
          <Text>
            <b>{Math.round(bet.amount)}</b> XLM for{' '}
            <span style={{ fontSize: '24px', display: 'inline' }}>
              <span role="img">{bet.betOnPass ? '👍' : '👎'}</span>
            </span>
          </Text>
        ) : lastWin ? (
          <Text>
            Won ~ <b>{Math.round(lastWin.win)} XLM</b>
          </Text>
        ) : (
          <Text>...</Text>
        )
      }
    />
  );
};
export default Player;
