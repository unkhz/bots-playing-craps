import React from "react";
import { all as names } from "dog-names";
import {
  Panel,
  PanelHeader,
  BackgroundImage,
  Subhead,
  Code,
  Toolbar,
  NavLink
} from "rebass";

// @see http://erlycoder.com/49/javascript-hash-functions-to-convert-string-into-integer-hash-
const hashCode = str => {
  var hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

const Player = ({ account }) => {
  const name = names[Math.abs(hashCode(account.account_id)) % names.length];
  const { balance } = account.balances.find(
    ({ asset_type }) => asset_type === "native"
  );
  const actualUrl = `${process.env.REACT_APP_IDENTITY_BASE_URL}/${
    account.account_id
  }`;
  const derefereredUrl = `http://www.dereferer.org/?${encodeURIComponent(
    actualUrl
  )}`;
  return (
    <Panel width="100%">
      <PanelHeader>
        <NavLink href={derefereredUrl}>
          <Code style={{ whiteSpace: "pre", fontSize: 10 }}>
            {account.account_id.match(/.{1,28}/g).join("\n")}
          </Code>
        </NavLink>
      </PanelHeader>
      <BackgroundImage
        ratio={2 / 3}
        src={`https://robohash.org/${account.account_id}.png`}
        style={{ height: "5vh" }}
      />

      <Subhead p={2}>{name}</Subhead>
      <Subhead p={3}>{Number(balance)} XLM</Subhead>
    </Panel>
  );
};

export default Player;
