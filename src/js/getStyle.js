var getStyle = (selector, css) => {
  return selector + '{' + Object.keys(css).map((key) => {
    var _key = key.replace(/([A-Z])/g, (text, letter) => {
      return '-' + letter.toLowerCase();
    });
    return _key + ': ' + css[key];
  }).join(';') + '}';
};

export default getStyle;