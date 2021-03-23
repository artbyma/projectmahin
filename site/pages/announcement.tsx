/** @jsxRuntime classic /
 /** @jsx jsx */
import React, {useEffect, useState} from "react";
import {css, jsx} from "@emotion/react";
import {Layout, MaxWidth, Padding} from "../lib/Layout";
import {useWeb3React} from "../lib/web3wallet/core";
import {useNFTContract} from "../lib/useNFTContract";


export default function Announcement() {
  let content = <Content />;
  return (
      <Layout>
        {content}
      </Layout>
  )
}

export function Content(props: {
}) {
  return <MaxWidth>
    <Padding css={css`
      font-family: Varta, sans-serif;
      line-height: 1.5;
      font-size: 20px;
    `}>
      <h1>
        Using Chainlink to build an autonomous NFT art project
      </h1>
      <div>
        <img src={"/img/announcement-banner.png"} alt={"Blogpost Banner Image"} style={{width: '100%'}} />
      </div>
      <p>
        Project Mahin is a multi-year on-chain conceptual art experiment, fully embracing NFTs as a medium in their own right.
        We wanted to explore the ability of crypto art not only to be dynamic, but to autonomously change and evolve as it lives on the blockchain,
        with no external controls. In other words, we wanted our NFTs to have a life of their own on the Ethereum blockchain,
        and to model the unpredictability of life we needed a strong source of randomness.
      </p>
      <p>
        As randomness is notoriously difficult to get right on a blockchain, we have decided to integrate with Chainlink VRF (Verifiable Random Function).
        Their oracle network is able to deliver the random numbers our smart contract needs, in a way that cannot be manipulated even by miners.
      </p>
      <p>
        We have designed and minted 60 unique illustrations, each representing a pair of boobs, and each existing in an alternative version after surgery.
        Each NFT may be diagnosed with breast cancer; the likelihood of that happening matches the 1 in 8 women who will develop invasive breast cancer over
        the course of their lives. When this happens, the illustration will permanently update, and the secondary sale royalties of the NFT will increase to 15%.
        All royalties, in perpetuity, will go to our charity partner, Breast Cancer Now UK.
      </p>
      <div style={{textAlign: 'center'}}>
        <img src={"/img/announcement-diagram.png"} style={{width: '440px', textAlign: 'center'}} alt={"Two example images explaining the mechanism of how NFTs change"} />
      </div>
      <p>
        Chainlink is an oracle network which allows smart contracts, such as those minting crypto art NFTs, to have access to real world data. In addition to
        solving the oracle problem, they also offer Chainlink VRF, a service which generates provably-fair and verifiable random numbers.
      </p>
      <p>
        Having true randomness that cannot be manipulated was an important goal for us - we see this as a key part of the concept that we needed to get right.
      </p>
      <p>
        On a smart contract level, the randomness is a two step process. In the first instance, the contract is instructed to request a random number from Chainlink. While this is an unpermissioned call that can be sent by any Ethereum account, including any of the NFT owners, the caller needs to pay both the gas fees as well as the Chainlink VTF fee. We have decided not to design a Keeper-like incentive mechanism for this; instead, we believe that our partner charity, by receiving the secondary sale royalties, is sufficiently incentivized to handle the maintenance transactions.
      </p>
      <p>
        Once Chainlink VRF delivers a new random number, anyone can then trigger the second contract call, which will update the NFTs with a potential diagnosis.
      </p>
      <div style={{textAlign: 'center'}}>
        <img src={"/img/announcement-diagram2.png"} style={{height: '170px', textAlign: 'center'}} alt={"Diagram explaining the smart contract randomness generator logic."} />
      </div>
      <p>
        If you would like to be part of this first of its kind crypto art experiment, have a look at our website to get one of our 50 unique NFTs. In the process of doing so, you will be supporting Breast Cancer Now's life saving breast cancer research.
      </p>
      <p>
        <strong>Resources</strong>
      </p>
      <p>
        <strong>Chainlink</strong>: Learn more by visiting the <a href={"https://chain.link/"}>Chainlink website</a>,
        <a href={"https://twitter.com/chainlink"}>Twitter</a>, or <a href={"https://www.reddit.com/r/Chainlink/"}>Reddit</a>.
        If you’re a developer, visit the <a href={"https://docs.chain.link/"}>developer documentation</a> or
        join the technical discussion on <a href={"https://discord.gg/FGNyjhF"}>Discord</a>.
      </p>
      <p>
        <strong>Project Mahin</strong>: Learn more about our fully autonomous, collectively-experienced NFT art project on <a href={"https://by-ma.art/"}>our website</a>, or follow us <a href={"https://twitter.com/artbyma"}>on Twitter</a>.
      </p>
    </Padding>
  </MaxWidth>
}