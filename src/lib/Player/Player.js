import React from 'react';
import { Panel, PanelHeader, PanelFooter, BackgroundImage, Subhead, Code, Text, NavLink } from 'rebass';

const Player = ({ player, bets, lastWin }) => {
  const bet = bets.find(({ playerId }) => playerId === player.playerId);
  const actualUrl = `${process.env.REACT_APP_IDENTITY_BASE_URL}/${player.playerId}`;
  const derefereredUrl = `http://www.dereferer.org/?${encodeURIComponent(actualUrl)}`;
  return (
    <Panel width="100%">
      <PanelHeader>
        <NavLink href={derefereredUrl}>
          <Code style={{ whiteSpace: 'pre', fontSize: 10 }}>{player.playerId.match(/.{1,28}/g).join('\n')}</Code>
        </NavLink>
      </PanelHeader>
      <BackgroundImage ratio={2 / 3} src={`https://robohash.org/${player.playerId}.png`} style={{ height: '5vh' }} />

      <Subhead m={1}>{player.name}</Subhead>
      <Text fontSize={14} m={1}>
        {Number(player.balance)} XLM
      </Text>
      <PanelFooter>
        {bet ? (
          <Text>
            Bet ~{' '}
            <b>
              {Math.round(bet.amount)} XLM, {bet.betOnPass ? 'pass' : 'not pass'}
            </b>
          </Text>
        ) : (
          <Text>...</Text>
        )}

        {lastWin ? (
          <Text>
            Won ~ <b>{Math.round(lastWin.win)} XLM</b>
          </Text>
        ) : (
          <Text>...</Text>
        )}
      </PanelFooter>
    </Panel>
  );
};

export default Player;
