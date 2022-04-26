import { Story, Meta } from '@storybook/web-components';
import { Player, PlayerProps } from './Player';

export default {
  title: 'Streams/Video/Player',
} as Meta;

const Template: Story<Partial<PlayerProps>> = (args) => new Player(args);

export const Default = Template.bind({});

  Default.args = {
    source: 'http://vjs.zencdn.net/v/oceans.mp4',
    controls: true,
  };

// NOTE: Live Webcam cannot be bound in Storybook
// export const WebcamFeed = Template.bind({});
// navigator.mediaDevices.getUserMedia({video: true}).then(source => {
//   console.log(source)
//   WebcamFeed.source = source
// })
