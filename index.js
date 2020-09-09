const EPIC_URL = "https://www.epicgames.com/store/zh-CN/free-games";
const PSN_URL = "https://store.playstation.com/zh-hant-hk/home/games/psplus";

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
    let html = '<h2>Epic免费游戏-<a id="epic-url" href="">点击领取</a></h2><div class="flex-box">';
    const p1 = window.getPsnData();
    const p2 = window.getEpicData();
    Promise.all([p1, p2]).then(([res1, res2]) => {
        const games = res2.data.Catalog.searchStore.elements;
        games.forEach(item => {
            const { title, keyImages } = item;
            // let img = keyImages.filter(each => each.type === "Thumbnail");
            const img = keyImages[0] ? keyImages[0].url : "";
            html += 
            `<div>
        <img src="${img}" width="124" height="124" />
        <div>${title}</div>
    </div>`
        });
        html += '</div><h2>PS4港服会免游戏-<a id="psn-url" href="">点击领取</a></h2><div class="flex-box">' + res1 + '</div>';
        document.body.innerHTML = html;
        document.body.style.backgroundColor = "#ffffff";
        setTimeout(function() {
            document.querySelector("#epic-url").addEventListener("click", open.bind(null, EPIC_URL));
            document.querySelector("#psn-url").addEventListener("click", open.bind(null, PSN_URL));
        }, 10);
    }).catch(err => {
        alert(err)
    });
}

utools.onPluginEnter(getData);