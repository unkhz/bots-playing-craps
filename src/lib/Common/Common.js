import React from 'react';
import { Badge, Text, Relative, ButtonTransparent } from 'rebass';
import styled from 'styled-components';

export const RollResult = ({ pass, fail, children, style, ...passedProps }) => (
  <Badge
    color={pass ? 'black' : 'white'}
    bg={pass ? 'white' : 'black'}
    style={{ border: '1px solid black', textTransform: 'uppercase', fontSize: '8px', ...style }}
    {...passedProps}
  >
    {children ? children : pass ? 'pass' : fail ? 'fail' : ''}
  </Badge>
);

export const Strong = ({ children, style, ...passedProps }) => (
  <Text style={{ fontWeight: 'bold', fontSize: '1.1em', display: 'inline', ...style }} {...passedProps}>
    {children}
  </Text>
);

export const InlineBlock = ({ children, style, ...passedProps }) => (
  <Relative style={{ display: 'inline-block', ...style }} {...passedProps}>
    {children}
  </Relative>
);

const ShowMoreButtonWrapper = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4em;
  display: flex;
  align-items: 'lex-end;
  background: linear-gradient(
    180deg,
    rgba(255,255,255,0) 0%,
    rgba(255,255,255,0.9) 20%,
    rgba(255,255,255,0.99) 80%,
    rgba(255,255,255,1) 100%
  );
`;

export class ShowMore extends React.Component {
  state = { showMore: false };
  render() {
    return (
      <Relative
        style={{
          overflow: 'hidden',
          paddingBottom: this.state.showMore ? 0 : '5em',
          height: this.state.showMore ? 'auto' : this.props.height,
        }}
      >
        {this.props.children}
        {this.state.showMore || (
          <ShowMoreButtonWrapper>
            <ButtonTransparent
              onClick={() => this.setState({ showMore: true })}
              style={{ cursor: 'pointer', margin: '0 auto', flex: '0 0 auto' }}
            >
              &lt; Show more &gt;
            </ButtonTransparent>
          </ShowMoreButtonWrapper>
        )}
      </Relative>
    );
  }
}
