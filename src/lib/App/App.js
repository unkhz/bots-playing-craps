import React from "react";
import logo from "./logo.svg";

import ServerProvider from "lib/ServerProvider/ServerProvider";

import "./App.css";

const App = props => {
  return (
    <ServerProvider
      render={({ account }) => (
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Welcome to React</h1>
          </header>
          <div className="App-intro">
            {account && (
              <div>
                <p>Account {account.account_id}</p>
                <ul>
                  {account.balances.map(b => (
                    <li key={b.asset_type}>
                      {b.asset_type}: {b.balance}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    />
  );
};

export default App;
