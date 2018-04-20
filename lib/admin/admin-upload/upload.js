import React, { Component } from 'react'
import urlBuilder from 'lib/url-builder'
export default class AdminUpload extends Component {
    render() {
        const { forum } = this.props
        return (
            <div>
           <form ref='uploadForm' 
      id='uploadForm' 
      action='/api/v2/upload.jpg'
      method='post' 
      encType="multipart/form-data">
        <input type="file" name="sampleFile" />
        <input type='submit' value='Upload Image!' />
    </form>     

          </div>
                  );
      }
    }
    