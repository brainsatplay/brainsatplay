import { Story, Meta } from '@storybook/web-components';
import { TimeSeries, TimeSeriesProps } from './TimeSeries';

export default {
  title: 'Streams/Data/TimeSeries',
  argTypes: {
    seconds: {
      control: {
        type: 'number', // Type 'select' is automatically inferred when 'options' is defined
        min: 0,
        max: 60,
        step: .1, 
      }
    },
    // sps: {
    //   control: {
    //     type: 'number', // Type 'select' is automatically inferred when 'options' is defined
    //     min: 0,
    //     max: 512,
    //     step: 1, 
    //   }
    // },
    // backgroundColor: {
    //   control: {
    //     type: 'color', // Type 'select' is automatically inferred when 'options' is defined
    //   }
    // }
  }
} as Meta;

const Template: Story<Partial<TimeSeriesProps>> = (args) => new TimeSeries(args);

export const Default = Template.bind({});
Default.args = {
  // TimeSeries: 0
};