import React, { Fragment } from 'react';

import { Provider as ThemeProvider, Relative, Absolute, Banner, Heading, Flex, Button, Text } from 'rebass';

import Share from '../Share/Share';
import Intro from '../Intro/Intro';
import ServerProvider from '../ServerProvider/ServerProvider';
import GameProvider, { GameContext } from '../GameProvider/GameProvider';
import withDefinedContext from '../withDefinedContext/withDefinedContext';

import RoundInfo from '../RoundInfo/RoundInfo';
import Player from '../Player/Player';
import Dealer from '../Player/Dealer';
import Bots from '../Bots/Bots';

import './App.css';

const PLAYER_BOT_COUNT = 5;

const WithGameContext = withDefinedContext(GameContext);

const App = (props) => {
  return (
    <ThemeProvider
      theme={{
        fonts: {
          sans: 'Athiti, sans-serif',
          cursive: "'Indie Flower', cursive",
          mono: "'Andale Mono', monospace",
        },
      }}
    >
      <Relative style={{ textAlign: 'center' }}>
        <Banner
          className="banner"
          color="white"
          backgroundImage="https://images.unsplash.com/photo-1515606378517-3451a4fa2e12?fit=crop&w=1800&q=80"
          style={{ textShadow: '0 0 6px #000000' }}
        >
          <Share />
          <Heading>Bots playing craps</Heading>
          <Text className="subheading" m={2} style={{ lineHeight: 1.2 }}>
            some bots making random transactions on Stellar Lumens testnet blockchain
          </Text>
        </Banner>
        <Relative
          style={{
            boxSizing: 'border-box',
            minHeight: '82vh',
            paddingBottom: 200,
            maxWidth: '850px',
            margin: '0 auto',
          }}
        >
          <Intro>
            <ServerProvider>
              <GameProvider>
                <Bots playerCount={PLAYER_BOT_COUNT} />
                <WithGameContext waitNode={<Text>Creating game...</Text>}>
                  {({ roundStatus, isRoundActive, placeBets, stop, bets, dice, players, dealer, winners }) => (
                    <Fragment>
                      <Flex flexWrap="wrap" justifyContent="center">
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
                          roundStatus={roundStatus}
                          playerCount={PLAYER_BOT_COUNT}
                          dice={dice}
                          dealer={dealer}
                          players={players}
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
              </GameProvider>
            </ServerProvider>
          </Intro>
        </Relative>
      </Relative>
    </ThemeProvider>
  );
};

export default App;
