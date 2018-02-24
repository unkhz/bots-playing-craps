import React, { Component, Fragment } from 'react';
import Recaptcha from 'react-grecaptcha';
import store from 'store';

import { Absolute, Relative, Heading } from 'rebass';
import { RollResult, Strong } from 'lib/Common/Common';

const STORE_KEY = '9F08E5DE-63D9-417B-B557-4BDE6FFF2103';
const STORE_VALUE = 'B4538960-2222-458E-A417-6FC5874C5DDB';

export default class Intro extends Component {
  state = {
    isVerified: store.get(STORE_KEY) === STORE_VALUE,
  };

  handleVerified = () => {
    this.setState({ isVerified: true });
    store.set(STORE_KEY, STORE_VALUE);
  };

  render() {
    return !this.state.isVerified ? (
      <Fragment>
        <Heading m={2} fontSize={[18, 24]}>
          Our version of the rules
        </Heading>
        <Relative style={{ textAlign: 'left', display: 'inline-block', maxWidth: '33em' }}>
          <ul>
            <li>
              There's a number of bots in the game, each having their own <Strong>Stellar Lumens</Strong> cryptocurrency
              (XLM) account and some coins.
            </li>
            <li>One bot is the dealer, others are players.</li>
            <li>Player bots bet against the result of dice rolls made by the system.</li>
            <li>
              All bets are placed as XLM transactions to the dealer's account. System verifies the transactions are
              added to the blockchain before rolling.
            </li>
            <li>
              The dice are rolled until a <RollResult pass /> or <RollResult fail /> is reached.
            </li>
            <ul>
              <li>
                First roll is <RollResult pass /> if the dice produce <Strong>7</Strong> or <Strong>11</Strong>
              </li>
              <li>
                First roll is <RollResult fail /> if the dice produce <Strong>2</Strong>, <Strong>3</Strong> or{' '}
                <Strong>12</Strong>
              </li>
              <li>
                If undecided the sum of the dice becomes the <Strong>point</Strong>
              </li>
              <li>
                Further dice rolls are made until the <Strong>point</Strong> is rolled again which equals{' '}
                <RollResult pass />, or <Strong>7</Strong> is rolled which equals <RollResult fail />
              </li>
            </ul>
            <li>Dealer divides the pot proportionally between all the player bots who bet on the correct result.</li>
            <li>
              System verifies the correct amounts are transferred from the dealer's account to the winners' accounts and
              concludes the round complete.
            </li>
          </ul>
        </Relative>
        <Absolute style={{ bottom: 0, left: 0, right: 0, height: 200 }}>
          <Recaptcha
            sitekey={process.env.REACT_APP_GRECAPTCHA_SITEKEY}
            callback={this.handleVerified}
            expiredCallback={() => console.log('Recapthca expired')}
            style={{ display: 'inline-block', margin: 'auto' }}
          />
        </Absolute>
      </Fragment>
    ) : (
      this.props.children
    );
  }
}
