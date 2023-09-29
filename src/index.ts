import { createHmac } from 'crypto';
import {
  IBuyer,
  IForm,
  IShippingAddress,
  IBillingAddress,
  ICallback
} from './interfaces';
import { PlatformType, ProductType } from './enums';

export class Shopier {
  private paymentUrl: string =
    'https://www.shopier.com/ShowProduct/api_pay4.php';
  private apiKey: string;
  private apiSecret: string;
  private buyer: IBuyer = {} as IBuyer;
  private orderBilling: IBillingAddress = {} as IBillingAddress;
  private orderShipping: IShippingAddress = {} as IShippingAddress;
  private currency: string = 'TRY';
  private moduleVersion: string = '1.0.4';

  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  setBuyer(fields: IBuyer) {
    this.buyer = fields;
    return this;
  }

  setOrderBilling(fields: IBillingAddress) {
    this.orderBilling = fields;
    return this;
  }

  setOrderShipping(fields: IShippingAddress) {
    this.orderShipping = fields;
    return this;
  }

  private generateIForm(amount: number): IForm {
    const args: IForm = {
      API_key: this.apiKey,
      website_index: 1,
      platform_order_id: this.buyer.platform_order_id ?? this.buyer.buyer_id_nr,
      product_name: this.buyer.product_name,
      product_type: ProductType.REAL_OBJECT || this.buyer.product_type,
      buyer_name: this.buyer.buyer_name,
      buyer_surname: this.buyer.buyer_surname,
      buyer_email: this.buyer.buyer_email,
      buyer_account_age: this.buyer.buyer_account_age ?? 0,
      buyer_id_nr: this.buyer.buyer_id_nr,
      buyer_phone: this.buyer.buyer_phone,
      billing_address: this.orderBilling.billing_address,
      billing_city: this.orderBilling.billing_city,
      billing_country: this.orderBilling.billing_country,
      billing_postcode: this.orderBilling.billing_postcode,
      shipping_address: this.orderShipping.shipping_address,
      shipping_city: this.orderShipping.shipping_city,
      shipping_country: this.orderShipping.shipping_country,
      shipping_postcode: this.orderShipping.shipping_postcode,
      total_order_value: amount,
      currency: this.currency,
      platform: PlatformType.IN_FRAME,
      is_in_frame: PlatformType.IN_FRAME,
      current_language: this.lang(),
      modul_version: this.moduleVersion,
      random_nr: Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000,
      signature: ''
    };

    const platformOrderId =
      this.buyer.platform_order_id ?? this.buyer.buyer_id_nr;
    const data =
      args.random_nr + platformOrderId + args.total_order_value + args.currency;

    const hmac = createHmac('sha256', this.apiSecret);
    hmac.update(data);
    const signatureBase64 = hmac.digest('base64');
    args.signature = signatureBase64;

    return args;
  }

  private recursiveHtmlStringGenerator(args: IForm): string {
    return Object.entries(args)
      .map(
        ([key, value]) => `<input type="hidden" name="${key}" value="${value}">`
      )
      .join('');
  }

  payment(amount: number): string {
    const obj = this.generateIForm(amount);
    return `<!doctype html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport"
    content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title></title>
    </head>
    <form id="shopier_payment_form" method="post" action="${this.paymentUrl}">
    ${this.recursiveHtmlStringGenerator(obj)}
    </form>
    <body>
    <script type="text/javascript">
    document.getElementById("shopier_payment_form").submit();
    </script>
    </body>
    </html>`;
  }

  setCurrency(currency: string) {
    this.currency = currency;
    return this;
  }

  private lang(): number {
    const current_language = 'tr-TR';
    let current_lan = 1;
    if (current_language == 'tr-TR') {
      current_lan = 0;
    }
    return current_lan;
  }

  callback(body: any, apiSecret: string): ICallback | boolean {
    const data = body.random_nr + body.platform_order_id;
    const hmac = createHmac('sha256', apiSecret);
    hmac.update(data);
    const expected = hmac.digest('base64');
    if (body.signature === expected) {
      if (body.status === 'success') {
        return {
          order_id: body.platform_order_id,
          payment_id: body.payment_id,
          installment: body.installment
        };
      } else {
        return false;
      }
    } else {
      throw new Error('Signature is not valid.');
    }
  }
}
