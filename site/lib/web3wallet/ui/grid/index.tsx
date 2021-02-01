import styled from '@emotion/styled'
import {ThemeColors} from "./types";
import {Connector} from "./Connector";
import {getProviderInfo, IProviderInfo} from "../../providerMetadata";

export interface IThemeConfig {
  name: string;
  colors: ThemeColors;
}

export type ThemesList = {
  [name: string]: IThemeConfig;
};

const darkTheme: IThemeConfig = {
  name: "dark",
  colors: {
    background: "rgb(39, 49, 56)",
    main: "rgb(199, 199, 199)",
    secondary: "rgb(136, 136, 136)",
    border: "rgba(195, 195, 195, 0.14)",
    hover: "rgb(16, 26, 32)"
  }
};

const lightTheme: IThemeConfig = {
  name: "light",
  colors: {
    background: "rgb(255, 255, 255)",
    main: "rgb(12, 12, 13)",
    secondary: "rgb(169, 169, 188)",
    border: "rgba(195, 195, 195, 0.14)",
    hover: "rgba(195, 195, 195, 0.14)"
  }
};

export const themesList: ThemesList = {
  default: lightTheme,
  [lightTheme.name]: lightTheme,
  [darkTheme.name]: darkTheme
};


interface IModalCardStyleProps {
  show?: boolean;
  themeColors: ThemeColors;
  maxWidth?: number;
}

const SModalCard = styled.div<IModalCardStyleProps>`
  position: relative;
  width: 100%;
  background-color: ${({ themeColors }) => themeColors.background};
  border-radius: 12px;
  margin: 10px;
  padding: 0;
  opacity: ${({ show }) => (show ? 1 : 0)};
  visibility: ${({ show }) => (show ? "visible" : "hidden")};
  pointer-events: ${({ show }) => (show ? "auto" : "none")};
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  max-width: ${({ maxWidth }) => (maxWidth ? `${maxWidth}px` : "800px")};
  min-width: fit-content;
  max-height: 100%;
  overflow: auto;
  @media screen and (max-width: 768px) {
    max-width: ${({ maxWidth }) => (maxWidth ? `${maxWidth}px` : "500px")};
    grid-template-columns: 1fr;
  }
`;

export function Grid(props: {
  themeColors: ThemeColors,
  providers: (string|IProviderInfo)[],
  onClick: (id: string) => void
}) {
  const {themeColors, providers} = props;

  const resolvedProviders = providers.map(provider => {
    return typeof provider == 'string' ? getProviderInfo(provider) : provider;
  })

  return <SModalCard
    themeColors={themeColors}
    maxWidth={resolvedProviders.length < 3 ? 500 : 800}
    show={true}
  >
    {resolvedProviders.map(providerInfo =>
        !!providerInfo ? (
            <Connector
                key={providerInfo.id}
                name={providerInfo.name}
                logo={providerInfo.logo}
                description={providerInfo.description}
                themeColors={themeColors}
                onClick={() => props.onClick(providerInfo.id)}
            />
        ) : null
    )}
  </SModalCard>
}