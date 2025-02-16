import express from "express";

function waitForJwt(): Promise<string> {
  const app = express();

  return new Promise((resolve) => {
    app.get("/finish", async (req, res) => {
      if (!req.query.url || typeof req.query.url !== "string") {
        throw new Error("missing url");
      }
      const a = URL.parse(req.query.url);

      if (a === null) {
        throw new Error("Error parsing url");
      }

      const hash = a.hash.replace(/^#/, "");

      const parts = hash.split("&");

      const idTokenParam = parts.find((part) => part.startsWith("id_token="));

      if (!idTokenParam) {
        throw new Error("missing id_token");
      }

      const jwt = idTokenParam.replace("id_token=", "");

      resolve(jwt);
      res.send("ok!");
      server.close();
    });

    app.get("/oauth/plain", async (_req, res) => {
      res.contentType("text/html");
      res.send("<script>const a = encodeURIComponent(location.href); fetch('/finish/?url=' + a)</script>");
    });

    const server = app.listen(3000, () => console.log("Listening..."));
  });
}

export async function getJwtCmd(nonce: string) {
  const clientId = encodeURIComponent("866068535821-e9em0h73pee93q4evoajtnnkldsjhqdk.apps.googleusercontent.com");
  const responseType = "id_token";
  const ecope = encodeURIComponent("openid email");
  const redirectUri = encodeURI("http://localhost:3000/oauth/plain");
  const query = `?client_id=${clientId}&response_type=${responseType}&scope=${ecope}&redirect_uri=${redirectUri}&nonce=${nonce}`;

  console.log(`https://accounts.google.com/o/oauth2/v2/auth${query}`);

  const rawJwt = await waitForJwt();
  console.log(rawJwt);
}
