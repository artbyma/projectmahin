/** @jsxRuntime classic /
 /** @jsx jsx */
import React, {Fragment, useState} from "react";
import {css, jsx} from "@emotion/react";
import {Layout, MaxWidth, Padding} from "../lib/Layout";
import { request } from 'graphql-request';
import {format, fromUnixTime, formatDistanceStrict} from 'date-fns'
import useSWR from "swr";
import {parseProbability, useProbabilities, useRandomState} from "../lib/useRandomState";
import {useWeb3React} from "../lib/web3wallet/core";
import {ConnectModal, getImperativeModal} from "../lib/ConnectModal";
import {useDoctorContract} from "../lib/useDoctorContract";
import {formatEther} from "@ethersproject/units";


const fetcher = query => request('https://api.studio.thegraph.com/query/23726/project-mahin/v0.0.8', query)



export default function Randomness() {
  return (
      <Layout>
        <Action />
        <Log />
        <TechStack />
      </Layout>
  )
}

export function Action(props: {
}) {
  const {probability, collectiveProbability} = useProbabilities();

  return <MaxWidth>
    <Padding css={css`
      font-family: Varta, sans-serif;
      line-height: 1.5;
      font-size: 20px;
    `}>
      <div css={css`
        font-family: Courier, monospace;
        font-size: 14px;
        
        button {
          font-family: inherit;
          padding: 0.4em;
        }
      `}>
        <h1>
          [Randomness]
        </h1>

        <div css={css`
          display: flex;
          flex-direction: row;
          gap: 20px;
          
          > div {
            flex: 1;
          }
        `}>
          <div>
            <p>
              Diagnoses are random, and unpredictable both in outcome and time. However, the nature of the Ethereum
              blockchain  is such that it cannot act on itself; an outside trigger is always required. Therefore, to
              qualify as an autonomous system, we need to ensure both of these: first, that anyone can act as this
              trigger, and second, that there is an economic incentive for someone to do so. The incentive needs to be
              a purely financial one; it must exist even in the absence of anyone being invested
              (emotionally or financially) in the artwork itself.
            </p>
            <p>
              We therefore reserve a part of the treasury, generated from sales, to financially reward whoever
              submits the required trigger transactions (a "keeper" in common parlance).
            </p>
            <p>
              To ensure that a diagnosis can happen at truly any time (or in Ethereum time, any block), rather than
              at fixed intervals, we use a linear probability function, with increasing odds since the last time
              the random source was triggered, and targeting the desired total probability of 12.5% over the
              five year period the project is active.
            </p>
          </div>
          <div css={css`
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1em;
            text-align: center;
          `}>
            <div>
              Current probability (individual / collective):<br/>
              {probability ? <span>
                  {new Intl.NumberFormat("en-US", {
                    style: 'percent', minimumFractionDigits: 2}).format(probability.toNumber()) }
                </span> : null}
              {" "}/{" "}
              {probability ? <span>
                {new Intl.NumberFormat("en-US", {
                  style: 'percent', minimumFractionDigits: 2}).format(collectiveProbability.toNumber()) }
              </span> : null}
            </div>
            <TransactArea />
          </div>
        </div>
      </div>
    </Padding>
  </MaxWidth>
}


export function TransactArea() {
  const [busy, setBusy] = useState(false);
  const {library, active} = useWeb3React();
  const [askToConnect, modalProps] = getImperativeModal();
  const contract = useDoctorContract();
  const [isRolling,,,rewardAmount] = useRandomState();

  const requestRoll = async () => {
    const contractWithSigner = contract.connect(library.getSigner());

    let tx;
    try {
      tx = await contractWithSigner.requestRoll(true)
    } catch(e) {
      console.log(e);
      return;
    }

    let receipt;
    try {
      receipt = await tx.wait();
    } catch(e) {
      console.error(e);
      alert("Request roll failed.")
      return;
    }
  }

  const applyRoll = async () => {
    const contractWithSigner = contract.connect(library.getSigner());

    let tx;
    try {
      tx = await contractWithSigner.applyRoll();
    } catch(e) {
      console.log(e);
      alert("Transaction Simulation Failed. Make sure at least two blocks have passed since randomness was requested.")
      return;
    }

    let receipt;
    try {
      receipt = await tx.wait();
    } catch(e) {
      console.error(e);
      alert("Apply roll failed.")
      return;
    }
  }

  const handleRequestRoll = async () => {
    setBusy(true)
    try {
      if (active) {
        requestRoll();
      } else {
        if (await askToConnect()) {
        }
      }
    }
    finally {
      setBusy(false)
    }
  }

  const handleApplyRoll = async () => {
    setBusy(true)
    try {
      if (active) {
        applyRoll();
      } else {
        if (await askToConnect()) {
        }
      }
    }
    finally {
      setBusy(false)
    }
  }

  return <>
    <ConnectModal {...modalProps} />
    <div>
      Current reward:<br/> {rewardAmount ? formatEther(rewardAmount) : '0'} ETH
    </div>
    <div>
      To feed randomness to the smart contract, two transactions are required.
    </div>
    {!active ? <button onClick={handleRequestRoll}>Connect Wallet</button>
        : <Fragment>
            <button
                disabled={isRolling}
                onClick={handleRequestRoll}
            >
              1. Request Randomness
            </button>
            <button disabled={!isRolling} onClick={handleApplyRoll}>2. Apply Randomness</button>
        </Fragment>}
  </>
}

export function Log(props: {
}) {
  const { data, error } = useSWR(
      `{
          rolls(first: 50, orderBy: requestedAt, orderDirection: desc) {
            id
            requestedAt
            requestTxHash
            appliedAt,
            applyTxHash
            probability
            useFallback
            diagnoses {
              tokenId
            }
          }
    }`,
      fetcher
  );

  let content;

  if (error) {
    content = 'Failed to load.'
  }
  else if (!data) {
    content = 'Loading...';
  }
  else {
    content = <table css={css`
    width: 100%;
    border-collapse: collapse;
    margin: 25px 0;
    font-size: 0.9em;
    
    thead tr {
        background-color: #f63677;
        color: #ffffff;
        text-align: left;
    }
    
    th, td {
      padding: 12px 15px;
    }
    
    .number {
      text-align: right;
    }
    
    tbody tr {
        border-bottom: 1px solid #dddddd;
    }
    
    tbody tr:nth-of-type(even) {
        background-color: #f3f3f3;
    }
  `}>
      <thead>
        <tr>
          <th>Requested</th>
          <th>Applied</th>
          <th className={"number"}>Odds</th>
          <th>Random Source</th>
          <th>Outcome</th>
        </tr>
      </thead>
      <tbody>
      {data.rolls.map((roll, idx) => {
        return <tr key={idx}>
          <td>
            <a href={`https://etherscan.io/tx/${roll.requestTxHash}`}>
              {format(fromUnixTime(roll.requestedAt), "yyyy-MM-dd HH:mm:ss")}
            </a>
          </td>
          <td>
            {roll.appliedAt ? <>
              <a href={`https://etherscan.io/tx/${roll.applyTxHash}`} title={format(fromUnixTime(roll.appliedAt), "yyyy-MM-dd HH:mm:ss")}>
                after {formatDistanceStrict(fromUnixTime(roll.appliedAt), fromUnixTime(roll.requestedAt))}
              </a>
            </> : null}
          </td>
          <td className={"number"}>
            {new Intl.NumberFormat("en-US", {
              style: 'percent', minimumFractionDigits: 2}).format(parseProbability(roll.probability).toNumber()) }
          </td>
          <td>
            {roll.useFallback ? "In-Chain" : "Chainlink VRF"}
          </td>
          <td>
            {roll.diagnoses.length == 0 ? <>No diagnosis.</> : null}
            {roll.diagnoses.length > 0
                ? <>
                    Diagnosed:{" "}
                    {roll.diagnoses.map((d, idx) => {
                      return <>{idx > 0 ? <>, </> : null}<a href={`https://opensea.io/assets/0xe0ba5a6fc8209e225a9937ce1dfb397f18ad402f/${d.tokenId}`}>{d.tokenId}</a></>
                    })}
                  </> : null}
          </td>
        </tr>
      })}
      </tbody>
    </table>;
  }

  return <MaxWidth>
    <Padding css={css`
    font-family: Varta, sans-serif;
    line-height: 1.5;
    font-size: 20px;
  `}>
      <div css={css`
      font-family: Courier, monospace;
      font-size: 14px;
      
      button {
        font-family: inherit;
        padding: 0.4em;
      }
    `}>
        <h1>
          [log]
        </h1>

        {content}
      </div>
    </Padding>
  </MaxWidth>
}


function TechStack() {
  return <div css={css`
    font-family: Varta,sans-serif;
    font-size: 18px;
    line-height: 1.5;
    font-weight: 300;
    margin: 80px 0 0px 0;
    background: #595551;
    color: white;
    
    h3 {
        margin-top: 0;
        margin-bottom: 0.5em;
        font-size: 35px;
        font-weight: 900;
    }
    .detail {
      font-size: 0.9em;
      margin-bottom: 50px;
    }
    
    .point {
      margin-bottom: 20px;
    }
    strong {
      font-weight: 700;
    }
    a {
      color: #fc79a5;
    }
    
    .section {
      margin-top: 30px;
    }
    
    .sectionHeader {
      font-weight: 900;
      font-size: 1.2em;
      border-bottom: 1px solid;
    }
    
    code {
      font-size: 0.9em;
      background: #36363477;
      padding: 0.2em;
    }
  `}>
    <Padding>
      <div className={"section"}>
        <h2>Technical Details</h2>

        <div>
          <div className={"sectionHeader"}>In-Chain Randomness</div>
          <p>
            The cheapest method is to use in-chain randomness, based on a future block hash. This can only be
            manipulated by miners.
          </p>
          <ol css={css`
             list-style: none;
             counter-reset: item;
             li {
               counter-increment: item;
               margin-top: 25px;
               margin-bottom: 25px;
               display: flex;
               flex-direction: row;
               
             }
             li:before {
              margin-right: 10px;
              margin-top: -10px;
              content: counter(item);
              width: 1em;
              height: 1em;
              padding: 0.2em;
              font-size: 2em;
              line-height: 1em;
              vertical-align: middle;
              text-align: center;
              display: inline-block;
             }
             
             .hint {
               font-size: .9em;
               margin-top: 0.5em;
               color: silver;
             }
          `}>
            <li>
              <div>
                <div>
                  Call the <code>requestRoll(true)</code> function.
                </div>
                <div className={"hint"}>
                  Then wait for 2 additional blocks to be mined.
                </div>
              </div>
            </li>
            <li>
              <div>
                After 2 blocks have been mined, call the <code>applyRoll()</code> function.
              </div>
            </li>
          </ol>
        </div>
      </div>

      <div>
        <div className={"sectionHeader"}>Chainlink VRF</div>
        <p>
          As an alternative, Chainlink VRF can be used as a source of randomness. This is more expensive, as it
          requires payment of LINK tokens.
        </p>
        <ol css={css`
             list-style: none;
             counter-reset: item;
             li {
               counter-increment: item;
               margin-top: 25px;
               margin-bottom: 25px;
               display: flex;
               flex-direction: row;
               
             }
             li:before {
              margin-right: 10px;
              margin-top: -10px;
              content: counter(item);
              width: 1em;
              height: 1em;
              padding: 0.2em;
              font-size: 2em;
              line-height: 1em;
              vertical-align: middle;
              text-align: center;
              display: inline-block;
             }
             
             .hint {
               font-size: .9em;
               margin-top: 0.5em;
               color: silver;
             }
          `}>
          <li>
            <div>
              <div>Fund the contract with 2 LINK.</div>
              <div className={"hint"}>
                Hint: Only fund the contract when you want to request randomness. Since anyone can call the contract
                as often as they want, it is easy to drain its balance.
              </div>
            </div>

          </li>
          <li>
            <div>
              <div>
                Call the <code>requestRoll(false)</code> function.
              </div>
              <div className={"hint"}>
                Wait roughly two minutes, then verify on-chain that Chainlink has provided a random number.
              </div>
            </div>
          </li>
          <li>
            <div>
              After a minute or two, call the <code>applyRoll()</code> function.
            </div>
          </li>
        </ol>
      </div>
    </Padding>
  </div>
}