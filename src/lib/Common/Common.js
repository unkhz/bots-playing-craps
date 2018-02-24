import React from 'react';
import { Badge, Text, Relative } from 'rebass';

export const RollResult = ({ pass, fail, children, style, ...passedProps }) => (
  <Badge
    color={!fail ? 'black' : 'white'}
    bg={!fail ? 'white' : 'black'}
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
