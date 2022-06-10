import crypto from 'crypto-js'

export default class Shopier {
  paymentUrl = 'https://www.shopier.com/ShowProduct/api_pay4.php'
  buyer = {}
  currency = 'TRY'
  moduleVersion = '1.0.4'

  constructor(apiKey, apiSecret) {
    this.apiKey = apiKey
    this.apiSecret = apiSecret
  }

  setBuyer(fields) {
    this.#buyerValidateAndLoad(this.#buyerFields(), fields)
  }

  setOrderBilling(fields) {
    this.#buyerValidateAndLoad(this.#orderBillingFields(), fields)
  }

  setOrderShipping(fields) {
    this.#buyerValidateAndLoad(this.#orderShippingFields(), fields)
  }

  #buyerValidateAndLoad(validationFields, fields) {
    Object.keys(validationFields).some(key => {
      if (validationFields[key] && !fields[key]) {
        throw new Error(`${key} is required`)
      }
      this.buyer[key] = fields[key]
    })
  }

  #buyerFields() {
    return {
      id: true,
      product_name: true,
      first_name: true,
      last_name: true,
      email: true,
      phone: true
    }
  }

  #orderBillingFields() {
    return {
      billing_address: true,
      billing_city: true,
      billing_country: true,
      billing_postcode: true
    }
  }
  #orderShippingFields() {
    return {
      shipping_address: true,
      shipping_city: true,
      shipping_country: true,
      shipping_postcode: true
    }
  }
  
  #generateFormObject(amount) {
    Object.keys(this.#buyerFields()).forEach(key => {
      if (!this.buyer[key]) {
        throw new Error(`${key} is required`)
      }
    })

    Object.keys(this.#orderShippingFields()).forEach(key => {
      if (!this.buyer[key]) {
        throw new Error(`${key} is required`)
      }
    })

    Object.keys(this.#orderBillingFields()).forEach(key => {
      if (!this.buyer[key]) {
        throw new Error(`${key} is required`)
      }
    })

    const args = {
      API_key: this.apiKey,
      website_index: 1,
      platform_order_id: this.buyer.id,
      product_name: this.buyer.product_name,
      product_type: 0, //1 : downloadable-virtual 0:real object,2:default
      buyer_name: this.buyer.first_name,
      buyer_surname: this.buyer.last_name,
      buyer_email: this.buyer.email,
      buyer_account_age: 0,
      buyer_id_nr: this.buyer.id,
      buyer_phone: this.buyer.phone,
      billing_address: this.buyer.billing_address,
      billing_city: this.buyer.billing_city,
      billing_country: this.buyer.billing_country,
      billing_postcode: this.buyer.billing_postcode,
      shipping_address: this.buyer.shipping_address,
      shipping_city: this.buyer.shipping_city,
      shipping_country: this.buyer.shipping_country,
      shipping_postcode: this.buyer.shipping_postcode,
      total_order_value: amount,
      currency: this.#getCurrency(),
      platform: 0,
      is_in_frame: 0,
      current_language: this.#lang(),
      modul_version: this.moduleVersion,
      random_nr: Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000
    }
    const data = args.random_nr + args.platform_order_id + args.total_order_value + args.currency
    const signature = crypto.HmacSHA256(data, this.apiSecret)
    const signatureBase64 = crypto.enc.Base64.stringify(signature)
    args.signature = signatureBase64
    return args
  }

  #recursiveHtmlStringGenerator(args) {
    let html = ''
    Object.keys(args).forEach(key => {
      html += `<input type="hidden" name="${key}" value="${args[key]}">`
    })
    return html
  }

  #generateForm(amount) {
    const obj = this.#generateFormObject(amount)
    return this.#recursiveHtmlStringGenerator(obj)
  }

  payment(amount) {
    const form = this.#generateForm(amount)
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
    ${form}
    </form>
    <body>
    <script type="text/javascript">
    document.getElementById("shopier_payment_form").submit();
		</script>
    </body>
    </html>`
  }

  #getCurrency() {
    return 'TRY'
  }

  #lang() {
    const current_language = 'tr-TR'
    let current_lan = 1
    if (current_language == 'tr-TR') {
      current_lan = 0
    }
    return current_lan
  }

  callback(body, apiSecret) {
    const data = body.random_nr + body.platform_order_id
    const signature = crypto.enc.Base64.parse(body.signature).toString()
    const expected = crypto.HmacSHA256(data, apiSecret).toString()
    console.log(signature, expected)
    if (signature === expected) {
      if (body.status == 'success') {
        console.log('başarılı')
        return {
          order_id: body.platform_order_id,
          payment_id: body.payment_id,
          installment: body.installment
        }
      } else {
        return false
      }
    } else {
      throw new Error('Signature is not valid.')
    }
  }
}

