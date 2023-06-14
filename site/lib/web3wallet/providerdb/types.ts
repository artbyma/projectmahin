import {StaticImageData} from "next/image";

export interface IProviderDisplay {
  name: string;
  logo: string | StaticImageData;
  description?: string;
}

export interface IProviderInfo extends IProviderDisplay {
  id: string;
  type: string | StaticImageData;
  description?: string;
  package?: any;
  check?: string;
}