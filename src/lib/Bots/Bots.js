import React, { Component } from 'react';
import { ServerContext } from 'lib/ServerProvider/ServerProvider';
import store from 'store';

import Bot from './Bot';

const STORE_KEY_IDENTITIES = 'identities';
const IDENTITY_COUNT = 3;

class Bots extends Component {
  componentDidMount() {
    this.loadBots();
  }

  async loadBots() {
    const { loadAccounts } = this.props;
    const identities = store.get(STORE_KEY_IDENTITIES) || (await this.createAndStoreNewAccounts(IDENTITY_COUNT));
    loadAccounts(identities.map(({ publicKey }) => publicKey));
  }

  async createAndStoreNewAccounts(count) {
    const { createNewAccount } = this.props;
    const identities = await Promise.all(Array.from(Array(count)).map(() => createNewAccount()));
    store.set(STORE_KEY_IDENTITIES, identities);
    return identities;
  }

  render() {
    const { accounts = [] } = this.props;
    return accounts.map((account) => <Bot key={account.account_id} account={account} />);
  }
}

export default () => (
  <ServerContext.Consumer>
    {(serverContext) => (serverContext ? <Bots {...serverContext} /> : null)}
  </ServerContext.Consumer>
);
