module.exports = {
  'admin-pas-loggue=not-signin' : function (browser) {
    browser
      .url(browser.launchUrl + "/signin")
    // browser
    // .assert.urlEquals(browser.launchUrl + "/signin")
      browser.pause(5000);
    browser
    .expect.element('h1').text.to.equal('Se connecter');
    browser.saveScreenshot('screenshot.png')

    console.log()


    browser
      .end();
  }
};
