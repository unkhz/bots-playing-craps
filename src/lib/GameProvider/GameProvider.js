import React, { Component } from 'react';
import createContext from 'create-react-context';
import StateMachine from 'javascript-state-machine';
import invariant from 'invariant';
import { ServerContext } from 'lib/ServerProvider/ServerProvider';

const sum = (dice) => dice.reduce((r, v) => r + v, 0);
const randomInteger = (min, max) => min + Math.round(Math.random() * (max - min));
const think = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const MEMO_BYTE_COUNT = 28;
const uniqueMemo = () => {
  return Array.from(Array(MEMO_BYTE_COUNT))
    .map(() => String.fromCharCode(randomInteger(32, 126)))
    .join('');
};

export const STATE_IDLE = 'idle';
export const STATE_PLACING_BETS = 'placing_bets';
export const STATE_WAITING_FOR_TRANSACTIONS = 'waiting_for_transactions';
export const STATE_ROLLING = 'rolling_dice';
export const STATE_REROLLING = 'rerolling';
export const STATE_DECIDING_WINS = 'deciding_wins';
export const STATE_COLLECTING_WINS = 'collecting_wins';

export const GameContext = createContext({});

class GameProvider extends Component {
  operationTimeoutId = 0;
  state = {
    context: {
      bets: [],
      players: [],
    },
  };

  componentDidMount() {
    this.fsm = new StateMachine({
      init: 'idle',
      transitions: [
        { name: 'placeBets', from: STATE_IDLE, to: STATE_PLACING_BETS },
        { name: 'waitForTransactions', from: STATE_PLACING_BETS, to: STATE_WAITING_FOR_TRANSACTIONS },
        { name: 'roll', from: STATE_WAITING_FOR_TRANSACTIONS, to: STATE_ROLLING },
        { name: 'reRoll', from: STATE_ROLLING, to: STATE_REROLLING },
        { name: 'reRoll', from: STATE_REROLLING, to: STATE_REROLLING },
        { name: 'decideWins', from: STATE_ROLLING, to: STATE_DECIDING_WINS },
        { name: 'decideWins', from: STATE_REROLLING, to: STATE_DECIDING_WINS },
        { name: 'collectWins', from: STATE_DECIDING_WINS, to: STATE_COLLECTING_WINS },
        { name: 'placeBets', from: STATE_COLLECTING_WINS, to: STATE_PLACING_BETS },
        { name: 'stop', from: STATE_IDLE, to: STATE_IDLE },
        { name: 'stop', from: STATE_PLACING_BETS, to: STATE_IDLE },
        { name: 'stop', from: STATE_WAITING_FOR_TRANSACTIONS, to: STATE_IDLE },
        { name: 'stop', from: STATE_ROLLING, to: STATE_IDLE },
        { name: 'stop', from: STATE_REROLLING, to: STATE_IDLE },
        { name: 'stop', from: STATE_COLLECTING_WINS, to: STATE_IDLE },
      ],
      methods: {
        onPlaceBets: () => {
          console.log('Placing bets');
          this.handlePlaceBets();
        },
        onWaitForTransactions: () => {
          this.handleWaitForTransactions();
        },
        onRoll: () => {
          console.log('Rolling');
          this.handleRoll();
        },
        onReRoll: () => {
          this.handleReRoll();
        },
        onDecideWins: () => {
          this.handleDecideWins();
        },
        onCollectWins: () => {
          console.log('Collecting wins');
          this.handleCollectWins();
        },
        onStop: () => {
          console.log('Round ended');
          this.update({}, { bets: [], dice: [], winners: [] });
        },
      },
    });
    this.update();
  }

  operate(action, min = 100, max = 1000) {
    clearTimeout(this.operationTimeoutId);
    this.operationTimeoutId = setTimeout(action.bind(this.fsm), randomInteger(min, max));
  }

  handlePlaceBets = async () => {
    this.update();
    await think(2000);
    this.operate(this.fsm.waitForTransactions);
  };

  handleWaitForTransactions = async () => {
    const { dealer } = this.state.context;
    const { serverContext: { scanTransactions, verifyTransaction } } = this.props;
    this.update();
    const { bets } = this.state.context;
    const verified = [];
    const isOk = (tx, bet) =>
      verifyTransaction(tx, bet.accountId, dealer.accountId, bet.amount, bet.expectedTransactionMemo);
    let closeEventSource;
    await new Promise((resolve) => {
      closeEventSource = scanTransactions(dealer.accountId, async (tx) => {
        const unverified = bets.filter(({ expectedTransactionMemo }) => !verified.includes(expectedTransactionMemo));
        const checks = await Promise.all(unverified.map((bet) => isOk(tx, bet)));
        const verifiedBet = unverified[checks.indexOf(true)];
        if (verifiedBet) {
          console.log(`System verified ${dealer.name} received ${verifiedBet.amount} XLM from ${verifiedBet.name}`);
          verified.push(tx.memo);
        }

        const areAllTransactionsVerified = bets.every((bet) => verified.includes(bet.expectedTransactionMemo));
        if (areAllTransactionsVerified) {
          resolve();
        }
      });
    });
    closeEventSource();
    this.operate(this.fsm.roll);
  };

  handleRoll = () => {
    const dice = [randomInteger(1, 6), randomInteger(1, 6)];
    const point = sum(dice);
    const isPass = [7, 11].includes(point);
    const isNotPass = [2, 3, 12].includes(point);
    const isResolved = isPass || isNotPass;
    const nextTransition = isResolved ? this.fsm.decideWins : this.fsm.reRoll;
    this.update({ point, isPass, isNotPass, isResolved }, { dice }, nextTransition);
  };

  handleReRoll = () => {
    const point = this.state.point;
    const dice = [randomInteger(1, 6), randomInteger(1, 6)];
    const result = sum(dice);
    const isPass = result === point;
    const isNotPass = result === 7;
    const isResolved = isPass || isNotPass;
    const nextTransition = isResolved ? this.fsm.decideWins : this.fsm.reRoll;
    this.update({ point, isPass, isNotPass, isResolved }, { dice }, nextTransition);
  };

  handleDecideWins = async () => {
    const { bets, dealer } = this.state.context;
    const pot = dealer.balance;
    const winnersWithBets = bets.filter((bet) => !(bet.betOnPass ^ this.state.isPass));
    const totalWinningBets = winnersWithBets.reduce((r, { amount }) => r + amount, 0);
    const winners = winnersWithBets.map(({ accountId, amount, name }) => ({
      accountId,
      name,
      expectedTransactionMemo: uniqueMemo(),
      win: Math.floor(amount / totalWinningBets * pot),
      amount: Math.floor(amount / totalWinningBets * pot),
    }));
    if (winners.length === 0) console.log('No winners this round');
    winners.forEach(({ name, amount }) => console.log(`${name} won ${amount} XLM`));
    const nextTransition = this.fsm.collectWins;
    this.update({}, { bets: [], dice: [], winners }, nextTransition);
  };

  handleCollectWins = async () => {
    const { dealer, winners } = this.state.context;
    if (winners.length === 0) {
      this.update({}, {}, this.fsm.stop);
      return;
    }
    const { serverContext: { scanTransactions, verifyTransaction } } = this.props;
    this.update();
    const verifiedMemos = [];
    const isOk = (tx, win) =>
      verifyTransaction(tx, dealer.accountId, win.accountId, win.amount, win.expectedTransactionMemo);
    let closeEventSource;
    await new Promise((resolve) => {
      closeEventSource = scanTransactions(dealer.accountId, async (tx) => {
        const unverified = winners.filter((win) => !verifiedMemos.includes(win.expectedTransactionMemo));
        const checks = await Promise.all(unverified.map((win) => isOk(tx, win)));
        const verifiedWin = unverified[checks.indexOf(true)];
        if (verifiedWin) {
          console.log(`System verified ${dealer.name} paid ${verifiedWin.amount} to ${verifiedWin.name}`);
          verifiedMemos.push(tx.memo);
        }

        const areAllTransactionsVerified = winners.every((win) => verifiedMemos.includes(win.expectedTransactionMemo));
        if (areAllTransactionsVerified) {
          resolve();
        }
      });
    });
    closeEventSource();
    const nextTransition = this.fsm.stop;
    this.update({}, {}, nextTransition);
  };

  update = (newState = {}, newContext = {}, nextTransition) => {
    const { context, ...restOfState } = this.state;
    this.setState({ ...restOfState, ...newState });
    this.setContext(() => newContext);
    nextTransition && this.operate(nextTransition);
  };

  registerDealer = (name, accountId, balance) => {
    this.setContext((context) => {
      console.log(`${name} enters as the dealer`);
      return { ...context, dealer: { name, accountId, balance } };
    });
  };

  registerPlayer = (name, accountId, balance) => {
    this.setContext((context) => {
      console.log(`${name} enters the game`);
      const players = [...context.players, { name, accountId, balance }];
      return { ...context, players };
    });
  };

  updatePlayer = (accountId, model) => {
    invariant(this.state.context.players.some((p) => p.accountId === accountId), 'Trying to update unknown player');
    this.setContext((context) => {
      const player = context.players.find((p) => p.accountId === accountId);
      const otherPlayers = context.players.filter((p) => p.accountId !== accountId);
      const players = [...otherPlayers, { ...player, ...model }];
      return { ...context, players };
    });
  };

  updateDealer = (accountId, model) => {
    invariant(this.state.context.dealer.accountId === accountId, 'Trying to update unknown dealer');
    this.setContext((context) => {
      const dealer = { ...context.dealer, ...model };
      return { ...context, dealer };
    });
  };

  placeBet = (accountId, amount, betOnPass, transaction) => {
    if (this.fsm.state !== STATE_PLACING_BETS) {
      const player = this.state.context.players.find((player) => player.accountId === accountId);
      console.log(`${player.name} missed betting phase :(`);
      return false;
    } else {
      const expectedTransactionMemo = uniqueMemo();
      this.setContext((context) => {
        const player = context.players.find((player) => player.accountId === accountId);
        const bet = { accountId, amount, betOnPass, expectedTransactionMemo, name: player.name };
        console.log(`${player.name} places bet of ${amount} XLM (memo: ${expectedTransactionMemo})`);
        const bets = [...context.bets, bet];
        return { ...context, bets };
      });
      return expectedTransactionMemo;
    }
  };

  createContext(context, newContext) {
    return {
      ...context,
      ...newContext,

      // game state
      isRoundActive: this.fsm.state !== STATE_IDLE,
      roundStatus: this.fsm.state,

      // player actions
      registerPlayer: this.registerPlayer,
      updatePlayer: this.updatePlayer,
      placeBet: this.placeBet,

      // dealer actions
      registerDealer: this.registerDealer,
      updateDealer: this.updateDealer,
      placeBets: () => this.fsm.placeBets(),
    };
  }

  setContext(getNewContext = (c) => c) {
    this.setState((state) => ({
      ...state,
      context: this.createContext(state.context, getNewContext(state.context)),
    }));
  }

  render() {
    return <GameContext.Provider value={this.state.context}>{this.props.children}</GameContext.Provider>;
  }
}

export default (props) => (
  <ServerContext.Consumer>
    {(serverContext) => <GameProvider serverContext={serverContext} {...props} />}
  </ServerContext.Consumer>
);
