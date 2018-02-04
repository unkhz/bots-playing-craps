import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import store from "store";

let str = (window.str = {});

class App extends Component {
  constructor(...args) {
    super(...args);
    this.state = {};
  }

  async componentDidMount() {
    const sdk = window.StellarSdk;
    const server = new sdk.Server(process.env.REACT_APP_HORIZON_URL);
    Object.assign(str, { sdk, server });
    const id = store.get("accountID") || (await this.createNewAccount());
    str.keys = str.sdk.Keypair.fromSecret(id.secret);
    str.account = await server.loadAccount(str.keys.publicKey());
    this.setState({ account: str.account });
  }

  async createNewAccount() {
    const keys = str.sdk.Keypair.random();
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
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <div className="App-intro">
          {this.state.account && (
            <div>
              <p>Account {this.state.account.account_id}</p>
              <ul>
                {this.state.account.balances.map(b => (
                  <li key={b.asset_type}>
                    {b.asset_type}: {b.balance}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default App;
