import { Component } from "react";
import invariant from "invariant";
import store from "store";
import update from "immutability-helper";

const STORE_KEY_IDENTITIES = "identities";
const IDENTITY_COUNT = 3;

const randomInteger = (min, max) =>
  min + Math.round(Math.random() * (max - min));

const makeABet = ({ account_id, balance }) => {
  return {
    account_id,
    amount: randomInteger(0, balance),
    betOnPass: randomInteger(0, 100) > 50
  };
};

const mapServerStateToAccount = serverAccount => ({
  ...serverAccount,
  balance: Number(
    serverAccount.balances.find(({ asset_type }) => asset_type === "native")
      .balance
  )
});

class ServerProvider extends Component {
  async componentDidMount() {
    const sdk = window.StellarSdk;
    const server = new sdk.Server(process.env.REACT_APP_HORIZON_URL);

    this.setState({
      sdk,
      server,
      bets: [],
      placeBets: this.placeBets,
      roundStatus: "Idle"
    });
    this.loadAccounts(sdk, server);
  }

  async loadAccounts(sdk, server) {
    const identities =
      store.get(STORE_KEY_IDENTITIES) ||
      (await this.createAndStoreNewAccounts(sdk, IDENTITY_COUNT));
    const serverAccounts = await Promise.all(
      identities.map(({ publicKey }) => server.loadAccount(publicKey))
    );
    this.setState({
      accounts: serverAccounts.map(mapServerStateToAccount)
    });
  }

  placeBets = () => {
    this.state.accounts.forEach(account => {
      setTimeout(() => {
        const newState = update(this.state, {
          bets: { $push: [makeABet(account)] }
        });
        this.setState(newState);
      }, randomInteger(1000, 5000));
    });
    this.setState({ isRoundActive: true, roundStatus: "Placing bets" });
  };

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
