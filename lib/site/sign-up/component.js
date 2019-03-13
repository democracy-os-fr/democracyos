import React, { Component } from 'react'
import { Link } from 'react-router'
import bus from 'bus'
import t from 't-component'
import ReCAPTCHA from 'react-google-recaptcha'
import config from 'lib/config'
import FormAsync from 'lib/site/form-async'
import regexps from '../../regexps'

export default class SignUp extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      active: null,
      errors: null,
      name: '',
      lastName: '',
      username: '',
      email: '',
      pass: '',
      org: '',
      age: '',
      postal: '',
      job: '',
      captchaKey: ''
    }
    this.onSuccess = this.onSuccess.bind(this)
    this.onFail = this.onFail.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.saveName = this.saveName.bind(this)
    this.saveLastName = this.saveLastName.bind(this)
    this.saveUserName = this.saveUserName.bind(this)
    this.saveEmail = this.saveEmail.bind(this)
    this.savePass = this.savePass.bind(this)
    this.saveOrg = this.saveOrg.bind(this)
    this.saveAge = this.saveAge.bind(this)
    this.savePostal = this.savePostal.bind(this)
    this.saveJob = this.saveJob.bind(this)
    this.checkPassLength = this.checkPassLength.bind(this)
    this.onCaptchaChange = this.onCaptchaChange.bind(this)
    this.onSubmitClick = this.onSubmitClick.bind(this)
    this.validatePostal = this.validatePostal.bind(this)
  }

  componentWillMount () {
    bus.emit('user-form:load', 'signup')
    this.setState({ active: 'form' })
  }

  componentWillUnmount () {
    bus.emit('user-form:load', '')
  }

  onSubmit () {
    this.setState({ loading: true, errors: null })
  }

  onSuccess (res) {
    this.setState({
      loading: false,
      active: 'congrats',
      errors: null,
      captchaKey: ''
    })
  }

  onFail (err) {
    console.log('onFail')
    console.dir(err)
    this.setState({ loading: false, errors: err, captchaKey: '' })
  }

  saveName (e) {
    this.setState({ name: e.target.value })
  }

  saveLastName (e) {
    this.setState({ lastName: e.target.value })
  }

  saveUserName (e) {
    this.setState({ username: e.target.value })
  }

  saveEmail (e) {
    this.setState({ email: e.target.value })
  }

  savePass (e) {
    this.setState({ pass: e.target.value })
  }

  saveOrg (e) {
    this.setState({ org: e.target.value })
  }

  saveAge (e) {
    this.setState({ age: e.target.value })
  }

  savePostal (e) {
    this.setState({ postal: e.target.value })
  }

  saveJob (e) {
    this.setState({ job: e.target.value })
  }

  checkPassLength (e) {
    const passLength = e.target.value

    if (passLength.length < 6) {
      e.target.setCustomValidity(t('validators.min-length.plural', { n: 6 }))
    } else {
      if (e.target.name === 're_password' && e.target.value !== this.state.pass) {
        e.target.setCustomValidity(t('common.pass-match-error'))
      } else {
        e.target.setCustomValidity('')
      }
    }
  }

  onCaptchaChange (key) {
    this.setState({ captchaKey: key })
    this.refs.submitBtn.click()
  }

  onSubmitClick (e) {
    if (config.recaptchaSite && !this.state.captchaKey) {
      this.captcha.execute()
      e.preventDefault()
    }
  }

  validatePostal (e) {
    const value = e.target.value
    if (value.trim() !== '' && !regexps.postal.fr.test(value)) {
      e.target.setCustomValidity(t('user.extra.postal.validator'))
    } else {
      e.target.setCustomValidity('')
    }
  }

  render () {
    return (
      <div className='center-container'>
        {
          this.state.active === 'form' &&
          (
            <div id='signup-form'>
              <div className='title-page'>
                <div className='circle'>
                  <i className='icon-user' />
                </div>
                <h1>{t('signup.with-email')}</h1>
              </div>
              <FormAsync
                action='/api/signup'
                onSubmit={this.onSubmit}
                onSuccess={this.onSuccess}
                onFail={this.onFail}>
                {config.recaptchaSite && (
                  <ReCAPTCHA
                    ref={(el) => { this.captcha = el }}
                    size='invisible'
                    sitekey={config.recaptchaSite}
                    onChange={this.onCaptchaChange} />
                )}
                <input
                  type='hidden'
                  name='reference'
                  value={this.props.location.query.ref} />
                <ul
                  className={this.state.errors ? 'form-errors' : 'hide'}>
                  {
                    this.state.errors && this.state.errors
                      .map((error, key) => (<li key={key}>{error}</li>))
                  }
                </ul>
                <div className='form-group'>
                  <label htmlFor=''>{t('signup.email')}</label>
                  <input
                    type='email'
                    className='form-control'
                    name='email'
                    maxLength='200'
                    onChange={this.saveEmail}
                    placeholder={t('forgot.mail.example')}
                    required />
                </div>
                {/* <div className='form-group'>
                  <label htmlFor=''>{t('signup.your-firstname')}</label>
                  <input
                    type='text'
                    className='form-control'
                    id='firstName'
                    name='firstName'
                    maxLength='100'
                    placeholder={t('signup.firstname')}
                    onChange={this.saveName} />
                </div>
                <div className='form-group'>
                  <label htmlFor=''>{t('signup.your-lastname')}</label>
                  <input
                    type='text'
                    className='form-control'
                    id='lastName'
                    name='lastName'
                    maxLength='100'
                    onChange={this.saveLastName}
                    placeholder={t('signup.lastname')} />
                </div> */}
                <div className='form-group'>
                  <label htmlFor=''>{t('signup.your-username')}</label>
                  <input
                    type='text'
                    className='form-control'
                    id='username'
                    name='username'
                    maxLength='200'
                    onChange={this.saveUserName}
                    placeholder={t('signup.username')}
                    required />
                </div>
                <div className='form-group'>
                  <label htmlFor=''>{t('password')}</label>
                  <input
                    id='signup-pass'
                    className='form-control'
                    name='password'
                    type='password'
                    maxLength='200'
                    onChange={this.savePass}
                    onBlur={this.checkPassLength}
                    placeholder={t('password')}
                    required />
                </div>
                <div className='form-group'>
                  <label htmlFor=''>{t('signup.retype-password')}</label>
                  <input
                    type='password'
                    className='form-control'
                    name='re_password'
                    onBlur={this.checkPassLength}
                    required />
                </div>
                { (config.extra.user.org || config.extra.user.age || config.extra.user.job || config.extra.user.postal) && (
                  <div>
                    <hr />
                    { (config.extra.user.org) && (
                      <div className='form-group'>
                        <label htmlFor=''>{t('user.extra.org.label')}</label>
                        <input
                          type='text'
                          className='form-control'
                          id='org'
                          name='org'
                          maxLength='300'
                          onChange={this.saveOrg} />
                      </div>
                    )}{ (config.extra.user.age) && (
                      <div className='form-group'>
                        <label htmlFor=''>{t('user.extra.age.label')}</label>
                        <select id='age' name='age' className='form-control' onChange={this.saveAge}>
                          <option />
                          {[...Array(5)].map((x, i) =>
                            <option value={++i} key={i}>{t('user.extra.age.short.' + i)}</option>
                          )}
                        </select>
                      </div>
                    )}
                    { (config.extra.user.postal) && (
                      <div className='form-group'>
                        <label htmlFor=''>{t('user.extra.postal.label')}</label>
                        <input
                          type='text'
                          className='form-control'
                          id='postal'
                          name='postal'
                          maxLength='5'
                          onChange={this.savePostal}
                          onBlur={this.validatePostal} />
                      </div>
                    )}{ (config.extra.user.job) && (
                      <div className='form-group'>
                        <label htmlFor=''>{t('user.extra.job.label')}</label>
                        <select id='job' name='job' className='form-control' onChange={this.saveJob}>
                          <option />
                          {[...Array(8)].map((x, i) =>
                            <option value={++i} key={i}>{t('user.extra.job.' + i)}</option>
                          )}
                        </select>
                      </div>
                    )}
                    <hr />
                  </div>
                )}
                <div className='form-group'>
                  <button
                    ref='submitBtn'
                    onClick={this.onSubmitClick}
                    className={!this.state.loading ? 'btn btn-block btn-success btn-lg' : 'hide'}
                    type='submit'>
                    {t('signup.now')}
                  </button>
                  <button
                    className={this.state.loading ? 'loader-btn btn btn-block btn-default btn-lg' : 'hide'}>
                    <div className='loader' />
                    {t('signup.now')}
                  </button>
                </div>
                {
                    (!!config.termsOfService || !!config.privacyPolicy) &&
                    (
                      <div className='form-group accepting'>
                        <p className='help-block text-center'>
                          {t('signup.accepting')}
                        </p>
                        {
                          !!config.termsOfService &&
                          (
                            <Link
                              to='/help/terms-of-service'>
                              {t('help.tos.title')}
                            </Link>
                          )
                        }
                        {
                          !!config.privacyPolicy &&
                          (
                            <Link
                              to='/help/privacy-policy'>
                              {t('help.pp.title')}
                            </Link>
                          )
                        }
                      </div>
                    )
                  }
              </FormAsync>
            </div>
          )
        }
        {
          this.state.active === 'congrats' &&
          (
            <div id='signup-message'>
              <h1>{t('signup.welcome', { name: this.state.username })}</h1>
              <p className='lead'>{t('signup.received')}</p>
              <p className='lead'>{t('signup.check-email')}</p>
              <Link
                to='/signup/resend-validation-email'>
                {t('signup.resend-validation-email')}
              </Link>
            </div>
          )
        }
      </div>
    )
  }
}
