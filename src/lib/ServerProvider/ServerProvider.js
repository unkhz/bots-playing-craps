import { Component } from "react";
import invariant from "invariant";
import store from "store";

class ServerProvider extends Component {
  async componentDidMount() {
    const sdk = window.StellarSdk;
    const server = new sdk.Server(process.env.REACT_APP_HORIZON_URL);
    const id = store.get("accountID") || (await this.createNewAccount(sdk));
    const keys = sdk.Keypair.fromSecret(id.secret);
    const account = await server.loadAccount(keys.publicKey());
    this.setState({ account, sdk, server, keys });
  }

  async createNewAccount(sdk) {
    const keys = sdk.Keypair.random();
    await (await fetch(
      `${process.env.REACT_APP_HORIZON_URL}?addr=${keys.publicKey()}`
    )).json();
    const accountIdentity = {
      secret: keys.secret()
    };
    store.set("accountID", accountIdentity);
    return accountIdentity;
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
