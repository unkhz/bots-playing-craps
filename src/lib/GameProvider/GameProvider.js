import { Component } from 'react';
import invariant from 'invariant';
import update from 'immutability-helper';
import StateMachine from 'javascript-state-machine';

const sum = (dice) => dice.reduce((r, v) => r + v, 0);
const randomInteger = (min, max) => min + Math.round(Math.random() * (max - min));
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const makeABet = ({ account_id, balance }) => {
  return {
    account_id,
    amount: randomInteger(0, balance),
    betOnPass: randomInteger(0, 100) > 50,
  };
};

const STATE_PLACING_BETS = 'placing_bets';
const STATE_IDLE = 'idle';
const STATE_ROLLING = 'rolling_dice';
const STATE_REROLLING = 'rerolling';
const STATE_COLLECTING_WINS = 'collecting_wins';

class GameProvider extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      bets: [],
      winners: [],
      placeBets: () => this.fsm.placeBets(),
      stop: () => this.setState({ shouldStop: true }),
    };
    this.fsm = new StateMachine({
      init: 'idle',
      transitions: [
        { name: 'placeBets', from: STATE_IDLE, to: STATE_PLACING_BETS },
        { name: 'roll', from: STATE_PLACING_BETS, to: STATE_ROLLING },
        { name: 'reRoll', from: STATE_ROLLING, to: STATE_REROLLING },
        { name: 'reRoll', from: STATE_REROLLING, to: STATE_REROLLING },
        { name: 'collectWins', from: STATE_ROLLING, to: STATE_COLLECTING_WINS },
        { name: 'collectWins', from: STATE_REROLLING, to: STATE_COLLECTING_WINS },
        { name: 'placeBets', from: STATE_COLLECTING_WINS, to: STATE_PLACING_BETS },
        { name: 'stop', from: STATE_IDLE, to: STATE_IDLE },
        { name: 'stop', from: STATE_PLACING_BETS, to: STATE_IDLE },
        { name: 'stop', from: STATE_ROLLING, to: STATE_IDLE },
        { name: 'stop', from: STATE_REROLLING, to: STATE_IDLE },
        { name: 'stop', from: STATE_COLLECTING_WINS, to: STATE_IDLE },
      ],
      methods: {
        onPlaceBets: this.handlePlaceBets,
        onRoll: this.handleRoll,
        onReRoll: this.handleReRoll,
        onCollectWins: this.handleCollectWins,
        onStop: () => this.update(),
      },
    });
  }

  handlePlaceBets = async () => {
    this.update();
    await Promise.all(
      this.props.accounts.map(async (account) => {
        await delay(randomInteger(1000, 5000));
        const newState = update(this.state, {
          bets: { $push: [makeABet(account)] },
        });
        this.update(newState);
      })
    );
    const nextTransition = this.fsm.roll;
    setTimeout(() => nextTransition.call(this.fsm), randomInteger(100, 1000));
  };

  handleRoll = () => {
    const dice = [randomInteger(1, 6), randomInteger(1, 6)];
    const point = sum(dice);
    const isPass = [7, 11].includes(point);
    const isNotPass = [2, 3, 12].includes(point);
    const isResolved = isPass || isNotPass;
    const nextTransition = isResolved ? this.fsm.collectWins : this.fsm.reRoll;
    this.update({ dice, point, isPass, isNotPass, isResolved }, nextTransition);
  };

  handleReRoll = () => {
    const point = this.state.point;
    const dice = [randomInteger(1, 6), randomInteger(1, 6)];
    const result = sum(dice);
    const isPass = result === point;
    const isNotPass = result === 7;
    const isResolved = isPass || isNotPass;
    const nextTransition = isResolved ? this.fsm.collectWins : this.fsm.reRoll;
    this.update({ dice, point, isPass, isNotPass, isResolved }, nextTransition);
  };

  handleCollectWins = async () => {
    const nextTransition = this.fsm.placeBets;
    const pot = this.state.bets.reduce((r, { amount }) => r + amount, 0);
    const winnersWithBets = this.state.bets.filter((bet) => !(bet.betOnPass ^ this.state.isPass));
    const totalWinningBets = winnersWithBets.reduce((r, { amount }) => r + amount, 0);
    const winners = winnersWithBets.map(({ account_id, amount }) => ({
      account_id,
      win: amount / totalWinningBets * pot,
    }));
    this.update({ bets: [], dice: [], winners }, nextTransition);
  };

  update = (newState = {}, nextTransition) => {
    this.setState({
      isRoundActive: this.fsm.state !== STATE_IDLE,
      roundStatus: this.fsm.state,
      shouldStop: false,
      ...newState,
    });
    if (this.state && this.state.shouldStop) {
      setImmediate(() => this.fsm.stop());
    } else {
      nextTransition && setTimeout(() => nextTransition.call(this.fsm), randomInteger(100, 1000));
    }
  };

  render() {
    invariant(this.props.render, 'GameProvider expects a render prop function');
    return this.props.render(this.state || {});
  }
}

export default GameProvider;
