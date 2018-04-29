var getStyle = function (selector, css) {
  return selector + '{' + Object.keys(css).map(function (key) {
    var _key = key.replace(/([A-Z])/g, function (text, letter) {
      return '-' + letter.toLowerCase();
    });
    return _key + ': ' + css[key];
  }).join(';') + '}';
};

export default getStyle;