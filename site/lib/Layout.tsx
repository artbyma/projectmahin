/** @jsxRuntime classic /
 /** @jsx jsx */
import {Fragment} from "react";
import {css, jsx} from "@emotion/react";
import Head from "next/head";
import Link from "next/link";
import SvgLogo from "./Logo";

export function Layout(props: {
  hideHeader?: boolean,
  children: any
}) {
  return <Fragment>
    <Head>
      <title>Project Mahin</title>
      <link rel="icon" href="/favicon.ico" />
      {process.browser && <script defer async data-domain="mahin.by-ma.art" src="https://plausible.io/js/plausible.js" />}
    </Head>

    <div css={css`
    `}>
      {!props.hideHeader ? <Header /> : null}
      <Navigation />
    </div>

    <MainContent>
      {props.children}
    </MainContent>
  </Fragment>
}


export function LogoWithText() {
  return <div css={css`
    font-family: 'Hachi Maru Pop', cursive;
    font-style: normal;
    font-size: 55px;
    line-height: 56px;
    text-align: center;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    
    .text {
      text-align: left;
      margin-left: 15px;
    }
    
    @media (max-width: 700px) {
      svg {
        width: 90px !important;
        height: 90px !important;
      }
      font-size: 40px;
    }
  `}>
    <SvgLogo style={{width: '130px', height: '130px'}} />
    <div className={"text"}>Project<br />Mahin</div>
  </div>
}


function MainContent(props) {
  return <div css={css`
    background: white;
  `}>
    {props.children}
  </div>
}

function Header() {
  return <MaxWidth css={css`
    position: relative;

    .header {
      margin: 0 0 20px 0;
      font-family: 'Hachi Maru Pop', cursive;
      font-style: normal;
      font-size: 30px;
      font-weight: bold;
      line-height: 56px;
      text-align: center;
      color: #FFFFFF;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
    }

    .credit {
      color: #e0e0e0;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    > a {
      padding: 0 25px;
      color: white;
    }
    a:hover {
      text-decoration: underline;
    }
  `}>
    <div className={"header"}>
      <Link href={"/"}>
        <a href={""}>
          <SvgLogo style={{width: '1em', height: '1em', marginRight: '10px'}} color={"#f63677"} />
          Project Mahin
        </a>
      </Link>
    </div>

    <div style={{position: 'absolute', right: 40, top: 0, bottom: 0}} className={"credit"}>
      <div>
        <a href={"https://by-ma.art/"}>a BY MA project</a>
      </div>
    </div>
  </MaxWidth>
}

function Navigation() {
  return <MaxWidth css={css`
    color: black;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 13px 0 10px 0;
    line-height: 1;
    
    & > a {
      padding: 0 25px;
      color: black;
    }
    & > a:hover {
      text-decoration: underline;
    }
  `}>
    <Link href={"/"}><a>Home</a></Link>
    {/*<Link href={"/purchase"}><a>Purchase</a></Link>*/}
    <Link href={"/randomness"}><a>Randomness</a></Link>
    <Link href={"/charity"}><a>Charity</a></Link>
    <Link href={"/treasury"}><a>Treasury</a></Link>
    <a href={"https://twitter.com/artbyma"}>
      {/*<img style={{width: '16px'}} alt="svgImg" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4Igp3aWR0aD0iMjYiIGhlaWdodD0iMjYiCnZpZXdCb3g9IjAgMCAxNzIgMTcyIgpzdHlsZT0iIGZpbGw6IzAwMDAwMDsiPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0ibm9uemVybyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJidXR0IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS1kYXNoYXJyYXk9IiIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjAiIGZvbnQtZmFtaWx5PSJub25lIiBmb250LXdlaWdodD0ibm9uZSIgZm9udC1zaXplPSJub25lIiB0ZXh0LWFuY2hvcj0ibm9uZSIgc3R5bGU9Im1peC1ibGVuZC1tb2RlOiBub3JtYWwiPjxwYXRoIGQ9Ik0wLDE3MnYtMTcyaDE3MnYxNzJ6IiBmaWxsPSJub25lIj48L3BhdGg+PGcgZmlsbD0iI2ZmZmZmZiI+PHBhdGggZD0iTTE3MS4wNDM4NywzNi44NzU2Yy02LjIyNzc2LDIuNzY1MDMgLTEyLjkyMDY3LDQuNjI1NiAtMTkuOTQ5NTIsNS40NzgzN2M3LjE1ODA1LC00LjMxNTUxIDEyLjY4ODEsLTExLjExMTc4IDE1LjI3MjI0LC0xOS4yMjU5NmMtNi43MTg3NSwzLjk3OTU2IC0xNC4xNjEwNiw2Ljg3Mzc5IC0yMi4wNjg1MSw4LjQyNDI4Yy02LjMzMTEzLC02Ljc0NDU5IC0xNS4zNDk3NiwtMTAuOTU2NzMgLTI1LjM1MDM2LC0xMC45NTY3M2MtMTkuMTc0MjgsMCAtMzQuNzMwNzcsMTUuNTU2NDkgLTM0LjczMDc3LDM0LjczMDc3YzAsMi43MTMzNSAwLjMxMDEsNS4zNzUgMC45MDQ0NSw3LjkwNzQ2Yy0yOC44NjQ3OSwtMS40NDcxMiAtNTQuNDQ3NzIsLTE1LjI5ODA4IC03MS41ODA1MywtMzYuMzA3MDljLTIuOTk3Niw1LjE0MjQyIC00LjcwMzEyLDExLjExMTc4IC00LjcwMzEyLDE3LjQ5NDU5YzAsMTIuMDQyMDYgNi4xMjQ0LDIyLjY2Mjg2IDE1LjQ1MzEyLDI4Ljg5MDYyYy01LjcxMDk0LC0wLjE4MDg4IC0xMS4wNjAxLC0xLjczMTM3IC0xNS43MzczOCwtNC4zNDEzNWMwLDAuMTU1MDUgMCwwLjI4NDI2IDAsMC40MzkzMWMwLDE2LjgyMjcxIDExLjk2NDU0LDMwLjg1NDU2IDI3Ljg1Njk3LDM0LjA1ODg5Yy0yLjkyMDA3LDAuODAxMDggLTUuOTY5MzUsMS4yMTQ1NCAtOS4xNDc4MywxLjIxNDU0Yy0yLjI0ODIsMCAtNC40MTg4NywtMC4yMDY3MyAtNi41Mzc4NiwtMC42MjAxOWM0LjQxODg3LDEzLjc3MzQ0IDE3LjIzNjE3LDIzLjg1MTU2IDMyLjQzMDg4LDI0LjEwOTk3Yy0xMS44NjExNyw5LjMyODcyIC0yNi44NDkxNSwxNC44NTg3OCAtNDMuMTI5MjEsMTQuODU4NzhjLTIuODE2NzEsMCAtNS41NTU4OSwtMC4xNTUwNSAtOC4yNjkyMywtMC40NjUxNWMxNS4zNDk3Niw5Ljg0NTU2IDMzLjYxOTU5LDE1LjU4MjMzIDUzLjIzMzE3LDE1LjU4MjMzYzYzLjg3OTgxLDAgOTguODE3MzEsLTUyLjkyMzA4IDk4LjgxNzMxLC05OC43OTE0N2MwLC0xLjUyNDYzIC0wLjAyNTg0LC0zLjAyMzQ0IC0wLjEwMzM3LC00LjUyMjIzYzYuNzk2MjgsLTQuODU4MTcgMTIuNjg4MSwtMTAuOTgyNTggMTcuMzM5NTQsLTE3Ljk1OTc0Ij48L3BhdGg+PC9nPjwvZz48L3N2Zz4="/>*/}
      Contact
    </a>
  </MaxWidth>
}

export function MaxWidth(props) {
  return <div className={props.className} css={css`
    margin: 0 auto;
    max-width: 1200px;
  `}>
    {props.children}
  </div>
}

export function Padding(props) {
  return  <div className={props.className} css={css`
    padding: 20px 80px;
    
    @media (max-width: 700px) {
      padding: 10px 20px;
    }
  `}>
    {props.children}
  </div>
}
