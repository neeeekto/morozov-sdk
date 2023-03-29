import type { FC } from 'react';
import type { ComponentStory } from '@storybook/react';

export const makeStoryFactory = <T>(render: FC<T>) => {
  return {
    create: (params: Partial<ComponentStory<FC<T>>>) => {
      const fn: any = render.bind({});
      Object.entries(params).forEach(([key, val]) => {
        fn[key] = val;
      });
      return fn;
    },
  };
};
