module.exports = {

  url: function() { 
    return this.api.launchUrl + "/signup"; 
  },
  elements: {
    form:{
      selector: "#signup-form form"
    }, 
    email: {
      selector: " input[name=email]"
    },
    password: {
      selector: " input[name=password]"
    },
    firstName: {
      selector: " input#firstName"
    },
    lastName: {
      selector: " input#lastName"
    },
    rePassword: {
      selector: " input[name=re_password]"
    }
  },
  commands: [
    {
      signupWithUser: function(user) {
        return this.waitForElementVisible("@form", 1000)
          .setValue("@email", user.email)
          .setValue("@firstName", user.firstName)
          .setValue("@lastName", user.lastName)
          .setValue("@password", user.password)
          .setValue("@rePassword", user.password)
          .submitForm("@form")
      }
    }
  ]
};