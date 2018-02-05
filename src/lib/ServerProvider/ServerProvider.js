import { Component } from "react";
import invariant from "invariant";
import store from "store";

const STORE_KEY_IDENTITIES = "identities";
const IDENTITY_COUNT = 3;

class ServerProvider extends Component {
  async componentDidMount() {
    const sdk = window.StellarSdk;
    const server = new sdk.Server(process.env.REACT_APP_HORIZON_URL);
    const identities =
      store.get(STORE_KEY_IDENTITIES) ||
      (await this.createAndStoreNewAccounts(sdk, IDENTITY_COUNT));
    const accounts = await Promise.all(
      identities.map(({ publicKey }) => server.loadAccount(publicKey))
    );
    this.setState({ accounts, sdk, server });
  }

  async createAndStoreNewAccounts(sdk, count) {
    const identities = await Promise.all(
      Array.from(Array(count)).map(() => this.createNewAccount(sdk))
    );
    store.set(STORE_KEY_IDENTITIES, identities);
    return identities;
  }

  async createNewAccount(sdk) {
    const keys = sdk.Keypair.random();
    await (await fetch(
      `${process.env.REACT_APP_HORIZON_URL}/friendbot?addr=${keys.publicKey()}`
    )).json();
    return {
      publicKey: keys.publicKey(),
      secret: keys.secret()
    };
  }

  render() {
    invariant(
      this.props.render,
      "ServerProvider expects a render prop function"
    );
    return this.props.render(this.state || {});
  }
}

export default ServerProvider;
