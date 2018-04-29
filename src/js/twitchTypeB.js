import getParent from "./getParent";

class TwitchTypeB {
  constructor() {
    /**@private*/
    this.listItemSelector = '.tw-tower > div';
    /**@private*/
    this.boxArtSelector = '.live-channel-card__boxart';
    /**@private*/
    this.gameNameSelector = '.tw-tooltip';
    /**@private*/
    this.channelNameSelector = '.live-channel-card__videos';
    this.thumbSelector = '.tw-card-img';
  }
  getItems(parent) {
    var nodes = parent.querySelectorAll(this.listItemSelector);
    if (!nodes.length) {
      var item = getParent(parent, this.listItemSelector);
      if (item) {
        nodes = [item];
      }
    }
    return nodes;
  }
  matchItem(node) {
    return node.matches(this.listItemSelector);
  }
  _getGameNameFromNode(node) {
    var name = '';
    var tooltipNode = node.querySelector(this.gameNameSelector);
    if (tooltipNode) {
      name = tooltipNode.textContent.trim();
    }
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
    return true;
  }
}

export default TwitchTypeB;