import React, { Fragment } from 'react';

import { Provider as ThemeProvider, Relative, Absolute, Banner, Heading, Flex, Button, Text } from 'rebass';
import ServerProvider from 'lib/ServerProvider/ServerProvider';
import GameProvider, { GameContext } from 'lib/GameProvider/GameProvider';
import withDefinedContext from 'lib/withDefinedContext/withDefinedContext';

import RoundInfo from 'lib/RoundInfo/RoundInfo';
import Player from 'lib/Player/Player';
import Dealer from 'lib/Player/Dealer';
import Bots from 'lib/Bots/Bots';

const PLAYER_BOT_COUNT = 2;

const WithGameContext = withDefinedContext(GameContext);

const App = (props) => {
  return (
    <ThemeProvider>
      <ServerProvider>
        <GameProvider>
          <Bots playerCount={PLAYER_BOT_COUNT} />
          <Relative style={{ textAlign: 'center' }}>
            <Banner
              style={{ boxSizing: 'border-box', minHeight: '18vh' }}
              color="white"
              bg="gray8"
              backgroundImage="https://images.unsplash.com/photo-1515606378517-3451a4fa2e12?fit=crop&w=1800&q=80"
            >
              <Heading>Bots playing craps</Heading>
            </Banner>
            <Relative style={{ boxSizing: 'border-box', minHeight: '82vh', paddingBottom: 200 }}>
              <WithGameContext waitNode={<Text>Creating game...</Text>}>
                {({ roundStatus, isRoundActive, placeBets, stop, bets, dice, players, dealer, winners }) => (
                  <Fragment>
                    <Flex wrap justify="center">
                      {players &&
                        players
                          .sort((a, b) => (a.accountId > b.accountId ? 1 : -1))
                          .map((player) => (
                            <Player
                              key={player.accountId}
                              player={player}
                              bets={bets}
                              lastWin={winners && winners.find(({ accountId }) => accountId === player.accountId)}
                            />
                          ))}
                      {dealer && <Dealer player={dealer} />}
                    </Flex>

                    <Absolute style={{ bottom: 0, left: 0, right: 0, height: 200 }}>
                      <RoundInfo
                        isWaitingForBots={!dealer || players.length < PLAYER_BOT_COUNT}
                        roundStatus={roundStatus}
                        dice={dice}
                        dealer={dealer}
                        bets={bets}
                        winners={winners}
                      />
                      <Button
                        style={{ cursor: 'pointer' }}
                        m={10}
                        disabled={isRoundActive || !dealer || players.length < PLAYER_BOT_COUNT}
                        onClick={placeBets}
                      >
                        <Text fontSize={36} m={10} style={{ textTransform: 'uppercase' }}>
                          PLAY
                        </Text>
                      </Button>
                    </Absolute>
                  </Fragment>
                )}
              </WithGameContext>
            </Relative>
          </Relative>
        </GameProvider>
      </ServerProvider>
    </ThemeProvider>
  );
};

export default App;
