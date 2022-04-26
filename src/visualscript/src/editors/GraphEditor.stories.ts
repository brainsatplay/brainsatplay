import { Story, Meta } from '@storybook/web-components';
import { GraphEditor, GraphEditorProps } from './GraphEditor';
import { Graph } from '../brainatplay';

export default {
  title: 'Editor/Graph',
  argTypes: {
  },
} as Meta;

const graph = new Graph()

const Template: Story<Partial<GraphEditorProps>> = (args) => new GraphEditor(args);

export const Default = Template.bind({});
Default.args = {
  header: 'Graph',
  graph,
};

// export const Stacked = Template.bind({});
// Stacked.args = {
//   brand: {content: 'Brains@Play', link: 'https://brainsatplay.com', external: true},
//   primary,
//   secondary
// };