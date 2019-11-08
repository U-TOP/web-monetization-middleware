# Web-Monetization-Middleware

> node.js 上で Web Monetization 機能(Coil)を提供します。  
> このプロジェクトは [Web Monetization Access](https://github.com/sharafian/web-monetization-access) を元に作成しています。  
> sharafian に感謝いたします。

nodejs Express で Web Monetization を実行します。  

ここではクリエイターがシステムに登録し、電子コンテンツをアップロード、公開、マネタイズするシステムを想定しています。  

[Web Monetization Access](https://github.com/sharafian/web-monetization-access)にpaymentIdの概念を追加しました。  
Web Monetizationで得た収益の情報は永続化され、クリエイターはWeb Monetization のマネタイズ総額を確認できます。

Coilの現在の仕様では、直接コンテンツ製作者の ILP Pointer 対してマネタイズするとバックエンドは送り先と送金額を検証できないため、暗号化して ILP Pointer を管理する仕組みをとっています。

その為、独自拡張である PaymentId を実装し、コンテンツと ILP Pointer の紐付けを行っています。  

また、Web Monetization バックエンドの分散化、サーバレス化を可能にするため、spspInstanceId を実装し、Web バックエンドの冗長化を可能にしています。

## Coil

Coilについては[Coil.com](https://coil.com/)を参照して下さい。  

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
