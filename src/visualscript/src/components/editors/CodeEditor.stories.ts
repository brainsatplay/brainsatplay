import { Story, Meta } from '@storybook/web-components';
import { CodeEditor, CodeEditorProps } from './CodeEditor';
import { Graph } from '../../../../core/index';

export default {
  title: 'Editor/Code',
  argTypes: {
  },
} as Meta;

const instance = new Graph({operator: (self, origin, input) => console.log(input)})
const Template: Story<Partial<CodeEditorProps>> = (args) => new CodeEditor(args);

export const Default = Template.bind({});
Default.args = {
  header: 'Instance',
  instance,
};

// export const Stacked = Template.bind({});
// Stacked.args = {
//   brand: {content: 'Brains@Play', link: 'https://brainsatplay.com', external: true},
//   primary,
//   secondary
// };