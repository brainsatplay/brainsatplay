import { Story, Meta } from '@storybook/web-components';
import { Spectrogram, SpectrogramProps } from './Spectrogram';

export default {
  title: 'Streams/Data/Spectrogram',
  argTypes: {
    max: {
      control: {
        type: 'number', // Type 'select' is automatically inferred when 'options' is defined
        min: 0,
        max: 100,
        step: 1, 
        default: 1
      }
    }
  }
} as Meta;

const Template: Story<Partial<SpectrogramProps>> = (args) => new Spectrogram(args);

export const Default = Template.bind({});
Default.args = {
  data: Array.from({length: 100}, (_,i) => i)
};
