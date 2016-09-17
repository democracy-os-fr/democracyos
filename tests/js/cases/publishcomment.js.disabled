module.exports = {
  'publishcomment' : function (browser) {
    var signinPage = browser.page.signin();
    signinPage
      .navigate()
      .signinWithUser({email:"dev@democracyos.eu",password:"democracyos"})

console.log("1")

    browser.pause(1000)
      .click('a.new-comment')
      .pause(1000)
      .setValue('#f-text',"commentaire")
      .pause(1000)
      .click('.form-submit.pull-right')

    console.log()


    browser
      .end();
  }
};
