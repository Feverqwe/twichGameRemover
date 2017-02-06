/**
 * Created by anton on 05.02.17.
 */
chrome.storage.sync.get({
  gameList: [],
  channelList: [],
  removeItems: true,
  showControls: true
}, function (storage) {
  var cloneList = {};
  var loadList = function (type) {
    var listSelect = document.querySelector('.' + type + ' .list');
    listSelect.textContent = '';
    var list = storage[type];
    cloneList[type] = list.slice(0);
    list.forEach(function (name, index) {
      var node = document.createElement('div');
      node.classList.add('list__item');
      node.dataset.index = index;

      var nameNode = document.createElement('span');
      nameNode.classList.add('item__name');
      nameNode.textContent = name;

      var removeNode = document.createElement('a');
      removeNode.href = '#remove';
      removeNode.classList.add('item__btn');
      removeNode.classList.add('btn-remove');
      removeNode.title = 'Remove';

      node.appendChild(nameNode);
      node.appendChild(removeNode);
      listSelect.appendChild(node);
    });
  };

  var initList = function (type) {
    loadList(type);

    var addBtnNode = document.querySelector('.' + type + ' .add');
    addBtnNode.addEventListener('click', function (e) {
      e.preventDefault();
      var name = inputNode.value;
      var list = storage[type];

      list.push(name);
      chrome.storage.sync.set(storage, function () {
        inputNode.value = '';
        loadList(type);
      });
    });

    var inputNode = document.querySelector('.' + type + ' .input');
    inputNode.addEventListener('keypress', function (e) {
      if (e.keyCode === 13) {
        addBtnNode.dispatchEvent(new MouseEvent('click', {cancelable: true}));
      }
    });

    var listSelect = document.querySelector('.' + type + ' .list');
    listSelect.addEventListener('click', function (e) {
      var target = e.target;
      if (target.tagName === 'A' && target.classList.contains('btn-remove')) {
        e.preventDefault();
        var itemNode = target.parentNode;
        var index = itemNode.dataset.index;
        var list = storage[type];
        var item = cloneList[type][index];
        var pos = list.indexOf(item);
        if (pos !== -1) {
          list.splice(pos, 1);
          itemNode.parentNode.removeChild(itemNode);
          chrome.storage.sync.set(storage);
        }
      }
    });
  };

  var refreshCheckBox = (function () {
    var removeItemCheckbox = document.querySelector('.removeItems__input');
    removeItemCheckbox.addEventListener('change', function (e) {
      storage.removeItems = this.checked;
      chrome.storage.sync.set(storage);
    });

    var showControlsCheckbox = document.querySelector('.showControls__input');
    showControlsCheckbox.addEventListener('change', function (e) {
      storage.showControls = this.checked;
      chrome.storage.sync.set(storage);
    });

    return function () {
      if (removeItemCheckbox.checked !== storage.removeItems) {
        removeItemCheckbox.checked = storage.removeItems;
      }
      if (showControlsCheckbox.checked !== storage.showControls) {
        showControlsCheckbox.checked = storage.showControls;
      }
    };
  })();

  initList('gameList');
  initList('channelList');
  refreshCheckBox();

  chrome.storage.onChanged.addListener(function (changes) {
    var changeGameList = changes.gameList;
    if (changeGameList && JSON.stringify(changeGameList.newValue) !== JSON.stringify(storage.gameList)) {
      storage.gameList = changeGameList.newValue;
      loadList('gameList');
    }
    var changeChannelList = changes.channelList;
    if (changeChannelList && JSON.stringify(changeChannelList.newValue) !== JSON.stringify(storage.channelList)) {
      storage.channelList = changeChannelList.newValue;
      loadList('channelList');
    }

    if (changes.removeItems) {
      refreshCheckBox();
    }
    if (changes.showControls) {
      refreshCheckBox();
    }
  });
});