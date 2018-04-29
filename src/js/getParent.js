var getParent = function (node, selector) {
  if (node.nodeType !== 1) {
    return null;
  }
  if (node.matches(selector)) {
    return node;
  }
  if (node.matches(selector + ' ' + node.tagName)) {
    while (!node.matches(selector)) {
      node = node.parentNode;
    }
    return node;
  }
  return null;
};

export default getParent;