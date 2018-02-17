import React from 'react';

// Render a component only after the context is defined
export default (ContextProvider) => (props) => (
  <ContextProvider.Consumer>
    {(context) => (context ? props.children(context) : props.waitNode || null)}
  </ContextProvider.Consumer>
);
