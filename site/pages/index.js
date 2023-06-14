import { css, jsx } from '@emotion/react'
import 'tippy.js/dist/tippy.css';
import {useState, Fragment} from 'react';
import {useWeb3React} from "../lib/web3wallet/core";
import {ConnectModal, getImperativeModal} from "../lib/ConnectModal";
import {getMintPrice, useMintPrice} from "../lib/useMintPrice";
import {Layout, LogoWithText, MaxWidth, Padding} from "../lib/Layout";
import {useSaleContract} from "../lib/useSaleContract";
import {useRouter} from "next/router";
import Link from "next/link";
import {Overview} from "../lib/Overview";
import {useProbabilities} from "../lib/useRandomState";
import {ClientOnly} from "../lib/ClientOnly";

export default function Home() {
  return (
    <Layout hideHeader={false}>
      <Hero />

      <SaleArea />
      <Mechanics />
      <Overview />
      <ArtistStatement />
      <TechStack />
    </Layout>
  )
}


function Hero() {
  const {probability, collectiveProbability} = useProbabilities();

  return <div css={css`
    background: #f63677;
    color: white;
    padding: 50px 0;
    
    font-family: Varta, sans-serif;
    text-align: center;
    
    h1 {
      font-size: 40px;
      margin-top: 45px;
      margin-bottom: 5px;
      line-height: 1.1;
    }
    p {
      font-size: 22px;
    }
    a {
      color: #f63677;
      font-weight: bold;
    }
    
    .divided {
      margin: 0 auto;
      display: flex;
      flex-direction: row;
      justify-content: space-evenly;
      align-items: center;
      text-align: center;
      gap: 50px;
    }

    .randomState {
      border-left: 1px solid #ffffffb0;
    }
    
    @media (max-width: 1000px) {
      .randomState {
        border-left: 0;
      }
      .divided {
        flex-direction: column;
      }
      .bncLogo {
        margin-top: 40px;
      }
    }    

    .heroText {
      text-align: left;
    }
    
    .divided .bncLogo {
      width: 250px;
    }
  `}
  >
    <MaxWidth>
      <Padding>
        <h1 css={css`
          max-width: 800px;
          margin: 0 auto;
          padding-bottom: 30px;
        `}>
          A unique blockchain experiment combining art, smart contracts and charity.
        </h1>
        <div className={"divided"}>          
          <div className="heroText">            
            <p css={css`
              font-size: 20px !important;
              line-height: 1.5em;
              margin: 0;
            `}>
              1 in 8 woman will develop invasive breast cancer over the course of their lives.
              60 unique illustrations represent women of every age and background, and face the same,
              unpredictable odds. When diagnosed, the token will permanently change state.
            </p>            
          </div>
          <div css={css`
              text-align: center;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;

              h4 {
                margin: 0;
                font-size: 20px !important;
                font-weight: 100;
              }
            `} className="randomState">
              <h4>Current risk of diagnosis</h4>              
              <div css={css`
                text-align: center;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: center;

                @media (max-width: 700px) {
                  flex-direction: column;
                  align-items: flex-end;
                }
  
                > div {
                    margin: 25px;
                    margin-top: 10px;
                }
                  
                @media (max-width: 700px) {
                  flex-direction: column;
                  align-items: flex-end;
                }
  
                strong {
                  font-weight: 300;
                  font-size: 0.9em;
                }
                .number {
                    font-size: 44px;
                }
                .detail {
                    font-size: 0.9em;
                }
              `}>
                <div>
                  <strong>individually</strong>
                  <div className={"number"}>
                    {probability ? <div>
                      {new Intl.NumberFormat("en-US", {
                        style: 'percent', minimumFractionDigits: 2}).format(probability.toNumber()) }
                    </div> : null}
                  </div>
                </div>
                <div>
                  <strong>collectively</strong>
                  <div className={"number"}>
                    {probability ? <div>
                      {new Intl.NumberFormat("en-US", {
                        style: 'percent', minimumFractionDigits: 2}).format(collectiveProbability.toNumber()) }
                    </div> : null}
                  </div>
                </div>
              </div>
            </div>

        </div>        

        <div>
          <a
              href={"https://marketplace.reservoir.tools/collection/ethereum/0xe0ba5a6fc8209e225a9937ce1dfb397f18ad402f"}
              css={css`
                margin-top: 40px;
                display: inline-block;
               background-color: #363634;
               color: white;
               border: 0;
               padding: 0.7em;
               border-radius: 2px;
               font-size: 18px;
              `}
          >
              Browse on reservoir.market
          </a>
        </div>
      </Padding>
    </MaxWidth>
  </div>
}


function formatMintPrice(price) {
  if (price) {
    // div leaves 3 decimal places.
    return parseInt(price.div("1000000000000000")) / 1000;
  } else {
    return undefined;
  }
}

function SaleArea() {
  const [mintPrice, _, numRemaining] = useMintPrice();  

  return <div css={css`
    font-family: Varta,sans-serif;
    font-size: 18px;
    line-height: 1.5;
    font-weight: 300;
    margin: 0px 0 0;
    padding: 20px 0 80px;
    
    h4 {
      text-align: left;
      font-size: 44px;
      margin-bottom: 0em;
    }
  `}>
    <MaxWidth>
      <Padding>
        <div css={css`
        `}>
          <h4>
            Become a Collector
          </h4>

          <div  css={css`
            display: flex;
            flex-direction: row;
          `}>
            <div css={css`
              strong {
                font-size: 1.3em;
                width: 3em;
                text-align: right;
              }

              div {
                display: inline-block;
                margin-right: 20px;
              }
            `}>
              <div><strong>{numRemaining}</strong> Remaining</div>
              <div><strong>60</strong> Total</div>
              <div><strong>Ξ {formatMintPrice(mintPrice)}</strong> Mint Price</div>
            </div>
          </div>

          <div css={css`margin-top: 30px; margin-bottom: 20px;`}>
            <ClientOnly><PurchaseButton /></ClientOnly>
          </div>

          <p css={css`font-size: 16px; max-width: 800px;`}>
            You will mint a random piece. 75% of the purchase price is donated {" "}
            <Link legacyBehavior href="/charity"><a>to charity</a></Link>. 
            The remaining 25% go to the project's <Link legacyBehavior href="/treasury"><a>treasury</a></Link>.
            The same split applies to any secondary sale royalties.
          </p>

          <div  css={css`
            display: flex;
            flex-direction: row;
          `}>
            <div>
              
            </div>
          </div>
        </div>
        </Padding>
    </MaxWidth>
  </div>
}

function ArtistStatement() {
  return <div css={css`
    h3 {
        font-size: 35px;
        font-weight: 900;
    }
    font-family: Varta, sans-serif;
    font-size: 18px;
    line-height: 1.6;
    font-weight: 300;
    padding: 100px 0px;
    margin: 0 0 0;
    background: #fcf6f6;
  `}>
    <Padding css={css`
       box-shadow: 3px 3px 8px 2px #ccc;
       background: white;
       max-width: 800px;
       margin: 0 auto;
    `}>
      <h3>
        <img src={"/icons/brush.png"} style={{height: '1.3em', paddingRight: '10px'}} />
        Artist Statement
      </h3>
      <p>
        One day, when I was eleven years old, I came home from school to find my mom crying. At the time, no one
        explained to me what happened, and I only later learnt that the reason: my aunt got breast cancer.
        After going through chemotherapy, surgery and radiotherapy, she was able to defeat the cancer.
      </p>
      <p>
        Then twenty years later, in late 2019, my mom was diagnosed with breast cancer as well.
        As a woman from the next generation, I am at a high risk of getting this cancer myself.
        While that seems frightening, when I look back and contrast my mom's with my aunt's treatment,
        I can see a big improvement. We have come a long way.
      </p>
      <p>
        I dedicate this project to my mom and to all those who have fought, are fighting and are continuing
        the fight against breast cancer.
      </p>
      <p>
        2020 was a tough year for everyone, but I know from my mom's personal experience that this time is especially
        hard on people fighting cancer. In addition to their illness, patients have to deal with all kinds of Covid-induced limitations.
        With this project we want them to know they are not alone.
      </p>
      <p>
        <img src={"/img/signature.png"} height={50} alt={"Artist Signature"} />
      </p>
    </Padding>
  </div>
}


function Mechanics() {
  return <div id={"mechanics"} css={css`
    font-family: Varta,sans-serif;
    font-size: 18px;
    line-height: 1.5;
    font-weight: 300;
    padding: 50px 0;
    background: #fafafa;
    
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
        
        .fact {
          display: grid;
          grid-template-columns: 220px auto;
          grid-template-rows: auto auto;
          align-items: center;
          margin: 20px 0;
        }
        
        .fact > .number {
          grid-column: 1;
          grid-row: 1;
          font-size: 44px;
          width: 200px;
          text-align: center;
        }
        
        .fact > .text {
          grid-column: 2;
          grid-row: 1;
          font-size: 23px;
        }
        
        .fact > .detail {
          grid-column: 2;
          grid-row: 2;
          color: #616161;
          font-size: 17px;
        }
      `}>
        <h3>Mechanics</h3>

        <div className={"fact"}>
          <div className={"number"}>
            1 in 8
          </div>
          <div className={"text"}>
            probability a woman will experience breast cancer.
          </div>
          <div className={"detail"}>
            Accordingly, there is a 1/8 chance for each NFT to be diagnosed. This is random and
            unpredictable, and the creators do not control the process or know the outcome.
          </div>
        </div>

        <div className={"fact"}>
          <div className={"number"}>
            60
          </div>
          <div className={"text"}>
            hand-designed, unique illustrations.
          </div>
          <div className={"detail"}>
            Each illustration is a lovingly created, one-of-a kind piece, and if diagnosed, will transform to
            represent a woman post-surgery. Because we cannot predict the outcome, two versions of each
            illustration have been created.
          </div>
        </div>

        <div className={"fact"}>
          <div className={"number"}>
            5<small>%</small> <small style={{fontSize: '0.7em', verticalAlign: 'middle', color: "gray"}}>/</small> 15<small>%</small>
          </div>
          <div className={"text"}>
            secondary market royalties, going to charity.
          </div>
          <div className={"detail"}>
            If a token is diagnosed, secondary sale royalties increase to 15%. All secondary sale royalties go to
            our charity partner, <a href={"https://breastcancernow.org/"}>Breast Cancer Now UK</a>.
          </div>
        </div>

        <div className={"fact"}>
          <div className={"number"}>
            10 years
          </div>
          <div className={"text"}>
            minimum runtime of the project.
          </div>
          <div className={"detail"}>
            While the artwork will exist on the blockchain forever, the randomness generator will gradually wind
            down after 10 years, making new diagnosis increasingly unlikely, while never excluding the possibility
            entirely.
          </div>
        </div>
      </div>
    </Padding>
  </div>
}


function TechStack() {
  const Contracts = [
     {
       label: 'NFT',
       address: '0xe0ba5a6fc8209e225a9937ce1dfb397f18ad402f',
       hasOpenSea: true
     },
    {
      label: 'DoctorV2',
      address: '0x155cf7a98b828fab0fa0ac51e42631e324ba0d69',
      isDeprecated: true,
    },
    {
      label: 'DoctorV3',
      address: '0x15afc6fb4b76727a725709d7cd61742e4c3d2897',
    },
    {
      label: 'CurveSeller',
      address: '0x47746e3563dc8c3ec09878907f8ce3a3f20082f0',
      isDeprecated: true,
    },
    {
      label: 'FixedPriceSeller',
      address: '0x62cab40ecc2afed09182c76a5b05d43d86f0a697',
    },
    {
      label: 'MintDateRegistry',
      address: '0x56819785480d6da5ebdff288b9b27475fe944bff',
    },
  ];
  return <div css={css`
    font-family: Varta,sans-serif;
    font-size: 18px;
    line-height: 1.5;
    font-weight: 300;
    margin: 0 0 100px 0;
    background: #595551;
    color: white;
    padding: 100px 0;
    
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
      <h3>Technical Details</h3>
      <div className={"detail"}>
        {
          Contracts.map((contract, idx) => {
            return <div css={css`
              display: flex;
              flex-direction: row;
              column-gap: 10px;
            `} key={idx}>
              <div>{contract.label}</div>
              <div>
                <span>
                  {contract.address || "(not deployed)"}
                </span>
                {" "}&bull;{" "}
                <span>
                  <a href={`https://etherscan.io/address/${contract.address}`}>Etherscan</a>
                </span>
                {contract.hasOpenSea ? <Fragment>
                  {" "}&bull;{" "}
                  <span>
                    <a href="https://marketplace.reservoir.tools/collection/ethereum/0xe0ba5a6fc8209e225a9937ce1dfb397f18ad402f">
                      reservoir.market
                    </a>
                  </span>
                </Fragment> : null}
              </div>
            </div>
          })
        }
      </div>

      <div className={"section"}>
        <div className={"sectionHeader"}>Randomness</div>
        <p>
          Chainlink VRF provides the randomness to the contract. The randomness generator can be triggered by anyone,
          at any time. In addition, there is a fallback randomness source based on block-randomness. See <Link legacyBehavior href={"/randomness"}><a>Randomness.</a></Link>
        </p>
      </div>

      <div className={"section"}>
        <div className={"sectionHeader"}>IPFS-hosted Content</div>
        <p>
          The artwork is stored in IPFS. In addition, there are placeholders in the contract that allow
          on-chain storage & <a href={"https://www.arweave.org/"}>Arweave</a> identifiers to be associated
          with each piece.
        </p>
      </div>

      <div className={"section"}>
        <div className={"sectionHeader"}>Royalties</div>
        <p>
          When Project Mahin was deployed, there was no accepted standard for NFT royalties. As a long-term project,
          we still wanted to future-proof it as much as possible by implementing multiple of the royalty systems
          in use at the time. Specifically, the contract exposes functions to implement these interfaces:
        </p>
        <ul>
          <li>EIP-2981 (pre-final version)</li>
          <li>Rarible</li>
          <li>Known Origin</li>
          <li>InfinityNFT</li>
        </ul>
        <p>
          We did not implement <a href={"https://github.com/ethereum/EIPs/issues/2571"}>ERC-2571</a>
          {" "} or <a href={"https://github.com/ethereum/EIPs/issues/2665"}>ERC-2665</a>. The former has the
          undesirable effect of disabling simple transfers, and the latter seems to lack traction.
        </p>
      </div>
    </Padding>
  </div>
}


function PurchaseButton() {
  const [busy, setBusy] = useState(false);
  const {library, active} = useWeb3React();
  const router = useRouter();
  const contract = useSaleContract();

  const doPurchase = async () => {
    const withSigner = contract.connect(library.getSigner());

    const [price] = await getMintPrice();
    let tx;

    try {
      tx = await withSigner.purchase({
        value: price,
        //gasLimit: 300000
      })
    } catch(e) {
      console.log(e);
      return;
    }

    let receipt;
    try {
      receipt = await tx.wait();
    } catch(e) {
      console.error(e);
      alert("Purchase failed.")
      return;
    }
    
    router.push('/thanks');
  }

  const [askToConnect, modalProps] = getImperativeModal();

  const handleClick = async () => {
    setBusy(true)
    try {
      if (active) {
        await doPurchase();
      } else {
        if (await askToConnect()) {
          //await doPurchase();
        }
      }
    }
    finally {
      setBusy(false)
    }
  }

  return <Fragment>
    <ConnectModal {...modalProps} />
    <button
      disabled={busy}
      onClick={handleClick}
      css={css`
       display: inline-block;
       background-color: #363634;
       color: white;
       border: 0;
       padding: 0.7em;
       border-radius: 2px;
       font-size: 18px;
      `}
    >
      {busy ? "Waiting..." : active ? "Purchase" : "Connect to Mint"}
    </button>
  </Fragment>
}
