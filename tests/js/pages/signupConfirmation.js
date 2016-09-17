module.exports = {

  url: function() { 
    return this.api.launchUrl + "/signup"; 
  },
  elements: {
    successMessage: {
      selector: "#signup-message h1"
    }
  }
};