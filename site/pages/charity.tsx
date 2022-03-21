/** @jsxRuntime classic /
 /** @jsx jsx */
import React, {useEffect, useState} from "react";
import {css, jsx} from "@emotion/react";
import {Layout, MaxWidth, Padding} from "../lib/Layout";
import {useWeb3React} from "../lib/web3wallet/core";
import {useNFTContract} from "../lib/useNFTContract";
import Link from "next/link";


export default function Charity() {
  return (
      <Layout>
        <CurrentPartner />
        <BreastCancerNow />
      </Layout>
  )
}

export function CurrentPartner(props: {
}) {
  return <div css={css`
    background: #363631;
    color: white;
    padding: 50px 0;

    a {
      color: white;
      text-decoration: underline;
    }
  `}>
    <MaxWidth>
      <Padding css={css`
        font-family: Varta, sans-serif;
        line-height: 1.5;
        font-size: 20px;
        
        .logo {
          width: 29vw;
          margin-right: 50px;
        }
      `}>
        <div css={css`
          display: flex;
          flex-direction: row;
          align-items: self-start;
          
          h2 {
            margin-top: 0px;
          }
          
          .right {
            flex: 1
          }
        `}>
          <div className={"right"}>
            <h2>
              Next Charity Partner?
            </h2>
            <p>
              We are searching for a charity for future projects; is there a breast cancer charity you feel
              passionate about? Let us know! In the meantime, any additional funds coming into the project
              now via sales or secondary sale royalties will be held.
            </p>
          </div>
        </div>
      </Padding>
    </MaxWidth>
  </div>
}

export function BreastCancerNow(props: {
}) {
  return <div css={css`
    background: #f63677;
    color: white;
    padding: 50px 0;
    
    a {
      color: white;
      text-decoration: underline;
    }
  `}>
    <MaxWidth>
      <Padding css={css`
        font-family: Varta, sans-serif;
        line-height: 1.5;
        font-size: 20px;
        
        .bncLogo {
          width: 29vw;
          margin-right: 50px;
          box-shadow: 3px 3px 7px 0px #353535;
        }
      `}>
        <div css={css`
          display: flex;
          flex-direction: row;
          align-items: self-start;
          
          .right {
            flex: 1
          }
          
          h2 {
            margin-top: 0px;
          }
        `}>
          <img
            className={"bncLogo"}
            src={"/img/bcn-certificate.jpeg"}
            alt={"Breast Cancer Now Logo"}
          />
          <div className={"right"}>
            <h2>March 2021 to August 2021</h2>
            <p>
              The initial partner for launch was the UK research and care charity
              {" "}<a href={"https://breastcancernow.org/"}>Breast Cancer Now</a>. We donated 75% of all sale
              proceeds, with the remainder going to the Project Mahin treasury to pay for future operating
              costs.
            </p>
            <p>
              In total, and after conversion from ETH, the amount donated to Breast Cancer Now was GBP 12,342.
            </p>
          </div>
        </div>
      </Padding>
    </MaxWidth>
  </div>
}