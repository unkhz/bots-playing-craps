import React from 'react';
import { FacebookShareButton, TwitterShareButton, FacebookIcon, TwitterIcon } from 'react-share';
import octicons from 'octicons';
import { Absolute } from 'rebass';
import SVGInline from 'react-svg-inline';

import { InlineBlock } from 'lib/Common/Common';

const SIZE = 24;
const shares = [
  [FacebookShareButton, FacebookIcon],
  [TwitterShareButton, TwitterIcon],
  [
    ({ children }) => <a href="https://github.com/unkhz/bots-playing-craps">{children}</a>,
    (props) => (
      <InlineBlock
        style={{
          color: 'black',
          backgroundColor: 'white',
          borderRadius: `${Math.ceil(SIZE / 2)}px`,
          width: `${SIZE}px`,
          height: `${SIZE}px`,
        }}
      >
        <SVGInline width="100%" height="100%" svg={octicons['mark-github'].toSVG()} />
      </InlineBlock>
    ),
  ],
];

export default () => (
  <Absolute m={1} style={{ top: 0, right: 0, textAlign: 'right', display: 'flex', textShadow: 'none' }}>
    {shares.map(([Button, Icon]) => (
      <InlineBlock m={1} style={{ cursor: 'pointer' }}>
        <Button url="https://bots-playing-craps.khz.fi/">
          {Icon && <Icon size={SIZE} iconBgStyle={{ fill: '#000000' }} round />}
        </Button>
      </InlineBlock>
    ))}
  </Absolute>
);
