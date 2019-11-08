const debug = require("debug-logger")("Web-Monetization-Middleware:express example");

const WebMonetizationMiddleware = require("../../build/index.js").default;
const express = require("express");
const uuid = require("uuid/v4");
const jwt = require("jsonwebtoken");
const fs = require("fs");

(async() => {
  try {
    // monetization
    // ---------------------------------
    const monetization = new WebMonetizationMiddleware();

    // monetization start
    // ---------------------------------
    await monetization.start();

    // express router
    // ---------------------------------
    const router = express.Router();

    // index
    // ---------------------------------
    router.get("/", async(req, res, next) => {
      // http or https
      // ---------------------------------
      const protocol = req.protocol;

      // Set PaymentPointer corresponding to the content
      // ---------------------------------
      const paymentPointer = monetization.config.examplePaymentPointer;
      const paymentId = monetization.config.examplePaymentId || uuid();

      // This prevents unauthorized paymentpointers from being injected
      // ---------------------------------
      const paymentTag = await monetization.spsp.getPaymentTag({
        paymentPointer,
        paymentId,
      });

      // PaymentPointerUri
      // ---------------------------------
      const paymentPointerUri = `${protocol}://${monetization.config.host}:${monetization.config.port}/pay?p=${paymentTag}`;

      // render
      // ---------------------------------
      res.render("index", { paymentPointerUri, paymentPointer, paymentId });
    });

    // spsp
    // ---------------------------------
    router.options("/pay", function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "web-monetization-id");
      res.send(200);
    });

    router.get("/pay", async(req, res, next) => {
      // application/spsp4+json only
      // ---------------------------------
      if (req.get("accept") !== "application/spsp4+json") {
        res.status(400);
        res.send("only application/spsp4+json is supported");
        throw new Error("only application/spsp4+json is supported");
      }

      // parse params
      // ---------------------------------
      const paymentTag = req.query["p"]; // encoded payment pointer tag
      const requestId = req.get("web-monetization-id") || uuid(); // web-monetization-id from coil client is given
      if (!paymentTag) throw new Error("encryptedPaymentTag is required");

      // getSPSPDetail
      // ---------------------------------
      const spspDetail = await monetization.spsp.getSPSPDetail({ paymentTag, requestId });

      // response
      // ---------------------------------
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Content-Type", "application/spsp4+json");
      res.send(spspDetail);
    });

    // web monetization access
    // ---------------------------------
    router.get("/exclusive_image", async(req, res, next) => {
      // parse params
      // ---------------------------------
      // const contentId = req.params.id;
      const { authorization } = req.headers;
      const token = authorization.substring("Bearer ".length);

      res.set({
        "access-control-allow-origin": "*",
        "access-control-allow-headers": "authorization",
      });

      // payment proofを確認します
      // ---------------------------------
      const cost = 300;

      jwt.verify(
        token,
        monetization.proof.publicKey, {
          algorithms: ["ES256"],
        },
        (error, decoded) => {
          // 設定したcost以上のpaymentがなければ配信されません
          // ---------------------------------
          if (error || decoded.total <= cost) return res.status(402).send();

          // monetizationが行われていれば画像リソースを配信
          // ---------------------------------
          res.status(200);
          res.json({
            type: "png",
            image: fs.readFileSync(__dirname + "/exclusive_image.png"),
          });
        }
      );
    });

    // proof
    // ---------------------------------
    router.get("/pay/proof/:id", async(req, res, next) => {
      // parse params
      // ---------------------------------
      const requestId = req.params.id;

      // getProofData
      // ---------------------------------
      const { data, token } = await monetization.proof.getProofData({ requestId });

      // response
      // ---------------------------------
      res.send({
        data,
        token,
      });
    });

    // public key
    // ---------------------------------
    router.get("/pay/public_key", async(req, res, next) => {
      res.send(monetization.proof.publicKey);
    });

    // payouts
    // If paymentid is specified for each user or content, query here
    // ---------------------------------
    router.get("/pay/payouts", async(req, res, next) => {
      // user auth
      // ---------------------------------
      // user info
      // ---------------------------------
      // user contents
      // ---------------------------------
      // user contents payment ids
      // ---------------------------------
      const paymentIds = [monetization.config.examplePaymentId];

      // get payouts
      // ---------------------------------
      const payouts = {};

      for (let paymentId of paymentIds) {
        const payout = await monetization.webPayoutStore.getItem(paymentId);
        debug(`${paymentId} payout:${payout}`);
        payouts[paymentId] = payout;
      }

      res.json(payouts);
    });

    // express app
    // ---------------------------------
    const app = express();
    app.set("views", __dirname + "/views"); // general config
    app.set("view engine", "ejs");
    app.use(router);
    app.listen(monetization.config.port);

    debug(`Listen on ${monetization.config.port}`);
  }
  catch (e) {
    debug.error(e);
  }
  finally {
    // await monetization.end();
  }
})();
