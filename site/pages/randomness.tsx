/** @jsxRuntime classic /
 /** @jsx jsx */
import React, {useEffect, useState} from "react";
import {css, jsx} from "@emotion/react";
import {Layout, MaxWidth, Padding} from "../lib/Layout";
import {useWeb3React} from "../lib/web3wallet/core";
import {useNFTContract} from "../lib/useNFTContract";


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
              Two transactions are required.
            </div>
            <div>
              Current probability (individual / collective):<br/> 4% / 33%
            </div>
            <div>
              Current reward:<br/> 0.3 ETH
            </div>
            <button>1. Request Randomness</button>
            <button>2. Apply Randomness</button>
          </div>
        </div>
      </div>
    </Padding>
  </MaxWidth>
}


export function Log(props: {
}) {
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

        <table css={css`
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
          
          tbody td:nth-child(3), tfoot td:nth-child(2), thead td:nth-child(3)  {
            text-align: right;
          }
          
          tbody tr {
              border-bottom: 1px solid #dddddd;
          }
          
          tbody tr:nth-of-type(even) {
              background-color: #f3f3f3;
          }
        `}>
          <tbody>
            <tr>
              <td>
                2022-03-12 14:22:00
              </td>
              <td>
                [request]
              </td>
              <td>
                [apply]
              </td>
              <td>
                3.45%
              </td>
              <td>
                -
              </td>
              <td>
                VRF
              </td>
              <td>
                No diagnosis.
              </td>
            </tr>

            <tr>
              <td>
                2022-03-12 14:22:00
              </td>
              <td>
                [request]
              </td>
              <td>
                [apply]
              </td>
              <td>
                3.45%
              </td>
              <td>
                -
              </td>
              <td>
                VRF
              </td>
              <td>
                No diagnosis.
              </td>
            </tr>
          </tbody>
        </table>
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
    margin: 0 0 100px 0;
    background: #595551;
    color: white;
    padding: 40px 0;
    
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