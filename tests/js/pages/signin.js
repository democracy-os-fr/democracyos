module.exports = {
  url: function() { 
    return this.api.launchUrl + "/signin"; 
  },
  elements: {
    form:{
      selector: "form.form"
    }, 
    email: {
      selector: "form.form input[name=email]"
    },
    password: {
      selector: "form.form input[name=password]"
    },
    signupBtn: {
      selector: ".signup a"
    }  
  },
  commands: [
    {
      signinWithUser: function(user) {
        return this
          .waitForElementVisible("@form", 1000)
          .setValue("@email", user.email)
          .setValue("@password", user.password)
          .submitForm("@form")
      }
    },
    {
      clickOnSignup: function() {
        return this
          .waitForElementVisible("@signupBtn", 1000)
          .click("@signupBtn")
      }
    }
  ]
};