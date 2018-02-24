import React from 'react';
import { Text } from 'rebass';
import { RollResult } from 'lib/Common/Common';
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
            <RollResult pass={bet.betOnPass}>{bet.betOnPass ? 'pass' : 'fail'}</RollResult>
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
