import React, { Component } from 'react';
import createContext from 'create-react-context';
import invariant from 'invariant';
import store from 'store';

const mapServerStateToAccount = (response) => ({
  ...response,
  accountId: response.account_id,
  balance: Number(response.balances.find(({ asset_type }) => asset_type === 'native').balance),
});

export const ServerContext = createContext();

class ServerProvider extends Component {
  state = {};

  async componentDidMount() {
    window.serverState = this.state;
    const sdk = window.StellarSdk;
    sdk.Network.useTestNetwork();
    const server = new sdk.Server(process.env.REACT_APP_HORIZON_URL);
    this.setState({
      sdk,
      server,
      context: this.createContext({ isInitialized: true }),
    });
  }

  loadAccounts = (publicKeys = []) => {
    invariant(this.state.sdk, 'ServerProvider not initialized yet');
    publicKeys.map((publicKey) => this.loadAndUpdateAccount(publicKey));
  };

  loadAndUpdateAccount = async (accountId) => {
    const { server } = this.state;
    const res = await server.loadAccount(accountId);
    const model = mapServerStateToAccount(res);
    this.setContext((context) => {
      const otherModels = context.accounts.filter((a) => a.accountId !== accountId);
      return { accounts: [...otherModels, model] };
    });
  };

  createNewAccount = async () => {
    invariant(this.state.sdk, 'ServerProvider not initialized yet');
    const keys = this.state.sdk.Keypair.random();
    const res = await fetch(`${process.env.REACT_APP_HORIZON_URL}/friendbot?addr=${keys.publicKey()}`);
    if (res.status !== 200) return;
    return {
      publicKey: keys.publicKey(),
      secret: keys.secret(),
    };
  };

  verifyTransaction = async (
    tx,
    senderAccountId,
    receiverAccountId,
    numericAmount,
    transactionMemo,
    assetType = 'native'
  ) => {
    // Fail quickly with readily available data
    const isSender = tx.source_account === senderAccountId;
    const isCorrectMemo = tx.memo && transactionMemo;
    if (!isSender || !isCorrectMemo) return false;

    const effects = await tx.effects();
    const records = effects._embedded.records || [];
    const checkAmount = (r) => Number(r.amount) === numericAmount && r.asset_type === assetType;
    const isSenderDebited = records.some(
      (r) => checkAmount(r) && r.type === 'account_debited' && r.account === senderAccountId
    );
    const isReceiverCredited = records.some(
      (r) => checkAmount(r) && r.type === 'account_credited' && r.account === receiverAccountId
    );
    return isSenderDebited && isReceiverCredited;
  };

  makeTransaction = async (senderAccountId, receiverAccountId, numericAmount, transactionMemo, sign) => {
    invariant(this.state.sdk, 'ServerProvider not initialized yet');
    invariant('' + numericAmount === '' + Math.abs(numericAmount), 'Amount must be positive number');
    const { sdk, server } = this.state;
    const amount = '' + numericAmount;
    const refreshedSenderAccount = await server.loadAccount(senderAccountId);
    const operation = sdk.Operation.payment({ destination: receiverAccountId, asset: sdk.Asset.native(), amount });
    const memo = new sdk.Memo.text(transactionMemo);
    const transaction = new sdk.TransactionBuilder(refreshedSenderAccount)
      .addOperation(operation)
      .addMemo(memo)
      .build();

    // Let Bot sign the transaction
    sign(transaction, sdk);

    const submission = server.submitTransaction(transaction).catch((err) => {
      if (err.name === 'BadResponseError' && err.data.extras.result_codes.transaction === 'tx_bad_seq') {
        // This is ok, transaction can still succeed
        console.warn('Transaction response tx_bad_seq');
        return;
      } else {
        throw err;
      }
    });
    submission.then(() => {
      this.loadAndUpdateAccount(senderAccountId);
      this.loadAndUpdateAccount(receiverAccountId);
    });
    return submission;
  };

  scanTransactions = (accountId, filter) => {
    const { server } = this.state;
    const lastCursor = store.get('lastScanTransactionsCursor') || 0;
    return server
      .transactions()
      .forAccount(accountId)
      .cursor(lastCursor)
      .stream({
        onmessage: (tx) => {
          store.set('lastScanTransactionsCursor', tx.paging_token);
          return filter(tx);
        },
      });
  };

  createContext = (context, newContext) => ({
    accounts: [],
    ...context,
    ...newContext,
    loadAccounts: this.loadAccounts,
    createNewAccount: this.createNewAccount,
    makeTransaction: this.makeTransaction,
    scanTransactions: this.scanTransactions,
    verifyTransaction: this.verifyTransaction,
  });

  setContext(getNewContext = (c) => c) {
    this.setState((state) => ({
      ...state,
      context: this.createContext(getNewContext(state.context)),
    }));
  }

  render() {
    return <ServerContext.Provider value={this.state.context}>{this.props.children}</ServerContext.Provider>;
  }
}

export default ServerProvider;
