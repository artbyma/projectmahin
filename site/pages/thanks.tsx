/** @jsxRuntime classic /
 /** @jsx jsx */
import React, {useEffect, useState} from "react";
import {css, jsx} from "@emotion/react";
import {Layout, MaxWidth, Padding} from "../lib/Layout";
import {useWeb3React} from "../lib/web3wallet/core";
import {useNFTContract} from "../lib/useNFTContract";


export default function Thanks() {
  let content = <Content />;
  return (
      <Layout>
        {content}
      </Layout>
  )
}

export function Content(props: {
}) {
  return <MaxWidth><Padding css={css`
    font-size: 18px;
  `}>
    <h1>Thank you!</h1>
    <p>
      The following illustrations, a part of this interactive experiment, now belong to you.
    </p>
    <MyGallery />
    <h3>What happens now?</h3>
    <p>
      Over the next 5 years, there is a 12% chance (1 in 8) that your pieces will be diagnosed with, fight
      and successfully beat breast cancer. This will be reflected in your NFT. If so, secondary sale
      royalties will increase from 5% to 15% - all are donated to charity.
    </p>
  </Padding>
  </MaxWidth>
}

export function MyGallery() {
  const { library, active, account } = useWeb3React();
  const contract = useNFTContract();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<null|{name: string, url: string}[]>(null);

  const loadTokens = async () => {
    if (!library) {
      return;
    }

    setLoading(true);
    try {
      const total = await contract.balanceOf(account);

      let tokens = [];
      for (let i = 0; i++; i < total) {
        const tokenId = await contract.tokenOfOwnerByIndex(account, i);
        const tokenUri = await contract.tokenURI(tokenId);
        tokens.push({name: "", url: tokenUri});
      }
      setData(tokens);
    }
    finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTokens();
  }, [library])

  if (!active || !library || loading) {
    return <div>
      ...
    </div>
  }

  if (!data.length) {
    return  <em>
      You do not yet own any tokens.
    </em>
  }

  return <div>
    hi there.
    Active? {active} {account}
  </div>
}