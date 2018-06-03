import TwitchTypeB from "./twitchTypeB";
import getStyle from "./getStyle";

/**
 * Created by anton on 05.02.17.
 */
const DEBUG = false;

Promise.resolve().then(function () {
  let CurrentTwitchType = null;
  [TwitchTypeB].some(function (Type) {
    if (Type.isCurrentType()) {
      CurrentTwitchType = Type;
      return true;
    }
  });
  if (!CurrentTwitchType) {
    throw new Error('Is not supported');
  }
  return CurrentTwitchType;
}).then(function (CurrentTwitchType) {
  return new Promise(function (resolve) {
    chrome.storage.sync.get({
      gameList: [],
      channelList: [],
      removeItems: true,
      showControls: true
    }, resolve);
  }).then(function (storage) {
    return {
      storage: storage,
      CurrentTwitchType: CurrentTwitchType
    }
  });
}).then(function (result) {
  /**@type {{gameList:string[],channelList:string[],removeItems:boolean,showControls:boolean}}*/
  const storage = result.storage;

  const toggleInfo = function (info) {
    const pos = storage[info.type].indexOf(info.value);
    if (pos === -1) {
      storage[info.type].push(info.value);
    } else {
      storage[info.type].splice(pos, 1);
    }
    chrome.storage.sync.set(storage, function () {
      refresh();
    });
  };

  /**@type {TwitchTypeB}*/
  const currentTwitchType = new result.CurrentTwitchType({
    toggleInfo: toggleInfo
  });

  const testElement = function (listItemNode) {
    const gameName = currentTwitchType.getGameName(listItemNode);
    if (storage.showControls) {
      currentTwitchType.addGameControl(listItemNode, gameName, 'tgr__toggle');
    }

    const channelName = currentTwitchType.getChannelName(listItemNode);
    if (storage.showControls) {
      currentTwitchType.addChannelControl(listItemNode, channelName, 'tgr__toggle');
    }

    let result = false;
    if (storage.gameList.indexOf(gameName) !== -1 || storage.channelList.indexOf(channelName) !== -1) {
      listItemNode.classList.add('tgr__hidden');
      result = true;
    } else {
      listItemNode.classList.remove('tgr__hidden');
    }
    return result;
  };

  let styleNode = null;
  const refreshStyle = function () {
    const style = document.createElement('style');

    if (storage.removeItems) {
      style.textContent += getStyle('.tgr__hidden', {
        display: 'none'
      });
    } else {
      style.textContent += getStyle('.tgr__hidden ' + currentTwitchType.thumbSelector, {
        opacity: .5,
        transition: 'opacity 0.2s'
      });
      style.textContent += getStyle('.tgr__hidden ' + currentTwitchType.thumbSelector + ':hover', {
        opacity: 1
      });
    }

    if (storage.showControls) {
      style.textContent += getStyle('.tgr__toggle', {
        display: 'inline-block',
        position: 'relative',
        opacity: 0
      });
      style.textContent += getStyle('.tgr__toggle svg', {
        position: 'absolute',
        bottom: '-4px',
        display: 'inline-block',
        backgroundColor: '#000'
      });
      style.textContent += getStyle('*:hover > * > .tgr__toggle', {
        opacity: 0.5
      });
      style.textContent += getStyle('.tgr__toggle:hover', {
        opacity: 0.8
      });
    } else {
      style.textContent += getStyle([
        '.tgr__toggle'
      ], {
        display: 'none'
      });
    }

    if (styleNode && styleNode.parentNode) {
      styleNode.parentNode.replaceChild(style, styleNode);
    } else {
      document.body.appendChild(style);
    }
    styleNode = style;
  };

  const fixScroll = (function () {
    let timer = null;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        // console.log('resize', removed, count);
        window.dispatchEvent(new CustomEvent('resize'));
      }, 250);
    };
  })();

  const onAddedNode = function (nodeList) {
    let removed = 0;
    let count = 0;
    const matched = [];
    for (let i = 0, node; node = nodeList[i]; i++) {
      if (matched.indexOf(node) === -1) {
        matched.push(node);
        count++;
        if (testElement(node)) {
          removed++;
        }
      }
    }
    if (storage.removeItems && removed > 0) {
      fixScroll();
    }
  };

  const refresh = function () {
    onAddedNode(currentTwitchType.getItems(document.body));
  };

  refreshStyle();
  refresh();

  (function () {
    const mObserver = new MutationObserver(function (mutations) {
      let mutation, node;
      const nodeList = [];
      while (mutation = mutations.shift()) {
        for (let i = 0; node = mutation.addedNodes[i]; i++) {
          if (node.nodeType === 1) {
            if (currentTwitchType.matchItem(node)) {
              nodeList.push(node);
            } else {
              nodeList.push.apply(nodeList, currentTwitchType.getItems(node));
            }
          }
        }
      }
      onAddedNode(nodeList);
    });

    mObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  })();

  chrome.storage.onChanged.addListener(function (changes) {
    let hasChanges = false;
    let hasStyleChanges = false;
    const changeGameList = changes.gameList;
    if (changeGameList && JSON.stringify(changeGameList.newValue) !== JSON.stringify(storage.gameList)) {
      hasChanges = true;
      storage.gameList = changeGameList.newValue;
    }
    const changeChannelList = changes.channelList;
    if (changeChannelList && JSON.stringify(changeChannelList.newValue) !== JSON.stringify(storage.channelList)) {
      hasChanges = true;
      storage.channelList = changeChannelList.newValue;
    }
    if (changes.removeItems && storage.removeItems !== changes.removeItems.newValue) {
      storage.removeItems = changes.removeItems.newValue;
      hasStyleChanges = true;
    }
    if (changes.showControls && storage.showControls !== changes.showControls.newValue) {
      storage.showControls = changes.showControls.newValue;
      hasStyleChanges = true;
      hasChanges = true;
    }
    if (hasStyleChanges) {
      refreshStyle();
    }
    if (hasChanges) {
      refresh();
    }
  });
}).catch(function (err) {
  DEBUG && console.error('Run error', err);
});