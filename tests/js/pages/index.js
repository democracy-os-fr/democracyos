module.exports = {
  url: function() {
    return this.api.launchUrl;
  },
  elements: {
    loginBtn: {
  		selector: ".user-nav .login"
  	},
    loginSubmit: {
  		selector: "#signin-form .btn.btn-block.btn-primary.btn-lg"
  	},
    userBadgeName: ".user-badge .name"
  },
  commands: [
    {
      clickOnSignin: function() {
        return this
          .waitForElementVisible("@loginBtn", 1000 , false)
          .waitForElementVisible("@loginSubmit", 1000 )
          .click("@loginBtn")
      }
    }
  ]
};
