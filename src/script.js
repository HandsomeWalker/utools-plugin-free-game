import handsome from "handsome-exception";

const EPIC_URL = "https://store.epicgames.com/zh-CN/free-games";
const ITEM_URL_PREFIX = "https://store.epicgames.com/zh-CN/p/";

function loading() {
  const html = `<div class="loading">
    <div><span></span></div>
    <div><span></span></div>
    <div><span></span></div>
</div>`;
  document.body.innerHTML = html;
}
function open(url) {
  utools.shellOpenExternal(url);
}
function getData() {
  loading();
  utools.subInputFocus();
  let html = '<h2 class="title">当前免费 - <a id="epic-url" href="">去官网领取</a></h2><div class="flex-box">';
  const p = window.getEpicData();
  p.then(res => {
    const proxyRes = handsome(res);
    const games = proxyRes.data.Catalog.searchStore.elements([]).filter(item => item.promotions);
    const currGames = games.filter(item => item.promotions.promotionalOffers.length);
    const upcomingGames = games.filter(item => item.promotions.upcomingPromotionalOffers.length);
    currGames.forEach(item => {
      const { title, keyImages } = item;
      const proxyItem = handsome(item);
      const itemUrl = ITEM_URL_PREFIX + proxyItem.catalogNs.mappings[0].pageSlug("");
      let img = keyImages.filter(each => each.type === "Thumbnail");
      if (!img.length) {
        img = keyImages[0] ? keyImages[0].url : "";
      } else {
        img = img[0].url || "";
      }
      html +=
        `<div class="item" data-url="${itemUrl}">
        <img src="${img}" />
        <div class="game-name">${title}</div>
    </div>`
    });
    html += `</div><h2 class="title">下周免费</h2><div class="flex-box">`;
    upcomingGames.forEach(item => {
      const { title, keyImages } = item;
      const proxyItem = handsome(item);
      const itemUrl = ITEM_URL_PREFIX + proxyItem.catalogNs.mappings[0].pageSlug("");
      let img = keyImages.filter(each => each.type === "Thumbnail");
      if (!img.length) {
        img = keyImages[0] ? keyImages[0].url : "";
      } else {
        img = img[0].url || "";
      }
      html +=
        `<div class="item" data-url="${itemUrl}">
        <img src="${img}" />
        <div class="game-name">${title}</div>
    </div>`
    });
    document.body.innerHTML = html + '</div>';
    document.body.style.backgroundColor = "#ffffff";
    setTimeout(function () {
      document.querySelector("#epic-url").addEventListener("click", open.bind(null, EPIC_URL));
      document.querySelectorAll('.item').forEach(item => {
        item.addEventListener("click", open.bind(null, item.dataset.url));
      });
    }, 10);
  });
}

utools.onPluginEnter(getData);
