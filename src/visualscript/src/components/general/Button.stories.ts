import { Story, Meta } from '@storybook/web-components';
import { Button, ButtonProps } from './Button';

export default {
  title: 'General/Button',
  argTypes: {

  },
} as Meta;

const Template: Story<Partial<ButtonProps>> = (args) => new Button(args);

export const Default = Template.bind({});
Default.args = {};
