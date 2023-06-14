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
      <h1>Care Labels</h1>

      <p>October is Breast Cancer Awareness Month. This year, care labels are taking over the streets of London. Tied with a symbolic pink ribbon and resembling the labels found on bras, this initiative seeks to spread the word, raise awareness, and encourage positive dialogue.</p>

      <p>This initiative is a part of Project Mahin, which originally started as an NFT performance artwork raising funds for Breast Cancer charities, and is now bringing this concept beyond the virtual into physical spaces.</p>

      <h1>About Project Mahin</h1>

      <p>Experimenting with the technology of blockchain to create a virtual, autonomous work of art, Project Mahin is an ongoing performance piece that pairs dynamic art with the undiscriminating and distressing nature of breast cancer diagnoses.</p>

      <p>Project Mahin was initiated on March 21st, 2021 with an aim to raise awareness and funds for breast cancer research. A durational piece, set to last 10 years, the project has been created to honour the artist’s mother Mahin, who was diagnosed with breast cancer in late 2019.</p>

      <p>Launched on the same date as Mahin’s birthday, the project began with 60 illustrations of beautifully diverse and unique pairs of breasts. Over time, each pair of breasts will be subject to a 13% chance of developing invasive breast cancer. Project Mahin visualises this very real statistic by permanently transforming the diagnosed pairs into post-cancer, post-surgery breasts. As in life, which pair is ultimately affected is entirely random. The performance thus mirrors life’s indiscriminate selection, allowing owners to witness and experience the arbitrary character of a breast cancer diagnosis. This process draws its significance from the artwork's embrace of the underlying blockchain technology, which allows the process of diagnosis to be entirely outside of any human control.</p>

      <p>Each illustration is sold as an NFT, a non fungible token, which allows a digital file to become a unique item, by establishing public proof of ownership. This technology lends itself particularly well to the ever-evolving nature of this performance. When a work is sold, the profits are distributed to charities that are committed to furthering breast cancer research. The proceeds from the initial sale of the first 60 illustrations have been donated to Breast Cancer Now.</p>

      <p>5% of royalties from any sales on the secondary market are also donated to charity. This value is designed to increase to 15% if the illustration being sold has been diagnosed. This mechanism design was chosen to counteract market forces which would likely put a price premium on the diagnosed illustration due to their perceived rarity.</p>

      <p>For Breast Cancer Awareness Month 2021, a number of limited edition illustrations will be available for sale.</p>

    </Padding>
  </MaxWidth>
}