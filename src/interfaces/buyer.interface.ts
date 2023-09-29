import { ProductType } from '../enums/';

export interface IBuyer {
  buyer_id_nr: string;
  platform_order_id?: string;
  product_name: string;
  product_type?: ProductType;
  buyer_name: string;
  buyer_surname: string;
  buyer_email: string;
  buyer_phone: string;
  buyer_account_age?: number;
}
