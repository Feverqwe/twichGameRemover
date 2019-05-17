import '../css/options.css';
import defaultConfig from "./defaultConfig";
import storageGet from "../tools/storageGet";

storageGet(defaultConfig, 'sync').then((storage) => {
  const cloneList = {};
  const loadList = (type) => {
    const listSelect = document.querySelector('.' + type + ' .list');
    listSelect.textContent = '';
    const list = storage[type];
    cloneList[type] = list.slice(0);
    cloneList[type].forEach((name, index) => {
      const node = document.createElement('div');
      node.classList.add('list__item');
      node.dataset.index = index;

      const nameNode = document.createElement('span');
      nameNode.classList.add('item__name');
      nameNode.textContent = name;

      const removeNode = document.createElement('a');
      removeNode.href = '#remove';
      removeNode.classList.add('item__btn');
      removeNode.classList.add('btn-remove');
      removeNode.title = 'Remove';

      node.appendChild(nameNode);
      node.appendChild(removeNode);
      listSelect.appendChild(node);
    });
  };

  const initList = (type) => {
    loadList(type);

    const addBtnNode = document.querySelector('.' + type + ' .add');
    addBtnNode.addEventListener('click', (e) => {
      e.preventDefault();
      const name = inputNode.value;
      const list = storage[type];

      list.push(name);
      chrome.storage.sync.set(storage, () => {
        inputNode.value = '';
        loadList(type);
      });
    });

    const inputNode = document.querySelector('.' + type + ' .input');
    inputNode.addEventListener('keypress', (e) => {
      if (e.keyCode === 13) {
        addBtnNode.dispatchEvent(new MouseEvent('click', {cancelable: true}));
      }
    });

    const listSelect = document.querySelector('.' + type + ' .list');
    listSelect.addEventListener('click', (e) => {
      const target = e.target;
      if (target.tagName === 'A' && target.classList.contains('btn-remove')) {
        e.preventDefault();
        const itemNode = target.parentNode;
        const index = itemNode.dataset.index;
        const list = storage[type];
        const item = cloneList[type][index];
        const pos = list.indexOf(item);
        if (pos !== -1) {
          list.splice(pos, 1);
          itemNode.parentNode.removeChild(itemNode);
          chrome.storage.sync.set(storage);
        }
      }
    });
  };

  const refreshCheckBox = (() => {
    const removeItemCheckbox = document.querySelector('.removeItems__input');
    removeItemCheckbox.addEventListener('change', (e) => {
      storage.removeItems = e.currentTarget.checked;
      chrome.storage.sync.set(storage);
    });

    const showControlsCheckbox = document.querySelector('.showControls__input');
    showControlsCheckbox.addEventListener('change', (e) => {
      storage.showControls = e.currentTarget.checked;
      chrome.storage.sync.set(storage);
    });

    const showRecordsCheckbox = document.querySelector('.showRecords__input');
    showRecordsCheckbox.addEventListener('change', (e) => {
      storage.showRecords = e.currentTarget.checked;
      chrome.storage.sync.set(storage);
    });

    return () => {
      if (removeItemCheckbox.checked !== storage.removeItems) {
        removeItemCheckbox.checked = storage.removeItems;
      }
      if (showControlsCheckbox.checked !== storage.showControls) {
        showControlsCheckbox.checked = storage.showControls;
      }
      if (showRecordsCheckbox.checked !== storage.showRecords) {
        showRecordsCheckbox.checked = storage.showRecords;
      }
    };
  })();

  initList('gameList');
  initList('channelList');
  refreshCheckBox();

  chrome.storage.onChanged.addListener((changes) => {
    const changeGameList = changes.gameList;
    if (changeGameList && JSON.stringify(changeGameList.newValue) !== JSON.stringify(storage.gameList)) {
      storage.gameList = changeGameList.newValue;
      loadList('gameList');
    }
    const changeChannelList = changes.channelList;
    if (changeChannelList && JSON.stringify(changeChannelList.newValue) !== JSON.stringify(storage.channelList)) {
      storage.channelList = changeChannelList.newValue;
      loadList('channelList');
    }

    if (changes.removeItems || changes.showControls || changes.showRecords) {
      refreshCheckBox();
    }
  });
});