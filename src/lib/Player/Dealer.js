import React from 'react';
import { Text } from 'rebass';

import Participant from './Participant';

const Dealer = (props) => {
  return <Participant {...props} footer={<Text>DEALER</Text>} />;
};

export default Dealer;
