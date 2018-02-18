import React, { Component } from 'react';
import ease from 'eases/bounce-out';
import { Absolute, Relative, Box, Panel, PanelHeader, PanelFooter, BackgroundImage, Subhead, Code, Text } from 'rebass';

import './Participant.css';

const COLOR_LIFETIME = 2000;

class ChangeObserver extends Component {
  state = {};
  componentWillReceiveProps(nextProps) {
    const lifeTime = this.props.lifeTime;
    const prevValue = this.props.observable;
    const nextValue = nextProps.observable;
    if (prevValue !== nextValue) {
      const changeTime = new Date().getTime();
      this.setState({ prevValue, nextValue, changeTime });
      const handle = () => {
        const age = new Date().getTime() - changeTime;
        this.setState({ age });
        if (age < lifeTime) this.frameId = requestAnimationFrame(handle);
      };
      this.frameId = requestAnimationFrame(handle);
    }
  }
  render() {
    return this.props.children(
      Object.is(this.state.prevValue, this.state.nextValue),
      this.state.prevValue,
      this.state.nextValue,
      this.props.lifeTime - this.state.age
    );
  }
}

const Participant = ({ player, bets, lastWin, footer, panelBackgroundColor = 'black' }) => {
  const actualUrl = `${process.env.REACT_APP_IDENTITY_BASE_URL}/${player.accountId}`;
  const derefereredUrl = `http://www.dereferer.org/?${encodeURIComponent(actualUrl)}`;
  return (
    <Box w={1 / 4} m={2} flex="1 1 auto" style={{ minWidth: 50, maxWidth: 150 }}>
      <a href={derefereredUrl} style={{ textDecoration: 'none', color: 'inherit' }}>
        <Panel width="100%" style={{ backgroundColor: panelBackgroundColor }}>
          <PanelHeader p={0} style={{ border: '0 solid black' }}>
            <span className="participant">
              <Code p={1} style={{ whiteSpace: 'pre', fontSize: 6, display: 'block' }}>
                {player.accountId.match(/.{1,14}/g).join('\n')}
              </Code>
            </span>
          </PanelHeader>
          <Relative>
            <Absolute style={{ width: '100%' }}>
              <Subhead
                m={2}
                fontSize={[24, 32]}
                style={{
                  fontFamily: "'Indie Flower', cursive",
                  textTransform: 'uppercase',
                  textShadow: `0 0 1px ${panelBackgroundColor}, 0 0 10px ${panelBackgroundColor}, 0 0 6px ${panelBackgroundColor}, 0 0 3px ${panelBackgroundColor}`,
                }}
              >
                {player.name}
              </Subhead>
            </Absolute>
            <BackgroundImage
              ratio={2 / 3}
              src={`https://robohash.org/${player.accountId}.png`}
              style={{ height: '3vh' }}
            />
            <ChangeObserver observable={player.balance} lifeTime={COLOR_LIFETIME}>
              {(isChange, prevBalance, nextBalance, timeLeft) => {
                const isPositive = nextBalance - prevBalance > 0;
                const life = timeLeft / COLOR_LIFETIME || 0;
                const alpha = ease(life) / 3 || 0;
                const backgroundColor =
                  alpha >= 0
                    ? isPositive ? `rgba(128, 255, 128, ${alpha})` : `rgba(255, 128, 128, ${alpha})`
                    : 'transparent';
                return (
                  <Text fontSize={14} m={1} style={{ backgroundColor, borderRadius: '4px' }}>
                    ~ {Math.round(player.balance)} XLM
                  </Text>
                );
              }}
            </ChangeObserver>
          </Relative>
          <PanelFooter style={{ minHeight: '48px', border: '0 solid black' }}>{footer}</PanelFooter>
        </Panel>
      </a>
    </Box>
  );
};
export default Participant;
