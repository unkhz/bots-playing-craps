import React from 'react';
import {
  Absolute,
  Relative,
  Box,
  Panel,
  PanelHeader,
  PanelFooter,
  BackgroundImage,
  Subhead,
  Code,
  Text,
  NavLink,
} from 'rebass';

const Participant = ({ player, bets, lastWin, footer }) => {
  const actualUrl = `${process.env.REACT_APP_IDENTITY_BASE_URL}/${player.accountId}`;
  const derefereredUrl = `http://www.dereferer.org/?${encodeURIComponent(actualUrl)}`;
  return (
    <Box w={1 / 4} m={2} flex="1 1 auto" style={{ minWidth: 50, maxWidth: 150 }}>
      <Panel width="100%">
        <PanelHeader p={0}>
          <NavLink p={1} href={derefereredUrl}>
            <Code style={{ whiteSpace: 'pre', fontSize: 6 }}>{player.accountId.match(/.{1,14}/g).join('\n')}</Code>
          </NavLink>
        </PanelHeader>
        <Relative>
          <Absolute style={{ width: '100%' }}>
            <Subhead m={1} style={{ textShadow: '0 0 10px #ffffff, 0 0 6px #ffffff, 0 0 3px #ffffff' }}>
              {player.name}
            </Subhead>
          </Absolute>
          <BackgroundImage
            ratio={2 / 3}
            src={`https://robohash.org/${player.accountId}.png`}
            style={{ height: '3vh' }}
          />
          <Text fontSize={14} m={1}>
            ~ {Math.round(player.balance)} XLM
          </Text>
        </Relative>
        <PanelFooter style={{ minHeight: '36px' }}>{footer}</PanelFooter>
      </Panel>
    </Box>
  );
};
export default Participant;
