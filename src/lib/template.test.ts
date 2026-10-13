import { describe, expect, it } from 'vitest';

import { fillTemplate } from './template';

describe('fillTemplate', () => {
  it('fills known placeholders and leaves unknown ones alone', () => {
    expect(fillTemplate('It’s {time} ({zone}) {nope}', { time: '14:05', zone: 'GMT+3' })).toBe(
      'It’s 14:05 (GMT+3) {nope}',
    );
  });
});
