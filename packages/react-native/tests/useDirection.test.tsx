import React from 'react';
import { render } from 'rut-dom';
import { useDirection, DirectionProvider } from '../src';

describe('useDirection()', () => {
  it('returns "ltr" if no context provided', () => {
    let dir;

    function Component() {
      dir = useDirection();

      return null;
    }

    render<{}>(<Component />);

    expect(dir).toBe('ltr');
  });

  it('returns the direction defined by the provider', () => {
    let dir;

    function Component() {
      dir = useDirection();

      return null;
    }

    render<{}>(
      <DirectionProvider direction="rtl" wrapper={<div />}>
        <Component />
      </DirectionProvider>,
    );

    expect(dir).toBe('rtl');
  });
});
