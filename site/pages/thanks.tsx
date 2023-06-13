/** @jsxRuntime classic /
 /** @jsx jsx */
import React, {Fragment, useEffect, useState} from "react";
import {css, jsx} from "@emotion/react";
import {Layout, MaxWidth, Padding} from "../lib/Layout";
import {useWeb3React} from "../lib/web3wallet/core";
import {useNFTContract} from "../lib/useNFTContract";
import {useRouter} from "next/router";
import {useSaleContract} from "../lib/useSaleContract";
import {getMintPrice} from "../lib/useMintPrice";
import {ConnectModal, getImperativeModal} from "../lib/ConnectModal";


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
    <h1>Thank you for supporting Breast Cancer Research!</h1>
    <p>
      The following illustrations, parts of this interactive experiment, now belong to you.
    </p>
    <MyGallery />
    <p>
      You can also find the full collection on <a href={"https://marketplace.reservoir.tools/collection/ethereum/0xe0ba5a6fc8209e225a9937ce1dfb397f18ad402f"}>reservoir.market</a>.
    </p>
    <h3>What happens now?</h3>
    <p>
      Over the next 10 years, there is a 12% chance (1 in 8) that your pieces will be diagnosed with breast cancer.
      This will be reflected in your NFT. If so, secondary sale royalties will increase from 5% to 15% -
      all are donated to Breast Cancer Now UK.
    </p>
  </Padding>
  </MaxWidth>
}

export function MyGallery() {
  const { library, active, account } = useWeb3React();
  const contract = useNFTContract()!;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<null|{name: string, url: string}[]>(null);

  const loadTokens = async () => {
    if (!library) {
      return;
    }

    setLoading(true);
    try {
      const total = (await contract.balanceOf(account)).toNumber();

      try {
        let tokens = [];
        for (let i = 0; i < total; i++) {
          const tokenId = await contract.tokenOfOwnerByIndex(account, i);
          const tokenUri = await contract.tokenURI(tokenId);
          const [name] = await contract.pieces(tokenId);
          const metadata = await (await fetch(tokenUri)).json();
          tokens.push({name, url: metadata.image});
        }
        setData(tokens);
      }
      catch(e) {
        console.log("error occurred during load", e)
      }
    }
    finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTokens();
  }, [library])

  if (!active && !loading) {
    return <div>
      <ConnectButton />
    </div>
  }
  if (!active || !library || loading) {
    return <div>
      ...
    </div>
  }

  if (!data?.length) {
    return  <em>
      You do not yet own any tokens.
    </em>
  }

  return <div>
    {
      data.map(item => {
        return <div style={{display: 'flex', flexDirection: 'column'}}>
          <img width={"200px"} src={item.url} />
          <em>{item.name}</em>
        </div>
      })
    }
  </div>
}

function ConnectButton() {
  const [busy, setBusy] = useState(false);
  const {library, active} = useWeb3React();
  const router = useRouter();
  const contract = useSaleContract();

  const [askToConnect, modalProps] = getImperativeModal();

  const handleClick = async () => {
    setBusy(true)
    try {
      // @ts-ignore
      await askToConnect();
    }
    finally {
      setBusy(false)
    }
  }

  return <Fragment>
    <ConnectModal {...modalProps as any} />
    <button
        disabled={busy}
        onClick={handleClick}
        css={css`
       width: 80%;
       background-color: #363634;
       color: white;
       border: 0;
       padding: 0.7em;
       border-radius: 2px;
       font-size: 18px;
      `}
    >
      {busy ? "Waiting..." : "Connect"}
    </button>
  </Fragment>
}