import React from "react";

import { Provider as ThemeProvider, Banner, Heading, Flex, Box } from "rebass";
import ServerProvider from "lib/ServerProvider/ServerProvider";
import Player from "lib/Player/Player";

import "./App.css";

const App = props => {
  return (
    <ThemeProvider>
      <ServerProvider
        render={({ accounts }) => (
          <div className="App">
            <Banner
              style={{ minHeight: "20vh" }}
              color="white"
              bg="gray8"
              backgroundImage="https://images.unsplash.com/photo-1515606378517-3451a4fa2e12?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=cb830c394f6c9d7275b1662668f291dd&auto=format&fit=crop&w=800&q=80"
            >
              <Heading>Bots playing craps</Heading>
            </Banner>
            <Flex wrap justify="center">
              {accounts &&
                accounts.map(account => (
                  <Box
                    key={account.account_id}
                    w={1 / 4}
                    m={2}
                    flex="1 1 auto"
                    style={{ minWidth: 175, maxWidth: 300 }}
                  >
                    <Player account={account} />
                  </Box>
                ))}
            </Flex>
          </div>
        )}
      />
    </ThemeProvider>
  );
};

export default App;
