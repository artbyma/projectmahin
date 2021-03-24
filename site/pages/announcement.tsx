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
        Project Mahin Integrates Chainlink VRF to Dynamically Update NFT Art for Breast Cancer Awareness
      </h1>
      <div>
        <img src={"/img/announcement-banner.png"} alt={"Blogpost Banner Image"} style={{width: '100%'}} />
      </div>
      <p>
        <span>Project Mahin, a multi-year on-chain conceptual art experiment, has integrated the </span>
        <span className="c5">
						<a className="c1"
               href="ttps://chain.link/solutions/chainlink-vrf">Chainlink Variable Random Function</a>
					</span>
        <span className="c0">&nbsp;(VRF) on mainnet to dynamically update our breast cancer awareness NFTs. By integrating Chainlink&rsquo;s novel VRF solution for secure
          on-chain randomness, we ensure that our NFTs are dynamically updated in a tamper-proof and provably random manner. </span>
      </p>
      <p>
        Intended as a multi-year on-chain conceptual art experiment, Project Mahin fully embraces  NFTs as a medium in their own right.
        We have designed and minted 60 unique illustrations, each representing a pair of breasts and each existing in an alternative
        version after surgery. Each NFT may be diagnosed with breast cancer; the likelihood of that happening reflects the
        same 1-in-8 odds of women who will develop invasive breast cancer throughout their lives. When this happens, the illustration
        will permanently update, and the secondary sale royalties of the NFT will increase to 15%. All royalties, in perpetuity, will
        go to our charity partner, <a className="c1" href="https://breastcancernow.org/">Breast Cancer Now UK.</a>
      </p>
      <div style={{textAlign: 'center'}}>
        <img src={"/img/announcement-diagram.png"} style={{width: '50%', textAlign: 'center'}} alt={"Two example images explaining the mechanism of how NFTs change"} />
      </div>
      <h3>Securely Updating Our Dynamic NFTs With Chainlink VRF</h3>
      <p>
        We wanted to explore crypto art's ability to be dynamic and autonomously change and evolve as it lives on the blockchain with no
        external controls. In other words, we wanted our NFTs to have a life of their own on the Ethereum blockchain and model the
        unpredictability of life. Consequently, we needed a source of randomness to mimic the randomness of life. However, on-chain
        randomness is a notoriously challenging problem.
      </p>
      <p>
        Some smart contract applications have tried to leverage unpredictable on-chain parameters like block hash to generate randomness. However,
        miners can manipulate these processes by not publishing blocks with undesirable outcomes. Other protocols have attempted to bring off-chain
        sources of randomness on-chain, yet a centralized data provider can manipulate the source of randomness to their benefit.
      </p>
      <p>
        Updating our NFTs in a genuinely random way was a critical goal for us—we see this as a fundamental concept that we needed to get
        right for our NFTs to have a meaningful real-life representation of breast cancer's effect on women. After reviewing our options,
        we decided to use Chainlink VRF, as their entropy mechanism delivers on-chain randomness to our dynamic NFTs in a manner that
        users can verify as tamper-proof.
      </p>
      <p>
        On a smart contract level, Chainlink VRF works by combining block data that is still unknown when the request is made with the oracle
        node's pre-committed private key to generate both a random number and a cryptographic proof. Anyone can verify the cryptographic proof
        with the block data and oracle node public key to ensure that the entropy produced is authentic. Thus, the Chainlink oracles, Mahin
        team, or external entities cannot predict or manipulate the randomness to their own benefit. Once Chainlink VRF delivers a new random
        number, anyone can trigger the second contract call, which will update the NFTs with a potential breast cancer diagnosis.
      </p>
      <div style={{textAlign: 'center'}}>
        <img src={"/img/announcement-diagram2.png"} style={{width: '700px', maxWidth: '100%', textAlign: 'center'}} alt={"Diagram explaining the smart contract randomness generator logic."} />
      </div>
      <p>
        If you would like to be part of this first-of-its-kind crypto art experiment, have a look at our website to get one of our 50 unique NFTs. In the process
        of doing so, you will be supporting Breast Cancer Now UK’s life-saving breast cancer research.
      </p>
      <p>
        “By integrating Chainlink VRF, our breast cancer awareness NFTs will be dynamically updated in a provably random and tamper-proof
        process that mimics the real-life probability of a woman developing breast cancer. Anyone can verify the authenticity of the entropy
        generated by Chainlink VRF, creating a highly transparent process that is unrivalled by other randomness providers,” said Armaghan Fatemi, the artist behind the project.
        “We created this project intending to raise awareness for breast cancer, and we are pleased to be able to contribute all royalties
        to Breast Cancer Now UK.”
      </p>
      <h4>About Chainlink</h4>
      <p>
        Chainlink is the most widely used and secure way to power universally connected smart contracts. With Chainlink, developers can connect any blockchain with high-quality
        data sources from other blockchains as well as real-world data. Managed by a global, decentralized community of hundreds of thousands of people, Chainlink is
        introducing a fairer model for contracts. Its network currently secures billions of dollars in value for smart contracts across the decentralized finance (DeFi),
        insurance and gaming ecosystems, among others.
      </p>
      <p className="c3">
        <span className="c8">Chainlink is trusted by hundreds of organizations to deliver definitive truth via secure, reliable data feeds. </span>
        <span>To learn more, visit</span>
        <span className="c9">&nbsp;</span>
        <span className="c5">
								<a className="c1"
                   href="https://chain.link/">chain.link</a>
							</span>
        <span>, subscribe to the </span>
        <span className="c5">
								<a className="c1"
                   href="https://chn.lk/newsletter">Chainlink newsletter</a>
							</span>
        <span>, and follow</span>
        <span className="c9">&nbsp;</span>
        <span className="c5">
								<a className="c1"
                   href="http://www.twitter.com/chainlink">@chainlink</a>
							</span>
        <span className="c9">&nbsp;</span>
        <span className="c0">on Twitter.
								<br />
								</span>
      </p>
      <p className="c2">
								<span className="c5">
									<a className="c1"
                     href="https://docs.chain.link/docs/getting-started">Docs</a>
								</span>
        <span>&nbsp;|</span>
        <span>
									<a className="c1"
                     href="https://www.reddit.com/r/Chainlink/">&nbsp;</a>
								</span>
        <span className="c5">
									<a className="c1"
                     href="https://discordapp.com/invite/aSK4zew">Discord</a>
								</span>
        <span>&nbsp;| </span>
        <span className="c5">
									<a className="c1"
                     href="https://www.reddit.com/r/Chainlink/">Reddit</a>
								</span>
        <span>&nbsp;| </span>
        <span className="c5">
									<a className="c1"
                     href="https://www.youtube.com/channel/UCnjkrlqaWEBSnKZQ71gdyFA">YouTube</a>
								</span>
        <span>&nbsp;| </span>
        <span className="c5">
									<a className="c1"
                     href="https://t.me/chainlinkofficial">Telegram</a>
								</span>
        <span>&nbsp;| </span>
        <span className="c5">
									<a className="c1"
                     href="https://blog.chain.link/tag/events/">Events</a>
								</span>
        <span>&nbsp;|</span>
        <span>&nbsp;</span>
        <span className="c5">
									<a className="c1"
                     href="https://github.com/smartcontractkit/chainlink">GitHub</a>
								</span>
        <span className="c14">&nbsp;</span>
        <span>|</span>
        <span className="c14">&nbsp;</span>
        <span className="c5">
									<a className="c1"
                     href="https://feeds.chain.link/">Price Feeds</a>
								</span>
        <span className="c14">&nbsp;</span>
        <span>|</span>
        <span className="c14">&nbsp;</span>
        <span className="c5">
									<a className="c1"
                     href="https://www.chain.link/solutions/defi">DeFi</a>
								</span>
        <span>&nbsp;|</span>
        <span className="c14">&nbsp;</span>
        <span className="c5">
									<a className="c1"
                     href="https://chain.link/solutions/chainlink-vrf">VRF</a>
								</span>
      </p>
      <h4>About Project Mahin</h4>
      <p>
        Learn more about our fully autonomous, collectively-experienced crypto art project on <a href={"https://mahin.by-ma.art/"}>our website</a>, or follow us <a href={"https://twitter.com/artbyma"}>on Twitter</a>.
      </p>
    </Padding>
  </MaxWidth>
}