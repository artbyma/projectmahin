/** @jsxRuntime classic /
 /** @jsx jsx */
import React, {useEffect, useState} from "react";
import {css, jsx} from "@emotion/react";
import {Layout, MaxWidth, Padding} from "../lib/Layout";
import {useWeb3React} from "../lib/web3wallet/core";
import {useNFTContract} from "../lib/useNFTContract";
import Link from "next/link";


export default function Treasury() {
  let content = <Content />;
  return (
      <Layout>
        {content}
      </Layout>
  )
}

function Content() {
  return <div id={"treasury"} css={css`
    font-family: Varta,sans-serif;
    font-size: 18px;
    line-height: 1.5;
    font-weight: 300;
    padding: 50px 0;
    
    h3 {
        margin-top: 0;
        margin-bottom: 50px;
        font-size: 35px;
        font-weight: 900;
        text-align: center;
        display: flex;
        justify-content: center;       
        align-items: center;       
    }
      h3:before, h3:after { 
        content: ""; 
        width: 200px;
        margin: 0 0.2em;
        border-bottom: 1px solid #000;
      } 
    
    .point {
      margin-bottom: 20px;
    }
    strong {
      font-weight: 700;
    }
  `}>
    <Padding>
      <div css={css`
        max-width: 800px;
        margin: 0 auto;
            
      `}>
        <h3>Treasury</h3>

        <p>
          <strong>
            <a href="https://etherscan.io/address/0x83cB05402E875B5ca953e6eAa639F723d92BC4fc">Charity Wallet</a>
          </strong>:
          75% of the proceeds of every sale go to this wallet. They are then converted to fiat if necessary, and sent
          to our <Link href={"/charity"}><a>charity partner</a></Link>.

          {/* See also the tx log */}
        </p>

        <p>
          <strong>
            <a href="https://etherscan.io/address/0x336d967ffd8984fb1b00a9e4d17823ae4e068f8a">Treasury Wallet</a>
          </strong>:
          25% of the proceeds of every sale are retained by
          the <a href={"https://etherscan.io/address/0xe0ba5a6fc8209e225a9937ce1dfb397f18ad402f"}>smart contract</a>{" "}
          and are withdrawn to the treasury in regular intervals.
        </p>
        <table css={css`
          width: 100%;
          border-collapse: collapse;
          margin: 25px 0;
          font-size: 0.9em;
          font-family: sans-serif;
          min-width: 400px;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
          
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
          
          tbody tr:last-of-type {
              border-bottom: 2px solid #f63677;
          }
        `}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Tx</th>
              <th>Amount</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2022-02-08</td>
              <td>
                <a href={"https://etherscan.io/tx/0x3a290ecccacd5433edd7df29b64f1ea158520bd733ae35b9aea151e72100f4c3"}>0x3a2</a>
              </td>
              <td>
                +3.1375 ETH
              </td>
              <td>Opening of Treasury Wallet, Initial Balance</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2}>
                <strong>Wallet Balance</strong>
              </td>
              <td>
                3.1375 ETH
              </td>
            </tr>
            <tr>
              <td colSpan={2}>
                <strong>Sales Contract Balance</strong>
              </td>
              <td>
                0.1625 ETH
              </td>
            </tr>
            <tr>
              <td colSpan={2}>
                <strong>Total Treasury Balance:</strong>
              </td>
              <td>
                3.3 ETH
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Padding>
  </div>
}