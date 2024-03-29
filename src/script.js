import handsome from "handsome-exception";

const EPIC_URL = "https://store.epicgames.com/zh-CN/free-games";
const ITEM_URL_PREFIX = "https://store.epicgames.com/zh-CN/p/";

function dateFormat(fmt, date) {
  let ret;
  date = new Date(date);
  const opt = {
    "Y+": date.getFullYear().toString(),        // 年
    "m+": (date.getMonth() + 1).toString(),     // 月
    "d+": date.getDate().toString(),            // 日
    "H+": date.getHours().toString(),           // 时
    "M+": date.getMinutes().toString(),         // 分
    "S+": date.getSeconds().toString()          // 秒
  };
  for (let k in opt) {
    ret = new RegExp("(" + k + ")").exec(fmt);
    if (ret) {
      fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
    };
  };
  return fmt;
}

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

function isInTimes(startDate, endDate) {
  const curr = Date.now();
  let s, e;
  let ret = true;
  try {
    s = new Date(startDate).valueOf();
    e = new Date(endDate).valueOf();
    console.log(s, e)
    if (curr >= s && curr <= e) {
      ret = true;
    } else {
      ret = false;
    }
  } catch (e) {
    ret = false;
  }
  return ret;
}

function autoSetBtnStatus(btn, currTimes, piao) {
  if (piao.time === currTimes.endDate && piao.is) {
    btn.className = "pure-button green";
    btn.innerText = "已领";
  } else {
    btn.className = "pure-button gray";
    btn.innerText = "没领";
  }
}

function getGameHtml(game) {
  let html = '';
  const { title, keyImages, description } = game;
  const proxyItem = handsome(game);
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
    <div class="drawer-box">
      <div class="game-description">${description}</div>
    </div>
  </div>`
  return html;
}
function time2String(timeObj, type) {
  if (!timeObj) {
    return '';
  }
  if (type === 'curr') {
    return `<span class="time"> ( ${dateFormat('m月d日HH:MM截止', timeObj.endDate)} ) </span>`;
  } else {
    return `<span class="time"> ( ${dateFormat('m月d日', timeObj.startDate)} - ${dateFormat('m月d日', timeObj.endDate)} ) </span>`;
  }
}
function getData() {
  loading();
  utools.subInputFocus();
  const p = window.getEpicData();
  p.then(res => {
    const proxyRes = handsome(res);
    const games = proxyRes.data.Catalog.searchStore.elements([]);
    let currGamesHtml = '',
      upcomingGamesHtml = '',
      currTimes,
      upcomingTimes;
    for (const game of games) {
      if (!game.promotions) {
        continue;
      }
      const proxyGame = handsome(game);
      if (game.promotions.promotionalOffers.length) {
        currTimes = proxyGame.promotions.promotionalOffers[0].promotionalOffers[0]('');
        if (currTimes.discountSetting) {
          if (currTimes.discountSetting.discountPercentage === 0 && isInTimes(currTimes.startDate, currTimes.endDate)) {
            currGamesHtml += getGameHtml(game);
          }
        }
      }
      if (game.promotions.upcomingPromotionalOffers.length) {
        !upcomingTimes && (upcomingTimes = proxyGame.promotions.upcomingPromotionalOffers[0].promotionalOffers[0](''));
        if (upcomingTimes.discountSetting) {
          if (upcomingTimes.discountSetting.discountPercentage === 0) {
            upcomingGamesHtml += getGameHtml(game);
          }
        }
      }
    }
    let html = `<h2 class="title">当前免费${time2String(currTimes, 'curr')} - <a id="epic-url" href="">去官网领取</a><button id="btn" class="pure-button gray">没领</button></h2><div class="flex-box">`;
    html += currGamesHtml;
    html += `</div><h2 class="title">即将免费${time2String(upcomingTimes, 'upcoming')}</h2><div class="flex-box">`;
    html += upcomingGamesHtml;
    document.body.innerHTML = html + '</div>';
    document.body.style.backgroundColor = "#ffffff";
    if (!utools.dbStorage.getItem('piao')) {
      utools.dbStorage.setItem('piao', {is: false, time: currTimes.endDate});
    }
    setTimeout(function () {
      const btn = document.querySelector("#btn");
      autoSetBtnStatus(btn, currTimes, utools.dbStorage.getItem('piao'));
      btn.addEventListener("click", function() {
        if (this.innerText === '没领') {
          this.className = "pure-button green";
          this.innerText = "已领";
          utools.dbStorage.setItem('piao', {is: true, time: currTimes.endDate});
        } else {
          this.className = "pure-button gray";
          this.innerText = "没领";
          utools.dbStorage.setItem('piao', {is: false, time: currTimes.endDate});
        }
      });
      document.querySelector("#epic-url").addEventListener("click", open.bind(null, EPIC_URL));
      document.querySelectorAll('.item').forEach(item => {
        item.addEventListener("click", open.bind(null, item.dataset.url));
      });
    }, 10);
  });
}

utools.onPluginEnter(getData);
