# Shopier Api

## Usage:

```bash
npm install shopier-api
```

#### Create an instance of the Shopier class.

```javascript
import Shopier from 'shopier-api';

const shopier = new Shopier('apiKey', 'apiSecret');
```

#### Set the buyer's information.

```javascript
shopier.setBuyer({
  buyer_id_nr: '010101',
  product_name: 'Balance',
  buyer_name: 'Fatih',
  buyer_surname: 'Akdoğan',
  buyer_email: 'mail@mail.com',
  buyer_phone: '05555555555'
});
```

#### Set buyer's billing address.

```javascript
shopier.setOrderBilling({
  billing_address: 'Kennedy Caddesi No:2592',
  billing_city: 'Istanbul',
  billing_country: 'Türkiye',
  billing_postcode: '34000'
});
```

#### Set buyer's shipping address.

```javascript
shopier.setOrderShipping({
  shipping_address: 'Kennedy Caddesi No:2592',
  shipping_city: 'Istanbul',
  shipping_country: 'Türkiye',
  shipping_postcode: '34000'
});
```

#### How much will the customer pay?

#### For 15₺:

```javascript
const paymentPage = shopier.payment(15);
```

> This will return the purchase form as html.

#### If we give an example for Express JS:

```javascript
app.get('/pay', (req, res) => {
  res.end(paymentPage);
});
```

> Now that we have render the html, a callback will be required after checkout.

```javascript
app.post('/callback', (req, res) => {
  const callback = shopier.callback(req.body, 'apiSecret');
});
```

#### If payment was successful, it will return order_id, payment_id, installment.

```
{ order_id: 10592, payment_id: 413449826, installment: 0 }
```
