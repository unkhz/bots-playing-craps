import React from 'react';
import { ServerContext } from 'lib/ServerProvider/ServerProvider';

function Bot(props) {
  console.log('Rendering Bot', props.account.account_id);
  return <ServerContext.Consumer>{() => <span />}</ServerContext.Consumer>;
}

export default Bot;
