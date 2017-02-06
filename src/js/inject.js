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
  var matchSelector = '.qa-stream-preview';
  var boxArtSelector = '.boxart';
  var channelNameSelector = '.js-channel-link';

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

  var testElement = function (streamPreview) {
    var gameName = '';
    var boxArtElement = streamPreview.querySelector(boxArtSelector);
    if (boxArtElement) {
      gameName = boxArtElement.getAttribute('title') || boxArtElement.getAttribute('original-title') || '';
    }

    var channelName = '';
    var channelElement = streamPreview.querySelector(channelNameSelector);
    if (channelElement) {
      channelName = channelElement.textContent.trim();
    }

    var result = false;
    if (gameList.indexOf(gameName) !== -1 || channelList.indexOf(channelName) !== -1) {
      streamPreview.classList.add('tgr_hidden');
      result = true;
    } else {
      streamPreview.classList.remove('tgr_hidden');
    }
    return result;
  };

  var styleNode = null;
  var insertStyle = function () {
    var style = document.createElement('style');

    if (storage.removeItems) {
      style.textContent += getStyle('.tgr_hidden', {
        display: 'none'
      });
    } else {
      style.textContent += getStyle('.tgr_hidden .thumb', {
        opacity: .5,
        transition: 'opacity 0.3s'
      });
      style.textContent += getStyle('.tgr_hidden .thumb:hover', {
        opacity: 1
      });
    }

    if (styleNode) {
      styleNode.parentNode.replaceChild(style, styleNode);
    } else {
      document.body.appendChild(style);
    }
    styleNode = style;
  };

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
    if (storage.removeItems && 100 / count * removed > 50) {
      // console.log('resize', removed, count);
      window.dispatchEvent(new CustomEvent('resize'));
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
            if (node.matches(matchSelector)) {
              nodeList.push(node);
            } else {
              nodeList.push.apply(nodeList, node.querySelectorAll(matchSelector));
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
    if (changes.removeItems && storage.removeItems !== changes.removeItems.newValue) {
      storage.removeItems = changes.removeItems.newValue;
      insertStyle();
    }
    if (hasChanges) {
      refresh();
    }
  });
});