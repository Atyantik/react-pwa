import React from 'react';
import Picture from '@pawjs/srcset/picture';
import GuestLayout from './guest-layout';
// eslint-disable-next-line
import CatDog from '../resources/img/dog-cat.jpg';
// eslint-disable-next-line
import CatDogSrcset from '../resources/img/dog-cat.jpg?sizes=1200w+1000w+800w+600w+400w&placeholder';

export default () => (
  <GuestLayout>
    <div className="container p-t-xl p-r-md p-l-md">
      <h1 className="title">Optimizing user image experience to the best possible level</h1>
      <p>
          The original size of the image below is
        {' '}
        <code>216.53 kb</code>
        {' '}
          You may check the repo. But with implementation of
        {' '}
        <strong>@pawjs/image-optimizer</strong>
        {' '}
          we were able to reduce the size of image by
        {' '}
        <strong>57%</strong>
          . Thus making the final size to just 91.2KB
      </p>
      <img alt="Cat & Dog Sleeping" src={CatDog} />
      <hr />
      <h2 className="title">Atyantik (ultimate) Optimization</h2>
      <div className="content">
        Well the above was not enough for us and thus we wanted
        {' '}
        more light weight image with undetectable quality loss!
        {' '}
        Below is the set of functionality we were looking at:
        <ol>
          <li>Best Auto Image optimization irrespective of its original size</li>
          <li>
            WebP Image format for latest browsers and fallback png/jpeg
            {' '}
            image for unsupported browsers.
          </li>
          <li>
            Different Images depending on the size of screen. Well that is very important,
            {' '}
            We don&quot;t want any user to download large images for mobile devices!
             Thus implementing srcset.
          </li>
          <li>
            Why load image instantaneously?
            {' '}
            If the SEO bots can wait for image to load, why not users as well?
             Thus implementing Lazy image loading.
          </li>
        </ol>

        <blockquote>
          <p>
            To fulfill such complex requirement with simple code we created
            {' '}
            <code>@pawjs/srcset, @pawjs/image-optimizer</code>
          </p>
        </blockquote>
        <div className="is-medium">
          <h3>Check below!</h3>
        </div>
      </div>
      <Picture alt="Cat & Dog" image={CatDogSrcset} />
    </div>
  </GuestLayout>
);
