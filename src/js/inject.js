import TwitchTypeA from "./twitchTypeA";
import TwitchTypeB from "./twitchTypeB";
import getStyle from "./getStyle";

/**
 * Created by anton on 05.02.17.
 */
var DEBUG = false;

var getRemoveIcon = function (width, height) {
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  var svgNS = svg.namespaceURI;
  svg.setAttribute('width', width || '18');
  svg.setAttribute('height', height || '18');
  svg.setAttribute('viewBox', '0 0 24 24');

  var path = document.createElementNS(svgNS, 'path');
  svg.appendChild(path);
  path.setAttribute('d', 'M14.8 12l3.6-3.6c.8-.8.8-2 0-2.8-.8-.8-2-.8-2.8 0L12 9.2 8.4 5.6c-.8-.8-2-.8-2.8 0-.8.8-.8 2 0 2.8L9.2 12l-3.6 3.6c-.8.8-.8 2 0 2.8.4.4.9.6 1.4.6s1-.2 1.4-.6l3.6-3.6 3.6 3.6c.4.4.9.6 1.4.6s1-.2 1.4-.6c.8-.8.8-2 0-2.8L14.8 12z');

  path.setAttribute('fill', '#FFF');

  return svg;
};

Promise.resolve().then(function () {
  var currentTwitchType = null;
  [TwitchTypeA, TwitchTypeB].some(function (Type) {
    if (Type.isCurrentType()) {
      currentTwitchType = new Type();
      return true;
    }
  });
  if (!currentTwitchType) {
    throw new Error('Is not supported');
  }
  return currentTwitchType;
}).then(function (currentTwitchType) {
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
      currentTwitchType: currentTwitchType
    }
  });
}).then(function (result) {
  /**@type {{gameList:string[],channelList:string[],removeItems:boolean,showControls:boolean}}*/
  var storage = result.storage;
  /**@type {TwitchTypeA|TwitchTypeB}*/
  var currentTwitchType = result.currentTwitchType;

  var onHideBtnClick = function (e) {
    e.preventDefault();
    e.stopPropagation();
    var info = JSON.parse(this.dataset.tgrInfo);
    var pos = storage[info.type].indexOf(info.value);
    if (pos === -1) {
      storage[info.type].push(info.value);
    } else {
      storage[info.type].splice(pos, 1);
    }
    chrome.storage.sync.set(storage, function () {
      refresh();
    });
  };

  var onChannelNameOver = function () {
    this.removeEventListener('mouseenter', onChannelNameOver);
    var tgrInfo = this.dataset.tgrInfo;
    this.removeAttribute('data-tgr-info');
    if (storage.showControls && !this.querySelector('.tgr__hide_btn-channel')) {
      var hideBtn = document.createElement('a');
      hideBtn.href = '#hide';
      hideBtn.title = 'Remove';
      hideBtn.dataset.tgrInfo = tgrInfo;
      hideBtn.classList.add('tgr__hide_btn-channel');
      hideBtn.addEventListener('click', onHideBtnClick);

      hideBtn.appendChild(getRemoveIcon(14, 14));
      this.appendChild(hideBtn);
    }
  };

  var onBoxArtOver = function () {
    this.removeEventListener('mouseenter', onBoxArtOver);
    var tgrInfo = this.dataset.tgrInfo;
    this.removeAttribute('data-tgr-info');
    if (storage.showControls && !this.querySelector('.tgr__hide_btn-game')) {
      var hideBtn = document.createElement('a');
      hideBtn.href = '#hide';
      hideBtn.title = 'Remove';
      hideBtn.dataset.tgrInfo = tgrInfo;
      hideBtn.classList.add('tgr__hide_btn-game');
      hideBtn.addEventListener('click', onHideBtnClick);

      hideBtn.appendChild(getRemoveIcon(18, 18));
      this.appendChild(hideBtn);
    }
  };

  var testElement = function (listItemNode) {
    var gameName = currentTwitchType.getGameName(listItemNode);
    if (storage.showControls) {
      currentTwitchType.addGameControl(listItemNode, gameName, onBoxArtOver);
    }

    var channelName = currentTwitchType.getChannelName(listItemNode);
    if (storage.showControls) {
      currentTwitchType.addChannelControl(listItemNode, channelName, onChannelNameOver);
    }

    var result = false;
    if (storage.gameList.indexOf(gameName) !== -1 || storage.channelList.indexOf(channelName) !== -1) {
      listItemNode.classList.add('tgr__hidden');
      result = true;
    } else {
      listItemNode.classList.remove('tgr__hidden');
    }
    return result;
  };

  var styleNode = null;
  var refreshStyle = function () {
    var style = document.createElement('style');

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
      style.textContent += getStyle('.tgr__hide_btn-game', {
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: 10,
        display: 'block',
        backgroundColor: '#000',
        opacity: 0,
        lineHeight: 0
      });
      style.textContent += getStyle('*:hover > .tgr__hide_btn-game', {
        opacity: 0.5
      });
      style.textContent += getStyle('.tgr__hide_btn-game:hover', {
        opacity: 0.8
      });

      style.textContent += getStyle('.tgr__hide_btn-channel', {
        display: 'inline-block',
        backgroundColor: '#000',
        opacity: 0,
        lineHeight: 0
      });
      style.textContent += getStyle('*:hover > .tgr__hide_btn-channel', {
        opacity: 0.5
      });
      style.textContent += getStyle('.tgr__hide_btn-channel:hover', {
        opacity: 0.8
      });
    } else {
      style.textContent += getStyle([
        '.tgr__hide_btn-game',
        '.tgr__hide_btn-channel'
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

  var fixScroll = (function () {
    var timer = null;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        // console.log('resize', removed, count);
        window.dispatchEvent(new CustomEvent('resize'));
      }, 250);
    };
  })();

  var onAddedNode = function (nodeList) {
    var removed = 0;
    var count = 0;
    var matched = [];
    for (var i = 0, node; node = nodeList[i]; i++) {
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

  var refresh = function () {
    onAddedNode(currentTwitchType.getItems(document.body));
  };

  refreshStyle();
  refresh();

  (function () {
    var mObserver = new MutationObserver(function (mutations) {
      var mutation, node, nodeList = [];
      while (mutation = mutations.shift()) {
        for (var i = 0; node = mutation.addedNodes[i]; i++) {
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
    var hasChanges = false;
    var hasStyleChanges = false;
    var changeGameList = changes.gameList;
    if (changeGameList && JSON.stringify(changeGameList.newValue) !== JSON.stringify(storage.gameList)) {
      hasChanges = true;
      storage.gameList = changeGameList.newValue;
    }
    var changeChannelList = changes.channelList;
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