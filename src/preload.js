const https = require("https");

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36";

function request(options, cb) {
  const req = https.request(options, function (res) {
    let html = "";
    res.setEncoding("utf-8");
    res.on("data", function (data) {
      html += data;
    });
    res.on("end", function () {
      cb(null, html);
    })
  });
  req.on('error', err => {
    cb(err);
  });
  req.end();
}
window.getEpicData = function () {
  return new Promise((resolve, reject) => {
    request({
      hostname: "store-site-backend-static.ak.epicgames.com",
      path: "/freeGamesPromotions?locale=zh-CN&country=CN&allowCountries=CN",
      port: 443,
      method: "GET",
      headers: {
        "user-agent": UA
      }
    }, function (err, body) {
      if (err) {
        reject(err);
      }
      resolve(JSON.parse(body));
    })
  })
}
