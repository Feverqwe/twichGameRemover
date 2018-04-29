class TwitchTypeA {
  constructor() {
    /**@private*/
    this.listItemSelector = '.qa-stream-preview';
    /**@private*/
    this.boxArtSelector = '.card__boxpin';
    /**@private*/
    this.channelNameSelector = '.js-channel-link';
    /**@private*/
    this.gameNameAttrs = ['title', 'original-title'];
    this.thumbSelector = '.card__img';
  }
  getItems(parent) {
    return parent.querySelectorAll(this.listItemSelector);
  }
  matchItem(node) {
    return node.matches(this.listItemSelector);
  }
  _getGameNameFromNode(node) {
    var name = '';
    this.gameNameAttrs.some(function (attr) {
      var value = node.getAttribute(attr);
      if (value) {
        return name = value;
      }
    });
    return name;
  }
  getGameName(itemNode) {
    var result = '';
    var boxArtElement = itemNode.querySelector(this.boxArtSelector);
    if (boxArtElement) {
      result = this._getGameNameFromNode(boxArtElement);
    }
    return result;
  }
  addGameControl(itemNode, gameName, listener) {
    var boxArtElement = itemNode.querySelector(this.boxArtSelector);
    if (boxArtElement) {
      boxArtElement.addEventListener('mouseenter', listener);
      boxArtElement.dataset.tgrInfo = JSON.stringify({
        type: 'gameList',
        value: gameName
      });
    }
  }
  _getChannelNameFromNode(node) {
    return node.textContent.trim();
  }
  getChannelName(itemNode) {
    var result = '';
    var channelElement = itemNode.querySelector(this.channelNameSelector);
    if (channelElement) {
      result = this._getChannelNameFromNode(channelElement);
    }
    return result;
  }
  addChannelControl(itemNode, channelName, listener) {
    var channelElement = itemNode.querySelector(this.channelNameSelector);
    if (channelElement) {
      channelElement.addEventListener('mouseenter', listener);
      channelElement.dataset.tgrInfo = JSON.stringify({
        type: 'channelList',
        value: channelName
      });
    }
  }
  static isCurrentType() {
    return /ember/.test(document.body.dataset.page);
  }
}

export default TwitchTypeA;