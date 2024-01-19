// Get game variables from page
var global;
const s = document.createElement('script');
s.src = chrome.runtime.getURL('scripts/global_import.js');
s.onload = () => s.remove();
(document.head || document.documentElement).append(s);

var playerTimers;
var players = document.querySelector('#players');
var isRunning = false;
var gameID;
var playerName;

document.addEventListener('getGlobal', function (e) {
    const global = e.detail;
    gameID = global.gameID;
    playerName = global.name;

    chrome.storage.local.get("isRunning").then((result) => {
        if (result.isRunning) {
            if (performance.getEntriesByType("navigation")[0].type == "reload") {
                console.log('init enhancer (reload)');
                initEnhancer();
            } else {
                isRunning = true;
            }
        } else {
            console.log('init enhancer');
            initEnhancer();
        }
    });
});

function initEnhancer() {
    chrome.storage.local.get("playerTimers").then((result) => {
        if (result.playerTimers) {            
            playerTimers = result.playerTimers;
            if (!playerTimers[gameID]) playerTimers[gameID] = {};
            initPlayersObserver();
        } else {
            playerTimers = {"gameID": {}};
            initPlayersObserver();
        }
    });
}

function initPlayersObserver() {
    const config = { attributes: false, childList: true, subtree: false };
    const observer = new MutationObserver(handlePlayersChildChange);
    observer.observe(players, config);
}

function handlePlayersChildChange(mutationsList, observer) {
    // All players are added to #players at once, so when this fires we should be good to go
    // timerdivs are lost as #players is redrawn at every turnswitch, so reapply    
    appendTimerDivs();

    if (!isRunning) beginEnhancer();
}

function appendTimerDivs() {
    const config = { attributes: true, childList: false, subtree: false };

    players.childNodes.forEach((player) => {
        const centeredDiv = document.createElement('div');
        centeredDiv.className = 'timerDiv';

        if (playerTimers[gameID][player.id] === undefined) {
            playerTimers[gameID][player.id] = 0;
        }

        player.appendChild(centeredDiv);
        centeredDiv.textContent = secondsToHMS(playerTimers[gameID][player.id]);

        const observer = new MutationObserver(handlePlayerClassChange);
        observer.observe(player, config);
    });
}

function beginEnhancer() {
    const intervalId = setInterval(checkAndUpdateTimers, 1000);
    chrome.storage.local.set({"isRunning": true});
    isRunning = true;
}

function handlePlayerClassChange(mutationsList, observer) {
    for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        }
    }
}

function checkAndUpdateTimers() {
    players.childNodes.forEach(player => {
        if (player.classList.contains('active')) {
            playerTimers[gameID][player.id]++;
            player.querySelector('.timerDiv').textContent = secondsToHMS(playerTimers[gameID][player.id]);
        }
    });

    chrome.storage.local.set({playerTimers: playerTimers});
}

function secondsToHMS(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const formattedTime = `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
    return formattedTime;
}

function pad(value) {
    return value < 10 ? `0${value}` : value;
}