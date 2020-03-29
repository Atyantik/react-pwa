import React from 'react';
import GuestLayout from './guest-layout';
import localStyles from './local-styles.css';

export default () => (
  <GuestLayout>
    <div className="container p-b-md p-r-md p-l-md">
      <hr />
      <h1 className="title">Global CSS</h1>
      <div className="green-background p-t-xl p-b-xl p-l-md p-r-xl">
        This is the section that uses the global css class `green-background` written in
        &nbsp;&nbsp;
        <code>`src/resource/css/global.css`</code>
        &nbsp;&nbsp;
        Any CSS served or included from `resources` folder does not change the className to hash!
        {' '}
        This one may include any library css such as `date-picker` or
        {' '}
        any general purpose css from `resources` folder.
      </div>
      <hr />
      <h2 className="title">Local CSS</h2>
      <div className={`${localStyles.gray} p-t-xl p-b-xl p-l-md p-r-xl`}>
        This is the section that uses the local css class `gray` written in
        &nbsp;&nbsp;
        <code>`src/resource/components/local-styles.css`</code>
        &nbsp;&nbsp;
        Any CSS not served from `resources` folder does change the className to hash like
        {' '}
        <code>{localStyles.gray}</code>
        .
        {' '}
        This one may include any library css such as `date-picker` or
        {' '}
        any general purpose css from `resources` folder.
      </div>
    </div>
  </GuestLayout>
);
