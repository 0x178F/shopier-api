import { IBuyer, IShippingAddress, IBillingAddress } from './';

export interface IForm extends IBuyer, IShippingAddress, IBillingAddress {
  API_key: string;
  website_index: number;
  total_order_value: number;
  currency: number;
  platform: number;
  is_in_frame: number;
  current_language: number;
  modul_version: string;
  random_nr: number;
  signature: string;
  product_name: string;
}
