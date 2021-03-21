import * as injectedProviders from './providerdb/injectedProviders';
import {IProviderInfo} from "./providerdb/types";
import {getProviderInfo} from "./providerdb";


/**
 * We figure out the injected provider. This is a rewrite of the logic from web3modal:
 *
 * https://github.com/Web3Modal/web3modal/blob/2ff929d0e99df5edf6bb9e88cff338ba6d8a3991/src/helpers/utils.ts#L183
 */
export function detectInjectedProvider(): IProviderInfo {
  const enabledProviders = findAllEnabledProviders();

  if (!enabledProviders.length) {
    return injectedProviders.FALLBACK;
  }

  // Not sure why, but web3modal has this logic where it first chooses the non meta-mask/cipher option.
  if (
      enabledProviders.length > 1 && (
        enabledProviders[0] === injectedProviders.METAMASK.id ||
        enabledProviders[0] === injectedProviders.CIPHER.id
      )
  ) {
    return getProviderInfo(enabledProviders[1]);
  }

  return getProviderInfo(enabledProviders[0]);
}


/**
 * Run the detection function for each known injectable provider.
 */
function findAllEnabledProviders(): string[] {
  let result: string[] = [];
  Object.values(injectedProviders).forEach(provider => {
    const isAvailable = testInjectedProvider(provider.check);
    if (isAvailable) {
      result.push(provider.id);
    }
  });

  // const browser = env.detect();
  //
  // if (browser && browser.name === "opera") {
  //   result[injectedProviders.OPERA.check] = true;
  //   fallbackProvider = false;
  // }

  return result;
}

/** Run the test function of an injected prodider to determine if it is available. **/
export function testInjectedProvider(check: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const w: any = window as any;
  return w.ethereum
      ? w.ethereum[check]
      : w.web3 &&
      w.web3.currentProvider &&
      w.web3.currentProvider[check];
}