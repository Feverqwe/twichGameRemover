/**
 * Created by anton on 05.02.17.
 */
var getParent = function (node, selector) {
  if (node.matches(selector)) {
    return node;
  }
  if (!node.matches(selector + ' ' + node.tagName)) {
    return null;
  }
  node = node.parentNode;
  for (var parent = node; parent; parent = parent.parentNode) {
    if (parent.nodeType === 1) {
      if (parent.matches(selector)) {
        return parent;
      }
    }
  }
  return null;
};
var getStyle = function (selector, css) {
  return selector + '{' + Object.keys(css).map(function (key) {
      return key + ': ' + css[key];
    }).join(';') + '}';
};

chrome.storage.sync.get({
  gameList: [],
  channelList: [],
  removeItems: true
}, function (storage) {
  var matchSelector = '.qa-stream-preview .boxart';
  var gameList = [];
  var channelList = [];

  var setGameList = function (list) {
    gameList.splice(0);
    gameList.push.apply(gameList, list);
  };
  var setChannelList = function (list) {
    channelList.splice(0);
    channelList.push.apply(channelList, list);
  };

  var testBoxArt = function (boxArtElement) {
    var streamPreview = getParent(boxArtElement, '.qa-stream-preview');
    if (streamPreview) {
      var gameName = boxArtElement.getAttribute('title') || boxArtElement.getAttribute('original-title');
      var channelName = streamPreview.querySelector('.js-channel-link');
      channelName = channelName && channelName.textContent.trim();
      if (gameList.indexOf(gameName) !== -1 || channelList.indexOf(channelName) !== -1) {
        if (storage.removeItems) {
          streamPreview.classList.add('tgr_hidden');
        } else {
          streamPreview.classList.add('tgr_transparent');
        }
        console.log('hidden', channelName, gameName);
      }
    }
  };

  var insertStyle = function () {
    var style = document.createElement('style');
    style.textContent += getStyle('.tgr_hidden', {
      display: 'none'
    });
    style.textContent += getStyle('.tgr_transparent .thumb', {
      opacity: .5,
      transition: 'opacity 0.3s'
    });
    style.textContent += getStyle('.tgr_transparent .thumb:hover', {
      opacity: 1
    });
    document.body.appendChild(style);
  };

  var onAddedNode = function (nodeList) {
    var matched = [];
    for (var i = 0, node; node = nodeList[i]; i++) {
      if (matched.indexOf(node) === -1) {
        matched.push(node);
        testBoxArt(node);
      }
    }
  };

  var refresh = function () {
    onAddedNode(document.body.querySelectorAll(matchSelector));
  };

  insertStyle();
  setGameList(storage.gameList);
  setChannelList(storage.gameList);
  refresh();

  (function () {
    var mObserver = new MutationObserver(function (mutations) {
      var mutation, node, nodeList = [];
      while (mutation = mutations.shift()) {
        for (var i = 0; node = mutation.addedNodes[i]; i++) {
          if (node.nodeType === 1) {
            nodeList.push.apply(nodeList, node.querySelectorAll(matchSelector));
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
    var changeGameList = changes.gameList;
    if (changeGameList && JSON.stringify(changeGameList.newValue) !== JSON.stringify(gameList)) {
      hasChanges = true;
      setGameList(changeGameList.newValue);
    }
    var changeChannelList = changes.channelList;
    if (changeChannelList && JSON.stringify(changeChannelList.newValue) !== JSON.stringify(channelList)) {
      hasChanges = true;
      setChannelList(changeChannelList.newValue);
    }
    if (changes.removeItems) {
      storage.removeItems = changes.removeItems.newValue;
    }
    if (hasChanges) {
      refresh();
    }
  });
});