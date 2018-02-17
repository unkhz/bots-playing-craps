import React, { Component, Fragment } from 'react';
import { ServerContext } from 'lib/ServerProvider/ServerProvider';
import store from 'store';

import PlayerBot from './PlayerBot';
import DealerBot from './DealerBot';

const STORE_KEY_PLAYER_BOTS = 'players';
const STORE_KEY_DEALER_BOT = 'dealer';

class Bots extends Component {
  state = {};

  componentDidMount() {
    this.loadBots();
  }

  async loadBots() {
    const { loadAccounts } = this.props;
    const dealerIdentity = store.get(STORE_KEY_DEALER_BOT) || (await this.createAndStoreNewDealerAccount());
    const playerIdentities =
      store.get(STORE_KEY_PLAYER_BOTS) || (await this.createAndStoreNewPlayerAccounts(this.props.playerCount));
    this.setState({ playerIdentities, dealerIdentity });
    loadAccounts([dealerIdentity.publicKey].concat(playerIdentities.map(({ publicKey }) => publicKey)));
  }

  async createAndStoreNewPlayerAccounts(count) {
    const { createNewAccount, loadAndUpdateAccount } = this.props;
    let playerIdentities = [];
    while (playerIdentities.length < this.props.playerCount) {
      const id = await createNewAccount();
      if (id) {
        playerIdentities.push(id);
        this.setState({ playerIdentities });
        loadAndUpdateAccount(id.publicKey);
      }
    }
    store.set(STORE_KEY_PLAYER_BOTS, playerIdentities);
    return playerIdentities;
  }

  async createAndStoreNewDealerAccount(count) {
    const { createNewAccount, loadAndUpdateAccount } = this.props;
    let dealerIdentity;
    while (!dealerIdentity) {
      dealerIdentity = await createNewAccount();
    }
    loadAndUpdateAccount(dealerIdentity.publicKey);
    this.setState({ dealerIdentity });
    store.set(STORE_KEY_DEALER_BOT, dealerIdentity);
    return dealerIdentity;
  }

  render() {
    const { accounts = [] } = this.props;
    const { dealerIdentity, playerIdentities = [] } = this.state;
    const dealerAccount = dealerIdentity && accounts.find(({ accountId }) => accountId === dealerIdentity.publicKey);
    const playerAccounts = playerIdentities
      .map((identity) => [identity, accounts.find(({ accountId }) => accountId === identity.publicKey)])
      .filter(([identity, account]) => account);
    return (
      <Fragment>
        {dealerAccount && <DealerBot account={dealerAccount} identity={dealerIdentity} />}
        {playerAccounts.map(([identity, account]) => (
          <PlayerBot
            key={identity.publicKey}
            identity={identity}
            account={account}
            dealerAccountId={dealerIdentity.publicKey}
          />
        ))}
      </Fragment>
    );
  }
}

export default (props) => (
  <ServerContext.Consumer>
    {(serverContext) => (serverContext ? <Bots {...serverContext} {...props} /> : null)}
  </ServerContext.Consumer>
);
