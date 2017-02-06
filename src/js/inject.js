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
      var _key = key.replace(/([A-Z])/g, function (text, letter) {
        return '-' + letter.toLowerCase();
      });
      return _key + ': ' + css[key];
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

  var refreshGameList = function () {
    gameList.splice(0);
    gameList.push.apply(gameList, storage.gameList);
  };
  var refreshChannelList = function () {
    channelList.splice(0);
    channelList.push.apply(channelList, storage.channelList);
  };

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
    if (!this.querySelector('.tgr__hide_btn-channel')) {
      var hideBtn = document.createElement('a');
      hideBtn.href = '#hide';
      hideBtn.title = 'Remove';
      hideBtn.dataset.tgrInfo = this.dataset.tgrInfo;
      hideBtn.classList.add('tgr__hide_btn-channel');
      hideBtn.addEventListener('click', onHideBtnClick);

      hideBtn.appendChild(getRemoveIcon(14, 14));
      this.appendChild(hideBtn);
    }
  };

  var onBoxArtOver = function () {
    this.removeEventListener('mouseenter', onBoxArtOver);
    if (!this.querySelector('.tgr__hide_btn-game')) {
      var hideBtn = document.createElement('a');
      hideBtn.href = '#hide';
      hideBtn.title = 'Remove';
      hideBtn.dataset.tgrInfo = this.dataset.tgrInfo;
      hideBtn.classList.add('tgr__hide_btn-game');
      hideBtn.addEventListener('click', onHideBtnClick);

      hideBtn.appendChild(getRemoveIcon(18, 18));
      this.appendChild(hideBtn);
    }
  };

  var testElement = function (streamPreview) {
    var gameName = '';
    var boxArtElement = streamPreview.querySelector(boxArtSelector);
    if (boxArtElement) {
      boxArtElement.addEventListener('mouseenter', onBoxArtOver);
      gameName = boxArtElement.getAttribute('title') || boxArtElement.getAttribute('original-title') || '';
      boxArtElement.dataset.tgrInfo = JSON.stringify({
        type: 'gameList',
        value: gameName
      });
    }

    var channelName = '';
    var channelElement = streamPreview.querySelector(channelNameSelector);
    if (channelElement) {
      channelElement.addEventListener('mouseenter', onChannelNameOver);
      channelName = channelElement.textContent.trim();
      channelElement.dataset.tgrInfo = JSON.stringify({
        type: 'channelList',
        value: channelName
      });
    }

    var result = false;
    if (gameList.indexOf(gameName) !== -1 || channelList.indexOf(channelName) !== -1) {
      streamPreview.classList.add('tgr__hidden');
      result = true;
    } else {
      streamPreview.classList.remove('tgr__hidden');
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
      style.textContent += getStyle('.tgr__hidden .thumb', {
        opacity: .5,
        transition: 'opacity 0.2s'
      });
      style.textContent += getStyle('.tgr__hidden .thumb:hover', {
        opacity: 1
      });
    }

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
      lineHeight: 0,
      verticalAlign: 'text-bottom'
    });
    style.textContent += getStyle('*:hover > .tgr__hide_btn-channel', {
      opacity: 0.5
    });
    style.textContent += getStyle('.tgr__hide_btn-channel:hover', {
      opacity: 0.8
    });

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

  refreshStyle();
  refreshGameList();
  refreshChannelList();
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
      storage.gameList = changeGameList.newValue;
      refreshGameList();
    }
    var changeChannelList = changes.channelList;
    if (changeChannelList && JSON.stringify(changeChannelList.newValue) !== JSON.stringify(channelList)) {
      hasChanges = true;
      storage.channelList = changeChannelList.newValue;
      refreshChannelList();
    }
    if (changes.removeItems && storage.removeItems !== changes.removeItems.newValue) {
      storage.removeItems = changes.removeItems.newValue;
      refreshStyle();
    }
    if (hasChanges) {
      refresh();
    }
  });
});