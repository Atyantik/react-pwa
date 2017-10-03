import React, { Component } from "react";
import Fold from "../../../core/components/fold" ;
import ReactLogo from "../../../resources/images/reactjs.svg";
import SmallImage from "../../../resources/images/mario-large.png?sizes=100w+200w+800w+1000w&placeholder";

console.log(SmallImage);

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
        <Fold>
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
          <p>Image sample converted to webp, uploaded/coded as jpg</p>
          {/*<Picture
            image={SmallImage}
            alt="Small Image"
          />*/}
          <picture>
            {Array.map(SmallImage, (img, index) => {
              return <source type={img.type} srcSet={img.srcSet} key={index}/>;
            })}
            <img className="img-fluid mx-auto d-block" src={SmallImage[0].placeholder.url} alt="Small Image" />
          </picture>
        </Fold>
      </div>
    );
  }
}