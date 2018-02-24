import React, { Fragment as X } from 'react';
import { Text } from 'rebass';
import { Strong } from 'lib/Common/Common';
import {
  STATE_IDLE,
  STATE_PLACING_BETS,
  STATE_WAITING_FOR_TRANSACTIONS,
  STATE_ROLLING,
  STATE_REROLLING,
  STATE_DECIDING_WINS,
  STATE_COLLECTING_WINS,
} from 'lib/GameProvider/GameProvider';

const delimiterByItemsLeft = { 0: ' ', 1: ' and ' };
const names = (list) => {
  const names = list.map(({ name }) => name);
  return (
    <X>
      {names.map((name, i) => (
        <X key={i}>
          <b style={{ fontSize: '16px' }}>{name}</b>
          {delimiterByItemsLeft[names.length - i - 1] || ', '}
        </X>
      ))}
    </X>
  );
};

const dice = ([first, second]) => {
  return (
    <X>
      <Strong>{first}</Strong> and <Strong>{second}</Strong>
    </X>
  );
};

const texts = {
  [STATE_IDLE]: (props) => '...',
  [STATE_PLACING_BETS]: (props) => (props.bets.length ? <X>{names(props.bets)} joined in</X> : 'Waiting for bets'),
  [STATE_WAITING_FOR_TRANSACTIONS]: (props) =>
    props.bets.length ? <X>{names(props.bets)} in, confirming XLM transactions</X> : 'no bets',
  [STATE_ROLLING]: (props) => (props.dice.length ? <X>Rolled {dice(props.dice)}</X> : 'Rolling...'),
  [STATE_REROLLING]: (props) => (props.dice.length ? <X>Rolled {dice(props.dice)}</X> : 'Rolling...'),
  [STATE_DECIDING_WINS]: (props) => (props.winners.length ? <X>{names(props.winners)} won</X> : '...'),
  [STATE_COLLECTING_WINS]: (props) =>
    props.winners.length ? <X>{names(props.winners)} won, confirming XLM transactions</X> : 'no winners this round',
};

export default function(props) {
  const { roundStatus, players, dealer, playerCount } = props;
  const textFactory = texts[roundStatus] || texts[STATE_IDLE];
  const botCount = (dealer ? 1 : 0) + players.length;
  const waitCount = playerCount + 1 - botCount;
  return (
    <X>
      <Text m={10} style={{ minHeight: '48px' }}>
        {waitCount > 0
          ? `Conjuring ${waitCount <= playerCount ? `${waitCount} more` : 'some'} bot${waitCount > 1 ? 's' : ''}...`
          : textFactory(props)}
      </Text>
    </X>
  );
}
