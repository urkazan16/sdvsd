const {By: ByBase} = require('selenium-webdriver');


class By extends ByBase {

  /**
   *
   * @param {String} using
   * @param {String} value
   */
  constructor(using, value) {
    super(using, value);
  }

  static name(name) {
    return super.name(name);
  }

  static xPath(name) {
    return super.xPath ? super.xPath(name) : super.xpath(name);
  }
}

exports.By = By;
