# Web-Monetization-Middleware

- [English](#English)

> node.js 上で Web Monetization 機能(Coil)を提供します。  
> このプロジェクトは [Web Monetization Access](https://github.com/sharafian/web-monetization-access) を元に作成しています。  
> sharafian に感謝いたします。

nodejs Express で Web Monetization を実行します。

ここではクリエイターがシステムに登録し、電子コンテンツをアップロード、公開、マネタイズするシステムを想定しています。

[Web Monetization Access](https://github.com/sharafian/web-monetization-access)に paymentId の概念を追加しました。  
Web Monetization で得た収益の情報は永続化され、クリエイターは Web Monetization のマネタイズ総額を確認できます。

Coil の現在の仕様では、直接コンテンツ製作者の ILP Pointer 対してマネタイズするとバックエンドは送り先と送金額を検証できないため、暗号化して ILP Pointer を管理する仕組みをとっています。

その為、独自拡張である PaymentId を実装し、コンテンツと ILP Pointer の紐付けを行っています。

また、Web Monetization バックエンドの分散化、サーバレス化を可能にするため、spspInstanceId を実装し、Web バックエンドの冗長化を可能にしています。

## Coil

Coil については[Coil.com](https://coil.com/)を参照して下さい。

## How it Works

1. 訪問者は[Coil Extension](https://help.coil.com/en/articles/2701494-supported-browsers)をインストールします。

1. 訪問者がページを訪れます。Coil が有効化されていなければ monetization イベントが発火されません。

1. Coil は Web Monetization meta tag を参照し、/pay に対して SPSP の詳細情報をリクエストします。

1. /pay は application/spsp4+json リクエストを許可し、`paymentPointer`,`web-monetization-id`,`paymentId`,`spspInstanceId` のメタデータが含まれた ILP アドレスを返します。

1. Coil がマネタイズを開始すると、バックエンドは Web Monetize を検証し `paymentPointer` に転送(payout)します

1. バックエンドは Coil と通して受け取ったマネタイズと、`paymentPointer` に転送した `monetize` を `paymentId` と紐付けし、KVS に永続化します。プライバシー保護と処理の簡素化のため、`web-monetization-id` の情報は一定時間後に破棄されます。

1. 訪問者は `web-monetization-id` を用い/pay/proof/:id にリクエストすることで、署名されたアクセストークン(JWT)を得ることができます。

1. バックエンドは JWT を検証し、Web Monetize が行われていれば/exclusive_image の配信を許可します。

### Installation and Setup

※現在 express にのみ対応しています

##### Coil Account

Web Monetize 受け取り用の ILP Pointer が必要です。

[Coil](https://coil.com/)もしくは[XrpTipBot](https://www.xrptipbot.com/)でアカウントを作成し、あなたの ILP Pointer を取得してください。

また、Coil Extension 等で Web Monetize の支払側(訪問者)になる場合は Coil のアカウントと Subscription を設定する必要があります。
[Coil Subscription](https://coil.com/settings/payment)

##### moneyd

moneyd の setup を行う必要があります。

```shell
npm install -g ilp-spsp ilp-spsp-server ilp-plugin-btp moneyd-uplink-coil moneyd
moneyd coil:configure
```

moneyd coil:configure で Coil のアカウント情報が尋ねられるので入力してください。  
このアカウントでバックエンドの ILP 送受金が行われます。

`moneyd`を起動します。

```shell
moneyd coil:start
```

##### redis

Redis v5 以上を推奨しています。

```shell
docker run --name redis -d -p 6379:6379 redis redis-server --appendonly yes
```

##### git clone

```shell
git clone git@github.com:U-TOP/web-monetization-middleware.git
cd web-monetization-middleware
yarn install
```

##### TypeScript

開発版の為、都度 tsc によるビルドを行っています。  
tsc が有効なことを確認してください。

##### config

```shell
cp .env.sample .env
```

.env を環境に合わせて書き換えて下さい。  
`EXAMPLE_PAYMENT_POINTER`にはあなたの ILP Pointer を指定して下さい。  
`EXAMPLE_PAYMENT_ID`は空白でなければなんでも構いません。  
Redis を使用しない場合は
`WEB_MONETIZE_STORE`と`WEB_PAYOUT_STORE`の設定を変更してください。

##### run

```shell
yarn run express
```

デフォルトで localhost:8080 で起動されます。  
Coil Extension を有効にしたブラウザでアクセスして下さい。

## Developer Documentation

開発者の方は `examples/express/index.js` を参照して下さい。  
Web Monetization のバックエンドを開始するコードが含まれています。

ここでの `paymentPointer` はクリエイターが自身が登録した ILP ポインターを指します。  
サンプルコードでは`EXAMPLE_PAYMENT_POINTER`で指定が可能です。
バックエンドが payout を行う ILP ポインターは moneyd でセットアップを行ったアカウントです。

web-monetization-middleware の動作は下記の通り行われます。

1. WebMonetize バックエンドを起動します。

```
const monetize = new Monetize();
await monetize.start();
```

2. SPSP に応答するルーティングを行います。

- /pay で行っていますが、URI は自由に設定可能です。GET リクエストであればクエリ文字列を含めることもできます。
- バックエンドはクエリ文字列を暗号化して p=で指定しています。
- `application/spsp4+json` リクエストを accept する必要があります。

3. Coil Client(Extension)が HTML head 内の `monetization meta` タグを見つけます

```
<meta name="monetization" content="http://localhost:8080/pay?p=xxxxxxxxxxxx">
```

4. Coil Client が content で指定された URI に SPSP リクエストを送信します。
5. バックエンドが `paymentPointer`,`paymentId`,`requestId(web-monetization-id)`,`spspInstanceId` を付与した ILP アドレスを返します。
6. Coil Client は ILP アドレスに対して送金を始めます。
7. バックエンドは ILP 送金を listen しており、受け取り額と payout 先(paymentPointer)を検証します。
8. バックエンドは受け取り後、payout を開始します。
9. 受け取り額と payout 額は Redis などによって永続化されます。

- Coil monetize はマイクロペイメントで行われるため、訪問者の Coil Client 数毎に約毎秒この動作が行われます。そのため RDB 等での永続化はコストがかかるため、インメモリデータストア で行います。

10. /pay/payouts にリクエストすると受け取り額と payout された総額が取得できます。

- アップロードした権利保有者のみ取得できるべきなのでユーザ認証等を実装することをおすすめいたします。

### English

Web-Monetization-Middleware

> We provide Web Monetization function (Coil) on node.js.  
> This project is based on Web Monetization Access.  
> We appreciate sharafian.

You can run CoilMonetization on node.js.
In addition to the functionality of Web Monetization Access, we apply a mechanism that allows you to verify the WEB Monetization on the backend and visualize the total amount of WEB Monetization for the content.

Here, we assumed that creators will register in the system, and upload electronic content, publish and monetize using the system.
By using this system, creators can check the total amount received at the web monetization and keep themselves motivated.

The current specification of CoilMonetization does not allow the backend verify the destination and the amount when monetizing directly to the content creator's ILP Pointer. So we apply the method to manage the ILP Pointer by encrypting. Therefore, we implement PaymentId,, is implemented and the content and ILP Pointer are linked.
Also, spspInstanceId is implemented to enable the web backend to be redundant to enable decentralization and serverless web backends.

## Coil

Visit coil.com for coil platform

## How itWorks

1. A Visitor needs to installs Coil Extension

2. A visitor visits the web page. If the Coil Extension has not been enabled, the monetization event will not be fired.
3. Coil Extension gets the web monetization meta tag and sends requests about the SPSP details to / pay.
4. / pay approves application/spsp4 + json requests, and will return an ILP address contains metadata for paymentPointer, web-monetization-id, paymentId, spspInstanceId.

5. When Coil Extension starts paying, the backend verify the Web Monetize and forwards it to paymentPointer(payout)

6. The backend receives the payment associates the payment received from Coil Extension and the monetize transferred to paymentPointer with paymentId and perpetuate it in KVS. For privacy protection and simplification of processing, the information on web-monetization-id will be discarded after a fixed period of time.

7. A visitor can obtain a signed access token (JWT) by sending a request to / pay / proof /: id. by web-monetization-id.

8. The backend verifies JWT and if WebMonetize is executed, / it will allow the exclusive_image distribution.

## Installation and Setup

※Currently only express is supported
Coil Account
You need ILP Pointer to receive Web Monetize.
Create an account with Coil or XrpTipBot and obtain your ILP Pointer

Also, you need to set up a Coil account and Subscription when you become a payer (visitor) of WebMonetize with CoilExtension etc., Coil Subscription

### moneyd

You need to set up moneyd.

```
npm install -g ilp-spsp ilp-spsp-server moneyd
moneyd coil:configure
```

Moneyd coil: configure will ask you for your Coil account information, so please input it. This account will send and receive backend ILP.

### Start moneyd.

```
moneyd coil:start
```

### redis

We recommend Redis v5 or higher.

```
docker run --name redis -d -p 6379:6379 redis redis-server --appendonly yes
```

### git clone

```
git clone git@github.com:U-TOP/web-monetization-middleware.git
cd web-monetization-middleware
yarn install
```

### TypeScript

Because it is a development version, it is built by tsc every time.
Make sure tsc is valid.

### config

```
cp .env.sample .env
```

Please rewrite .env according to the environment.

Please specify your ILP Pointer for `EXAMPLE_PAYMENT_POINTER`.

The `EXAMPLE_PAYMENT_ID` can be anything as long as it is not empty.

If you do not use Redis, change the settings of `WEB_MONETIZE_STORE` and `WEB_PAYOUT_STORE`

### run

```
yarn run express
```

The default is localhost: 8080.

Please access with a browser enabled CoilExtension

## Developer Documentation

For developers, see examples /express/index.js. It contains all the code that starts the web Monetization backend.
Here paym entPointer means the ILP pointer registered by the creator.

In the sample code, you can specify `EXAMPLE_PAYMENT_POINTER`. The ILP pointer where the backend pays out is the account is set up with oneyd.
The operation of web-monetization-middle are as follows,

1. Start the WebMonetize backend.

```
const monetize = new Monetize();
await monetize.start();
```

2. Routing responding to SPSP.

Although it is executed with /pay, URI can be set freely. You can also include a query string for GET requests.

The backend encrypts the query string and specifies it with p=.

You need to accept `application/spsp4+json` requests.

3. CoilClient (Extension) finds monetization meta tag in HTML head

```
<meta name="monetization" content="http://localhost:8080/pay?p=xxxxxxxxxxxx">
```

4. CoilClient sends an SPSP request to the URI specified by content.

5. The backend return the ILP address with paymentPointer, paymentId, requestId (web-monetization-id), spspInstanceId

6. CoilClient starts sending money to the ILP address.

7. The backend listens to ILP transmissions and verifies the amount received and payout destination (paym entPointer).

8. Backend will start payout after receiving.

9. The received amount and payout amount are perpetuated by Redis etc.

Currently, Coilmonetize is executed with micropayments, so this happens approximately every second for each visitor’s CoilClient. For this reason, the perpetuation in RDB etc. can be high cost, so it will be executed in an in-memory data store.

10. If you request to / pay / payouts, you can get the amount received and the total amount paid out.

We recommend that you implement user authentication, etc., since only rights holders who uploaded can obtain this.
