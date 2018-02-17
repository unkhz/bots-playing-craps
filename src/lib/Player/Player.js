import React from 'react';
import { Text, Badge } from 'rebass';

import Participant from './Participant';

const Player = (props) => {
  const { player, bets, lastWin } = props;
  const bet = bets.find(({ accountId }) => accountId === player.accountId);
  return (
    <Participant
      panelBackgroundColor="rgb(250,255,255)"
      {...props}
      footer={
        bet ? (
          <Text>
            <b>{Math.round(bet.amount)}</b> on{' '}
            <Badge
              color={bet.betOnPass ? 'black' : 'white'}
              bg={bet.betOnPass ? 'white' : 'black'}
              style={{
                border: '1px solid black',
                textTransform: 'uppercase',
                fontSize: '8px',
              }}
            >
              {bet.betOnPass ? 'pass' : 'fail'}
            </Badge>
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
