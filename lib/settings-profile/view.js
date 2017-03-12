import debug from 'debug';
import t from 't-component';
import user from '../user/user.js';
import FormView from '../form-view/form-view';
import template from './template.jade';
import config from '../config/config';

let log = debug('democracyos:settings-profile');

export default class ProfileForm extends FormView {

  /**
   * Creates a profile edit view
   */

  constructor (options) {
    super();
    this.options = options;
    FormView.call(this, template, this.options);
  }

  /**
   * Turn on event bindings
   */

  switchOn () {
    this.on('success', this.bound('onsuccess'));

    // Upload file event
    this.find('#file_input').on('change', () => { this.init_upload(); });

    // Locales

    this.locales = this.find('select#locale')[0];

    config.availableLocales.forEach((locale) => {
      var option = document.createElement('option');
      option.value = locale;
      option.innerHTML = t(`settings.locale.${locale}`);
      this.locales.appendChild(option);
    });

    this.locales.value = user.locale || config.locale;
    var selected = this.find(`select#locale option[value="${this.locales.value}"]`);
    selected.attr('selected', true);

    // Locations

    this.locations = this.find('select#location')[0];

    // Age
    if(config.userAge) {
      this.ages = this.find('select#age')[0];

      for (var i = 1; 14 >= i; i+=1) {
        var option = document.createElement('option');
        option.value = i;
        option.innerHTML = t(`settings.age.${i}`);
        this.ages.appendChild(option);
      }

      if(user.age) {
        this.ages.value = user.age;
        var selectedAge = this.find(`select#age option[value="${this.ages.value}"]`);
        selectedAge.attr('selected', true);
      } else {
        var selectedAge = this.find(`select#age option[value="0"]`);
        selectedAge.attr('selected', true);
      }
    }

  }

  /**
   * Turn off event bindings
   */

  switchOff () {
    this.off();
  }

  /**
   * Handle `error` event with
   * logging and display
   *
   * @param {String} error
   * @api private
   */

  onsuccess () {
    log('Profile updated');
    user.load('me');
    user.once('loaded', () => {
      this.find('img').attr('src', user.profilePicture());
      this.messages([t('settings.successfuly-updated')], 'text-success');

      if (user.locale && user.locale !== config.locale) {
        setTimeout(function(){
          window.location.reload();
        }, 10);
      }
    });
  }

  /**
   * Sanitizes form input data. This function has side effect on parameter data.
   * @param  {Object} data
   */

  postserialize (data) {
    data.firstName = data.firstName.trim().replace(/\s+/g, ' ');
    data.lastName = data.lastName.trim().replace(/\s+/g, ' ');
  }

  /*
      Function to get the temporary signed request from the app.
      If request successful, continue to upload the file using this signed
      request.
  */
  get_signed_request(file){
      var that = this;
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "/settings/s3?file_name="+file.name+"&file_type="+file.type);
      xhr.onreadystatechange = function(){
        if(this.readyState === 4){
          if(this.status === 200){
            var response = JSON.parse(xhr.responseText);
            // Carry out the actual PUT request to S3 using the signed request from the app.
            var xhr2 = new XMLHttpRequest();
            xhr2.open("PUT", unescape(response.signed_request));
            xhr2.setRequestHeader('x-amz-acl', 'public-read');
            xhr2.onload = function(e) {
              if (this.status === 200) {
                document.getElementById('userProfilePicture').src = response.url;
                document.getElementById('profilePictureUrl').value = response.url;
              }
            };
            xhr2.onerror = function(e) {
              that.messages(['Could not upload file'], 'text-danger');
            };
            xhr2.send(file);
          }
          else{
            that.messages(['Could not get signed URL'], 'error');
          }
        }
      };
      xhr.send();
  }

  /*
     Function called when file input updated. If there is a file selected, then
     start upload procedure by asking for a signed request from the app.
  */
  init_upload(){
      var files = document.getElementById("file_input").files;
      var file = files[0];
      if(file == null){
          return;
      }
      this.get_signed_request(file);
  }

}
