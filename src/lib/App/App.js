import React from 'react';

import { Provider as ThemeProvider, Relative, Banner, Heading, Flex, Box, Button, Text } from 'rebass';
import ServerProvider from 'lib/ServerProvider/ServerProvider';
import Player from 'lib/Player/Player';

const App = (props) => {
  return (
    <ThemeProvider>
      <ServerProvider
        render={({ accounts, roundStatus, isRoundActive, placeBets, bets }) => (
          <Relative style={{ textAlign: 'center' }}>
            <Banner
              style={{ minHeight: '20vh' }}
              color="white"
              bg="gray8"
              backgroundImage="https://images.unsplash.com/photo-1515606378517-3451a4fa2e12?fit=crop&w=1800&q=80"
            >
              <Heading>Bots playing craps</Heading>
            </Banner>
            <Flex wrap justify="center">
              {accounts &&
                accounts.map((account) => (
                  <Box
                    key={account.account_id}
                    w={1 / 4}
                    m={3}
                    flex="1 1 auto"
                    style={{ minWidth: 200, maxWidth: 300 }}
                  >
                    <Player account={account} bets={bets} />
                  </Box>
                ))}
            </Flex>

            <Heading>{roundStatus}</Heading>
            <Text fontSize={14} m={10}>
              Pot: {bets ? bets.reduce((sum, { amount }) => sum + amount, 0) : 0} XLM
            </Text>
            <Button style={{ cursor: 'pointer' }} m={10} disabled={isRoundActive} onClick={placeBets}>
              <Text fontSize={36} m={10} style={{ textTransform: 'uppercase' }}>
                Play
              </Text>
            </Button>
          </Relative>
        )}
      />
    </ThemeProvider>
  );
};

export default App;
