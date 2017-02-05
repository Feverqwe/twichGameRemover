/**
 * Created by anton on 05.02.17.
 */
chrome.storage.sync.get({
  gameList: [],
  channelList: [],
  removeItems: true
}, function (storage) {
  var loadList = function (type) {
    var selectNode = document.querySelector('.' + type + '__select');
    selectNode.textContent = '';
    var list = storage[type];

    list.forEach(function (name, index) {
      var optionNode = document.createElement('option');
      optionNode.value = index;
      optionNode.textContent = name;
      selectNode.appendChild(optionNode);
    });
  };

  var initList = function (type) {
    loadList(type);

    var selectNode = document.querySelector('.' + type + '__select');

    var addBtnNode = document.querySelector('.' + type + '__add');
    addBtnNode.addEventListener('click', function (e) {
      e.preventDefault();
      var name = inputNode.value;

      storage[type].push(name);
      chrome.storage.sync.set(storage, function () {
        inputNode.value = '';
        loadList(type);
      });
    });

    var inputNode = document.querySelector('.' + type + '__input');
    inputNode.addEventListener('keypress', function (e) {
      if (e.keyCode === 13) {
        addBtnNode.dispatchEvent(new MouseEvent('click', {cancelable: true}));
      }
    });

    var removeBtnNode = document.querySelector('.' + type + '__remove');
    removeBtnNode.addEventListener('click', function (e) {
      e.preventDefault();
      var list = storage[type];
      var filteredItems = [];
      var options = [];
      for (var i = 0, option; option = selectNode.selectedOptions[i]; i++) {
        filteredItems.push(list[option.value]);
        options.push(option);
      }
      options.forEach(function (node) {
        node.parentNode.removeChild(node);
      });
      list = list.filter(function (name) {
        return filteredItems.indexOf(name) === -1;
      });

      storage[type] = list;
      chrome.storage.sync.set(storage);
    });
  };

  var refreshCheckBox = (function () {
    var removeItemCheckbox = document.querySelector('.removeItems__input');
    removeItemCheckbox.addEventListener('change', function (e) {
      storage.removeItems = this.checked;
      chrome.storage.sync.set(storage);
    });

    return function () {
      if (removeItemCheckbox.checked !== storage.removeItems) {
        removeItemCheckbox.checked = storage.removeItems;
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
  });
});