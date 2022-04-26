import { Story, Meta } from '@storybook/web-components';
import { ObjectEditor, ObjectEditorProps } from './ObjectEditor';
import object from './object';

export default {
  title: 'Editor/Object',
  argTypes: {
  },
} as Meta;

const Template: Story<Partial<ObjectEditorProps>> = (args) => new ObjectEditor(args);

export const Default = Template.bind({});
Default.args = {
  header: 'Object',
  target: object,
};

// export const Stacked = Template.bind({});
// Stacked.args = {
//   brand: {content: 'Brains@Play', link: 'https://brainsatplay.com', external: true},
//   primary,
//   secondary
// };