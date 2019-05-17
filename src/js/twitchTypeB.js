import getParent from "./getParent";

const getRemoveIcon = (width, height) => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const svgNS = svg.namespaceURI;
  svg.setAttribute('width', width || '18');
  svg.setAttribute('height', height || '18');
  svg.setAttribute('viewBox', '0 0 24 24');

  const path = document.createElementNS(svgNS, 'path');
  svg.appendChild(path);
  path.setAttribute('d', 'M14.8 12l3.6-3.6c.8-.8.8-2 0-2.8-.8-.8-2-.8-2.8 0L12 9.2 8.4 5.6c-.8-.8-2-.8-2.8 0-.8.8-.8 2 0 2.8L9.2 12l-3.6 3.6c-.8.8-.8 2 0 2.8.4.4.9.6 1.4.6s1-.2 1.4-.6l3.6-3.6 3.6 3.6c.4.4.9.6 1.4.6s1-.2 1.4-.6c.8-.8.8-2 0-2.8L14.8 12z');

  path.setAttribute('fill', '#FFF');

  return svg;
};

class TwitchTypeB {
  constructor(inject) {
    this.inject = inject;
    /**@private*/
    this.listItemSelector = '.tw-tower > div';
    /**@private*/
    this.gameNameLinkSelector = 'a.tw-link[href^="/directory/game/"]';
    /**@private*/
    this.channelNameLinkSelector = '.preview-card-titles__subtitle-wrapper > div:first-child a.tw-link';
    this.thumbSelector = '.preview-card-thumbnail__image';

    this.handleToggleLinkClick = this.handleToggleLinkClick.bind(this);
  }
  getItems(parent) {
    const nodes = parent.querySelectorAll(this.listItemSelector);
    /*if (!nodes.length) {
      var item = getParent(parent, this.listItemSelector);
      if (item) {
        nodes = [item];
      }
    }*/
    return nodes;
  }
  matchItem(node) {
    return node.matches(this.listItemSelector);
  }
  getChannelName(itemNode) {
    let result = '';
    const link = itemNode.querySelector(this.channelNameLinkSelector);
    if (link) {
      const m = /\/([^\/]+)/.exec(link.getAttribute('href'));
      if (m) {
        result = m[1];
      }
    }
    return result;
  }
  getGameName(itemNode) {
    let result = '';
    const link = itemNode.querySelector(this.gameNameLinkSelector);
    if (link) {
      result = link.textContent.trim();
    }
    return result;
  }
  isRecord(itemNode) {
    return !!itemNode.querySelector('.stream-type-indicator--rerun');
  }
  handleToggleLinkClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const link = getParent(e.target, 'a');
    const info = JSON.parse(link.dataset.tgrInfo);
    this.inject.toggleInfo(info);
  }
  addGameControl(itemNode, gameName, className) {
    if (itemNode.querySelector(`.${className}.tgr__game`)) return;

    const link = itemNode.querySelector(this.gameNameLinkSelector);
    if (link) {
      const controlNode = document.createElement('a');
      controlNode.appendChild(getRemoveIcon(16, 16));
      controlNode.href = '#';
      controlNode.title = 'Hide/Show game';
      controlNode.dataset.tgrInfo = JSON.stringify({
        type: 'gameList',
        value: gameName
      });
      controlNode.addEventListener('click', this.handleToggleLinkClick);

      const containerNode = document.createElement('span');
      controlNode.classList.add(className);
      controlNode.classList.add('tgr__game');
      containerNode.textContent = ' ';
      containerNode.appendChild(controlNode);

      const nextNode = link.nextElementSibling;
      if (nextNode) {
        link.parentNode.insertBefore(nextNode, containerNode)
      } else {
        link.parentNode.appendChild(containerNode);
      }
    }
  }
  addChannelControl(itemNode, channelName, className) {
    if (itemNode.querySelector(`.${className}.tgr__channel`)) return;

    const link = itemNode.querySelector(this.channelNameLinkSelector);
    if (link) {
      const controlNode = document.createElement('a');
      controlNode.appendChild(getRemoveIcon(16, 16));
      controlNode.href = '#';
      controlNode.title = 'Hide/Show channel';
      controlNode.dataset.tgrInfo = JSON.stringify({
        type: 'channelList',
        value: channelName
      });
      controlNode.addEventListener('click', this.handleToggleLinkClick);

      const containerNode = document.createElement('span');
      controlNode.classList.add(className);
      controlNode.classList.add('tgr__channel');
      containerNode.textContent = ' ';
      containerNode.appendChild(controlNode);

      const nextNode = link.nextElementSibling;
      if (nextNode) {
        link.parentNode.insertBefore(nextNode, containerNode)
      } else {
        link.parentNode.appendChild(containerNode);
      }
    }
  }
  static isCurrentType() {
    return true;
  }
}

export default TwitchTypeB;