import React, { Component } from 'react';
import createContext from 'create-react-context';
import update from 'immutability-helper';
import StateMachine from 'javascript-state-machine';

import { ServerContext } from 'lib/ServerProvider/ServerProvider';

const sum = (dice) => dice.reduce((r, v) => r + v, 0);
const randomInteger = (min, max) => min + Math.round(Math.random() * (max - min));
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const makeABet = ({ playerId, balance }) => {
  return {
    playerId,
    amount: randomInteger(0, balance),
    betOnPass: randomInteger(0, 100) > 50,
  };
};

const STATE_PLACING_BETS = 'placing_bets';
const STATE_IDLE = 'idle';
const STATE_ROLLING = 'rolling_dice';
const STATE_REROLLING = 'rerolling';
const STATE_COLLECTING_WINS = 'collecting_wins';

export const GameContext = createContext({});

class GameProvider extends Component {
  operationTimeoutId = 0;
  state = {
    context: {
      bets: [],
      players: [],
    },
    bets: [],
  };

  componentDidMount() {
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
        onPlaceBets: () => {
          this.handlePlaceBets();
        },
        onRoll: () => {
          this.handleRoll();
        },
        onReRoll: () => {
          this.handleReRoll();
        },
        onCollectWins: () => {
          this.handleCollectWins();
        },
        onStop: () => {
          this.update();
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
    await Promise.all(
      this.state.context.players.map(async (player) => {
        await delay(randomInteger(1000, 5000));
        const newState = update(this.state, {
          bets: { $push: [makeABet(player)] },
        });
        this.update(newState, { bets: newState.bets });
      })
    );
    this.operate(this.fsm.roll);
  };

  handleRoll = () => {
    const dice = [randomInteger(1, 6), randomInteger(1, 6)];
    const point = sum(dice);
    const isPass = [7, 11].includes(point);
    const isNotPass = [2, 3, 12].includes(point);
    const isResolved = isPass || isNotPass;
    const nextTransition = isResolved ? this.fsm.collectWins : this.fsm.reRoll;
    this.update({ point, isPass, isNotPass, isResolved }, { dice }, nextTransition);
  };

  handleReRoll = () => {
    const point = this.state.point;
    const dice = [randomInteger(1, 6), randomInteger(1, 6)];
    const result = sum(dice);
    const isPass = result === point;
    const isNotPass = result === 7;
    const isResolved = isPass || isNotPass;
    const nextTransition = isResolved ? this.fsm.collectWins : this.fsm.reRoll;
    this.update({ point, isPass, isNotPass, isResolved }, { dice }, nextTransition);
  };

  handleCollectWins = async () => {
    const nextTransition = this.fsm.stop;
    const pot = this.state.bets.reduce((r, { amount }) => r + amount, 0);
    const winnersWithBets = this.state.bets.filter((bet) => !(bet.betOnPass ^ this.state.isPass));
    const totalWinningBets = winnersWithBets.reduce((r, { amount }) => r + amount, 0);
    const winners = winnersWithBets.map(({ playerId, amount }) => ({
      playerId,
      win: amount / totalWinningBets * pot,
    }));
    this.update({ bets: [] }, { bets: [], dice: [], winners }, nextTransition);
  };

  update = (newState = {}, newContext = {}, nextTransition) => {
    const { context, ...restOfState } = this.state;
    this.setState({ ...restOfState, ...newState });
    this.setContext(newContext);
    nextTransition && this.operate(nextTransition);
  };

  registerPlayer = (name, playerId, balance) => {
    this.setState((state) => {
      console.log(`${name} enters the game`);
      const players = [...state.context.players, { name, playerId, balance }];
      return { ...state, context: { ...state.context, players } };
    });
  };

  setContext(newContext) {
    this.setState((state) => ({
      ...state,
      context: {
        ...state.context,
        ...newContext,
        isRoundActive: this.fsm.state !== STATE_IDLE,
        roundStatus: this.fsm.state,
        registerPlayer: this.registerPlayer,
        placeBets: () => this.fsm.placeBets(),
        stop: () => this.setState({ shouldStop: true }),
      },
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
