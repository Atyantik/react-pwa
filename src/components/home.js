import React from 'react';
import PropTypes from 'prop-types';
import GuestLayout from './guest-layout';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import {info} from './fakedata';

const Column = (props) => {
  const { title, description, link } = props;
  return (
    <div className="column">
      <div className="card">
        <header className="card-header">
          <p className="card-header-title">
            {title}
          </p>
        </header>
        <div className="card-content">
          <div className="content">
            {description}
            {' '}
            {!!link.length && (
              <a
                href={link}
                target="_blank"
                rel="noreferrer noopener nofollow"
              >
                Read more
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
Column.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
};

const CardList = ({ info }) => {
  const cardsArray = info.map(info => (
    <div style={{marginBottom: '1rem'}}>
      <Card>
        <CardContent>
          <Typography variant='h3'>{info.title}</Typography>
          <Typography>{info.description}</Typography>
          <Typography>{info.img}</Typography>
        </CardContent>
      </Card>
    </div>
  ));

  return (
    <div>
      {cardsArray}
    </div>
  );
};

export default () => (
  <GuestLayout>
    <section className="m-t-lg">
      <div className="container p-l-md p-r-md">
        <h4 className="title is-4" style={{textAlign:'center'}}>
          stay at home!! here are some stuff you can do when you're bored:
        </h4>
        <div>
          <CardList info={info} />
        </div>
      </div>
    </section>
  </GuestLayout>
);
