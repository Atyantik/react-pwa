import React, { Component } from "react";
import ReactLogo from "resources/images/reactjs.svg";

export default class Home extends Component {
  render() {

    return (
      <div className="mt-4">
        <img style={{ maxWidth: "150px" }} className="img-fluid mx-auto d-block" src={ReactLogo} alt="ReactJS"/>
        <h1>React ES6 SEO Boilerplate</h1>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          Mauris bibendum enim quis ligula congue consequat. Maecenas
          a neque ac diam elementum sollicitudin. Praesent a libero sit
          amet justo viverra mattis vitae ac nulla. Aenean eget tincidunt
          urna. Suspendisse quis iaculis ex. Proin nec ante eros. Donec
          eu eros vitae nunc auctor imperdiet. Praesent nec tortor eget
          magna gravida posuere. Sed at velit at est dictum mollis. Pellentesque
          ullamcorper dapibus nulla, efficitur pharetra nisi sodales ut.
        </p>
        <p>
          Cras at elementum magna. Proin sed vulputate erat. Quisque magna nibh,
          posuere in mattis id, consectetur non nunc. Sed sodales diam risus,
          non facilisis augue cursus id. Nulla non magna at tellus tempor
          efficitur id nec ex. Vestibulum a ex a dolor dapibus vulputate.
          Etiam ac diam vestibulum, commodo lacus nec, feugiat diam. Mauris
          sollicitudin pellentesque pretium. Suspendisse at tempus lectus.
          Vivamus euismod velit quis tincidunt pulvinar. In posuere, libero sed
          condimentum fringilla, tortor mi maximus dolor, eget aliquam turpis
          libero at sem. Ut pulvinar, odio a vestibulum pretium, ante leo volutpat
          massa, in suscipit diam tortor id odio. Nunc convallis vitae felis eget aliquet.
        </p>
      </div>
    );
  }
}