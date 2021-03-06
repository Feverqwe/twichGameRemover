import TwitchAdapter from "./twitchAdapter";
import getStyle from "./getStyle";
import storageGet from "../tools/storageGet";
import defaultConfig from "./defaultConfig";

const DEBUG = false;

storageGet(defaultConfig, 'sync').then((/**@type {{gameList:string[],channelList:string[],removeItems:boolean,showControls:boolean,showRecords:boolean}}*/storage) => {
  const toggleInfo = (info) => {
    const pos = storage[info.type].indexOf(info.value);
    if (pos === -1) {
      storage[info.type].push(info.value);
    } else {
      storage[info.type].splice(pos, 1);
    }
    chrome.storage.sync.set(storage, () => {
      refresh();
    });
  };

  /**@type {TwitchAdapter}*/
  const twitchAdapter = new TwitchAdapter({
    toggleInfo: toggleInfo
  });

  const testElement = (listItemNode) => {
    const gameName = twitchAdapter.getGameName(listItemNode);
    if (storage.showControls) {
      twitchAdapter.addGameControl(listItemNode, gameName, 'tgr__toggle');
    }

    const channelName = twitchAdapter.getChannelName(listItemNode);
    if (storage.showControls) {
      twitchAdapter.addChannelControl(listItemNode, channelName, 'tgr__toggle');
    }

    const isRecord = twitchAdapter.isRecord(listItemNode);

    let result = false;
    if (
      (isRecord && !storage.showRecords) ||
      storage.gameList.indexOf(gameName) !== -1 ||
      storage.channelList.indexOf(channelName) !== -1
    ) {
      listItemNode.classList.add('tgr__hidden');
      result = true;
    } else {
      listItemNode.classList.remove('tgr__hidden');
    }
    return result;
  };

  let styleNode = null;
  const refreshStyle = () => {
    const style = document.createElement('style');

    if (storage.removeItems) {
      style.textContent += getStyle('.tgr__hidden', {
        display: 'none'
      });
    } else {
      style.textContent += getStyle('.tgr__hidden ' + twitchAdapter.thumbSelector, {
        opacity: .5,
        transition: 'opacity 0.2s'
      });
      style.textContent += getStyle('.tgr__hidden ' + twitchAdapter.thumbSelector + ':hover', {
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

  const fixScroll = (() => {
    let timer = null;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        // console.log('resize', removed, count);
        window.dispatchEvent(new CustomEvent('resize'));
      }, 250);
    };
  })();

  const onAddedNode = (nodeList) => {
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

  const refresh = () => {
    onAddedNode(twitchAdapter.getItems(document.body));
  };

  refreshStyle();
  refresh();

  (() => {
    const mObserver = new MutationObserver((mutations) => {
      let mutation, node;
      const nodeList = [];
      while (mutation = mutations.shift()) {
        for (let i = 0; node = mutation.addedNodes[i]; i++) {
          if (node.nodeType === 1) {
            if (twitchAdapter.matchItem(node)) {
              nodeList.push(node);
            } else {
              nodeList.push.apply(nodeList, twitchAdapter.getItems(node));
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

  chrome.storage.onChanged.addListener((changes) => {
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
    if (changes.showRecords && storage.showRecords !== changes.showRecords.newValue) {
      storage.showRecords = changes.showRecords.newValue;
      hasChanges = true;
    }
    if (hasStyleChanges) {
      refreshStyle();
    }
    if (hasChanges) {
      refresh();
    }
  });
}).catch((err) => {
  DEBUG && console.error('Run error', err);
});