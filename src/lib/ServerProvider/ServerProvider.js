import React, { Component } from 'react';
import createContext from 'create-react-context';
import store from 'store';

const STORE_KEY_IDENTITIES = 'identities';
const IDENTITY_COUNT = 3;

const mapServerStateToAccount = (serverAccount) => ({
  ...serverAccount,
  balance: Number(serverAccount.balances.find(({ asset_type }) => asset_type === 'native').balance),
});

export const ServerContext = createContext({});

class ServerProvider extends Component {
  state = { context: {} };

  async componentDidMount() {
    const sdk = window.StellarSdk;
    const server = new sdk.Server(process.env.REACT_APP_HORIZON_URL);
    this.setState({
      sdk,
      server,
    });
    this.loadAccounts(sdk, server);
  }

  async loadAccounts(sdk, server) {
    const identities = store.get(STORE_KEY_IDENTITIES) || (await this.createAndStoreNewAccounts(sdk, IDENTITY_COUNT));
    const serverAccounts = await Promise.all(identities.map(({ publicKey }) => server.loadAccount(publicKey)));
    this.setState({
      context: {
        accounts: serverAccounts.map(mapServerStateToAccount),
      },
    });
  }

  async createAndStoreNewAccounts(sdk, count) {
    const identities = await Promise.all(Array.from(Array(count)).map(() => this.createNewAccount(sdk)));
    store.set(STORE_KEY_IDENTITIES, identities);
    return identities;
  }

  async createNewAccount(sdk) {
    const keys = sdk.Keypair.random();
    await (await fetch(`${process.env.REACT_APP_HORIZON_URL}/friendbot?addr=${keys.publicKey()}`)).json();
    return {
      publicKey: keys.publicKey(),
      secret: keys.secret(),
    };
  }

  render() {
    return <ServerContext.Provider value={this.state.context}>{this.props.children}</ServerContext.Provider>;
  }
}

export default ServerProvider;
