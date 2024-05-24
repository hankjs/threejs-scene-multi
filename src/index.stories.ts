import type { Meta, StoryObj } from "@storybook/vue3";
import Index from "./index.vue";

const meta = {
  component: Index,
} satisfies Meta<typeof Index>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
