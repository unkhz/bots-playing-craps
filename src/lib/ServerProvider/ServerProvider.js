import React, { Component } from 'react';
import createContext from 'create-react-context';
import invariant from 'invariant';

const mapServerStateToAccount = (serverAccount) => ({
  ...serverAccount,
  balance: Number(serverAccount.balances.find(({ asset_type }) => asset_type === 'native').balance),
});

export const ServerContext = createContext();

class ServerProvider extends Component {
  state = {};

  async componentDidMount() {
    const sdk = window.StellarSdk;
    const server = new sdk.Server(process.env.REACT_APP_HORIZON_URL);
    this.setState(
      {
        sdk,
        server,
      },
      () => this.setContext({ isInitialized: true })
    );
  }

  loadAccounts = async (publicKeys = []) => {
    invariant(this.state.sdk, 'ServerProvider not initialized yet');
    const { server } = this.state;
    const serverAccounts = await Promise.all(publicKeys.map((publicKey) => server.loadAccount(publicKey)));
    this.setContext({
      accounts: serverAccounts.map(mapServerStateToAccount),
    });
  };

  createNewAccount = async () => {
    invariant(this.state.sdk, 'ServerProvider not initialized yet');
    const keys = this.state.sdk.Keypair.random();
    await (await fetch(`${process.env.REACT_APP_HORIZON_URL}/friendbot?addr=${keys.publicKey()}`)).json();
    return {
      publicKey: keys.publicKey(),
      secret: keys.secret(),
    };
  };

  setContext(newContext) {
    const context = {
      ...this.state.context,
      ...newContext,
      loadAccounts: this.loadAccounts,
      createNewAccount: this.createNewAccount,
    };
    this.setState({ context });
  }

  render() {
    return <ServerContext.Provider value={this.state.context}>{this.props.children}</ServerContext.Provider>;
  }
}

export default ServerProvider;
