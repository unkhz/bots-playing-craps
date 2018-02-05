import React from "react";
import { all as names } from "dog-names";
import { Card, BackgroundImage, Subhead, Code, Link } from "rebass";

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
    <Card width="100%">
      <BackgroundImage
        ratio={1}
        src={`https://robohash.org/${account.account_id}.png`}
      />
      <Subhead p={2}>{name}</Subhead>
      <Link href={derefereredUrl}>
        <Code style={{ whiteSpace: "pre", lineHeight: "-8px" }}>
          {account.account_id.match(/.{1,14}/g).join("\n")}
        </Code>
      </Link>
      <Subhead p={3}>{Number(balance)} XLM</Subhead>
    </Card>
  );
};

export default Player;
