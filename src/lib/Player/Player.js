import React from 'react';
import { Panel, PanelHeader, PanelFooter, BackgroundImage, Subhead, Code, Text, NavLink } from 'rebass';

const Player = ({ player, bets, lastWin }) => {
  const bet = bets.find(({ accountId }) => accountId === player.accountId);
  const actualUrl = `${process.env.REACT_APP_IDENTITY_BASE_URL}/${player.accountId}`;
  const derefereredUrl = `http://www.dereferer.org/?${encodeURIComponent(actualUrl)}`;
  return (
    <Panel width="100%">
      <PanelHeader>
        <NavLink href={derefereredUrl}>
          <Code style={{ whiteSpace: 'pre', fontSize: 6 }}>{player.accountId.match(/.{1,28}/g).join('\n')}</Code>
        </NavLink>
      </PanelHeader>
      <BackgroundImage ratio={2 / 3} src={`https://robohash.org/${player.accountId}.png`} style={{ height: '3vh' }} />

      <Subhead m={1}>{player.name}</Subhead>
      <Text fontSize={14} m={1}>
        ~ {Math.round(player.balance)} XLM
      </Text>
      <PanelFooter style={{ lineHeight: '32px' }}>
        {bet ? (
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
        )}
      </PanelFooter>
    </Panel>
  );
};
export default Player;
