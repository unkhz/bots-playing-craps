import React, { Component, Fragment } from 'react';
import { ServerContext } from 'lib/ServerProvider/ServerProvider';
import store from 'store';

import PlayerBot from './PlayerBot';
import DealerBot from './DealerBot';

const STORE_KEY_PLAYER_BOTS = 'players';
const STORE_KEY_DEALER_BOT = 'dealer';
const PLAYER_BOT_COUNT = 3;

class Bots extends Component {
  state = {};

  componentDidMount() {
    this.loadBots();
  }

  async loadBots() {
    const { loadAccounts } = this.props;
    const playerIdentities =
      store.get(STORE_KEY_PLAYER_BOTS) || (await this.createAndStoreNewPlayerAccounts(PLAYER_BOT_COUNT));
    const dealerIdentity = store.get(STORE_KEY_DEALER_BOT) || (await this.createAndStoreNewDealerAccount());
    this.setState({ playerIdentities, dealerIdentity });
    loadAccounts([dealerIdentity.publicKey].concat(playerIdentities.map(({ publicKey }) => publicKey)));
  }

  async createAndStoreNewPlayerAccounts(count) {
    const { createNewAccount } = this.props;
    const playerIdentities = await Promise.all(Array.from(Array(count)).map(() => createNewAccount()));
    store.set(STORE_KEY_PLAYER_BOTS, playerIdentities);
    return playerIdentities;
  }

  async createAndStoreNewDealerAccount(count) {
    const { createNewAccount } = this.props;
    const dealerIdentity = await createNewAccount();
    store.set(STORE_KEY_DEALER_BOT, dealerIdentity);
    return dealerIdentity;
  }

  render() {
    const { accounts = [] } = this.props;
    const { dealerIdentity, playerIdentities = [] } = this.state;
    const dealerAccount = accounts.find(({ account_id }) => account_id === dealerIdentity.publicKey);
    const playerAccounts = playerIdentities.map(({ publicKey }) =>
      accounts.find(({ account_id }) => account_id === publicKey)
    );
    if (!dealerAccount) return null;
    return (
      <Fragment>
        <DealerBot account={dealerAccount} />
        {playerAccounts.map((account) => (
          <PlayerBot key={account.account_id} account={account} dealerAccount={dealerAccount} />
        ))}
      </Fragment>
    );
  }
}

export default () => (
  <ServerContext.Consumer>
    {(serverContext) => (serverContext ? <Bots {...serverContext} /> : null)}
  </ServerContext.Consumer>
);
