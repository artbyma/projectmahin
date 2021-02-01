/**
 * Define name/logo etc. for each provider we support (through the underlying web3-react).
 */


import WalletConnectLogo from "./logos/walletconnect-circle.svg";
import PortisLogo from "./logos/portis.svg";
import FortmaticLogo from "./logos/fortmatic.svg";
import ArkaneLogo from "./logos/arkane.svg";
import TorusLogo from "./logos/torus.svg";
import AuthereumLogo from "./logos/authereum.svg";
import BurnerWalletLogo from "./logos/burnerwallet.png";
import MEWwallet from "./logos/mewwallet.png";
import DcentWalletLogo from "./logos/dcentwallet.png";
import BitskiLogo from "./logos/bitski.svg";
import FrameLogo from "./logos/frame.svg";
import { FALLBACK } from "./detectInjected";
import Web3DefaultLogo from "./logos/web3-default.svg";


export interface IProviderDisplay {
  name: string;
  logo: string;
  description?: string;
}

export interface IProviderInfo extends IProviderDisplay {
  id: string;
  type: string;
  description?: string;
  package?: any;
}

export const WALLETCONNECT: IProviderInfo = {
  id: "walletconnect",
  name: "WalletConnect",
  logo: WalletConnectLogo,
  type: "qrcode",
};

export const PORTIS: IProviderInfo = {
  id: "portis",
  name: "Portis",
  logo: PortisLogo,
  type: "web",
};

export const FORTMATIC: IProviderInfo = {
  id: "fortmatic",
  name: "Fortmatic",
  logo: FortmaticLogo,
  type: "web",
};

export const TORUS: IProviderInfo = {
  id: "torus",
  name: "Torus",
  logo: TorusLogo,
  type: "web",
};

export const ARKANE: IProviderInfo = {
  id: "arkane",
  name: "Arkane",
  logo: ArkaneLogo,
  type: "web",
  package: {
    required: ["clientId"]
  }
};

export const AUTHEREUM: IProviderInfo = {
  id: "authereum",
  name: "Authereum",
  logo: AuthereumLogo,
  type: "web",
};

export const WALLETLINK: IProviderInfo = {
  id: "walletlink",
  name: "WalletLink",
  logo: Web3DefaultLogo,
  type: "web",
};

export const BURNERCONNECT: IProviderInfo = {
  id: "burnerconnect",
  name: "Burner Connect",
  logo: BurnerWalletLogo,
  type: "web",
};

export const MEWCONNECT: IProviderInfo = {
  id: "mewconnect",
  name: "MEW wallet",
  logo: MEWwallet,
  type: "qrcode",
  package: {
    required: [["infuraId", "rpc"]]
  }
};

export const DCENT: IProviderInfo = {
  id: "dcentwallet",
  name: "D'CENT",
  logo: DcentWalletLogo,
  type: "hardware",
  package: {
    required: ["rpcUrl"]
  }
};

export const TREZOR: IProviderInfo = {
  id: "trezor",
  name: "Trezor",
  logo: Web3DefaultLogo,
  type: "hardware",
};

export const LEDGER: IProviderInfo = {
  id: "ledger",
  name: "Ledger",
  logo: Web3DefaultLogo,
  type: "hardware",
};

export const LATTICE: IProviderInfo = {
  id: "lattice",
  name: "Lattice",
  logo: Web3DefaultLogo,
  type: "hardware",
};

export const BITSKI: IProviderInfo = {
  id: "bitski",
  name: "Bitski",
  logo: BitskiLogo,
  type: "web",
  package: {
    required: ["clientId", "callbackUrl"]
  }
};

export const FRAME: IProviderInfo = {
  id: "frame",
  name: "Frame",
  logo: FrameLogo,
  type: "web",
};


const providerInfoById = [
  WALLETCONNECT,
  PORTIS,
  FORTMATIC,
  TORUS,
  ARKANE,
  AUTHEREUM,
  BURNERCONNECT,
  MEWCONNECT,
  DCENT,
  LEDGER,
  LATTICE,
  TREZOR,
  BITSKI,
  FRAME,
  WALLETLINK
].reduce((d, item) => { d[item.id] = item; return d; }, {})


/**
 * We give each supported provider an ID. Use it to query the info we have about this
 * provider, such as the name or logo.
 */
export function getProviderInfo(id: string): IProviderInfo {
  const info = id == 'injected' ? FALLBACK : providerInfoById[id];
  if (!info) {
    throw new Error(`Invalid provider id: ${id}`);
  }
  return {
    ...info,
    description: getProviderDescription(info)
  }
}

export function getProviderDescription(
    providerInfo: Partial<IProviderInfo>
): string {
  if (providerInfo.description) {
    return providerInfo.description;
  }
  let description = "";
  switch (providerInfo.type) {
    case "injected":
      description = `Connect to your ${providerInfo.name} Wallet`;
      break;
    case "web":
      description = `Connect with your ${providerInfo.name} account`;
      break;
    case "qrcode":
      description = `Scan with ${providerInfo.name} to connect`;
      break;
    case "hardware":
      description = `Connect to your ${providerInfo.name} Hardware Wallet`;
      break;
    default:
      break;
  }
  return description;
}