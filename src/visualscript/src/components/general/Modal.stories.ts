import { Story, Meta } from '@storybook/web-components';
import { Modal, ModalProps } from './Modal';

export default {
  title: 'General/Modal',
  argTypes: {

  },
} as Meta;

const Template: Story<Partial<ModalProps>> = (args) => new Modal(args);

export const Default = Template.bind({});
Default.args = {
  open: true,
  header: "Modal Header",
  footer: "Modal Footer"
};
