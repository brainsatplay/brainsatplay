import { Story, Meta } from '@storybook/web-components';
import { Nav, NavProps } from './Nav';

export default {
  title: 'General/Nav',
  argTypes: {
  },
} as Meta;

const Template: Story<Partial<NavProps>> = (args) => new Nav(args);

const primary = {
  menu: [
    {content: 'Products'},
    {content: 'Solutions'},
    {content: 'Services'},
    {content: 'Resources'},
    {content: 'Ethos'}

  ],
  options: [
    {content: 'Contact'},
    {content: 'Login'}
  ]
}

const secondary = [
  {content: 'Platform', link: 'https://app.brainsatplay.com', external: true},
  {content: 'Studio', link: 'https://app.brainsatplay.com/#studio', external: true},
  {content: 'Developers', link: 'https://docs.brainsatplay.com', external: true},
  {content: 'Community', link: 'https://discord.gg/tQ8P79tw8j', external: true},
  {content: 'Contribute', type: 'button', link: 'https://github.com/brainsatplay', external: true},
]

export const Default = Template.bind({});
Default.args = {
  brand: {content: 'Brains@Play', link: 'https://brainsatplay.com', external: true},
  primary
};


export const Stacked = Template.bind({});
Stacked.args = {
  brand: {content: 'Brains@Play', link: 'https://brainsatplay.com', external: true},
  primary,
  secondary
};