import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
  {
    title: 'Design your Mind',
    Svg: require('../../static/img/thoughtprocess.svg').default,
    description: (
      <>
        Brains@Play was created to support anyone in their development of brain-responsive applications.
      </>
    ),
  },
  {
    title: 'Connect to the Brainstorm',
    Svg: require('../../static/img/connection.svg').default,
    description: (
      <>
        Brains@Play is the only neurotechnology framework to encourage and build community around social applications.
      </>
    ),
  },
  {
    title: 'Play with Everyone',
    Svg: require('../../static/img/accessibility.svg').default,
    description: (
      <>
        Brains@Play automates the accessibility of your app and supports 
        increased agency of those with neurological deficits.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} alt={title} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
