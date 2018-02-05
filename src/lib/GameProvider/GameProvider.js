import { Component } from 'react';
import invariant from 'invariant';
import update from 'immutability-helper';

const randomInteger = (min, max) => min + Math.round(Math.random() * (max - min));

const makeABet = ({ account_id, balance }) => {
  return {
    account_id,
    amount: randomInteger(0, balance),
    betOnPass: randomInteger(0, 100) > 50,
  };
};

class GameProvider extends Component {
  async componentDidMount() {
    this.setState({
      bets: [],
      placeBets: this.placeBets,
      roundStatus: 'Idle',
    });
  }

  placeBets = () => {
    this.props.accounts.forEach((account) => {
      setTimeout(() => {
        const newState = update(this.state, {
          bets: { $push: [makeABet(account)] },
        });
        this.setState(newState);
      }, randomInteger(1000, 5000));
    });
    this.setState({ isRoundActive: true, roundStatus: 'Placing bets' });
  };

  render() {
    invariant(this.props.render, 'GameProvider expects a render prop function');
    return this.props.render(this.state || {});
  }
}

export default GameProvider;
