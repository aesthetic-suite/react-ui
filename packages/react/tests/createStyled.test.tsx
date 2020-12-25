/* eslint-disable react/jsx-no-literals */

import React from 'react';
import { render } from 'rut-dom';
import { StyleSheet } from '@aesthetic/core';
import { getRenderedStyles } from '@aesthetic/style/test';
import { createStyled } from '../src';
import { Wrapper } from './__mocks__/Button';
import { setupAestheticReact, teardownAestheticReact } from './helpers';

describe('createStyled()', () => {
  beforeEach(() => {
    setupAestheticReact();
  });

  afterEach(() => {
    teardownAestheticReact();
  });

  it('errors for a non-react element type', () => {
    expect(() =>
      createStyled(
        // @ts-expect-error
        123,
        {},
      ),
    ).toThrow('Styled components must extend an HTML element or React component, found number.');
  });

  it('errors for invalid style sheet factory', () => {
    expect(() =>
      createStyled(
        'div',
        // @ts-expect-error
        true,
      ),
    ).toThrow('Styled components require a style sheet factory function, found boolean.');
  });

  it('sets static properties on component', () => {
    const Button = createStyled('button', {});

    expect(Button.displayName).toBe('styled(button)');
    expect(Button.styleSheet).toBeInstanceOf(StyleSheet);

    const ComposedButton = createStyled(Button, {});

    expect(ComposedButton.displayName).toBe('styled(styled(button))');
    expect(ComposedButton.styleSheet).toBeInstanceOf(StyleSheet);
  });

  it('creates and renders a button with defined styles', () => {
    const Button = createStyled('button', () => ({
      display: 'inline-flex',
      textAlign: 'center',
      padding: '1rem',
    }));

    const { debug } = render<{}>(<Button>Test</Button>, {
      wrapper: <Wrapper />,
    });

    expect(debug({ log: false })).toMatchSnapshot();
    expect(getRenderedStyles('standard')).toMatchSnapshot();
  });

  it('only renders styles twice (create and mount), even when component rerenders', () => {
    const spy = jest.fn(() => ({
      textDecoration: 'none',
    }));

    const Link = createStyled('a', spy);

    const { debug, update } = render<{}>(<Link href="/foo/bar">Test</Link>, {
      wrapper: <Wrapper theme="dawn" />,
    });

    update();
    update();
    update();

    expect(spy).toHaveBeenCalledTimes(2);
    expect(debug({ log: false })).toMatchSnapshot();
    expect(getRenderedStyles('standard')).toMatchSnapshot();
  });

  it('can pass custom props/attributes', () => {
    const Input = createStyled('input', {
      border: '1px solid black',
      padding: '1rem',
      ':focus': {
        outline: 'none',
      },
    });

    const { debug } = render<{}>(
      <Input disabled={false} type="text" placeholder="Search..." className="will-be-appended" />,
      {
        wrapper: <Wrapper />,
      },
    );

    expect(debug({ log: false })).toMatchSnapshot();
    expect(getRenderedStyles('standard')).toMatchSnapshot();
  });

  it('can use and define CSS variables', () => {
    const Code = createStyled('code', (css) => ({
      fontSize: css.var('text-sm-size'),
      lineHeight: css.tokens.text.sm.lineHeight,
      '@variables': {
        elementLevelVar: 'nice',
      },
    }));

    const { debug } = render<{}>(<Code />, {
      wrapper: <Wrapper />,
    });

    expect(debug({ log: false })).toMatchSnapshot();
    expect(getRenderedStyles('standard')).toMatchSnapshot();
  });

  describe('variants', () => {
    interface AlertProps {
      palette?: 'success' | 'failure' | 'warning';
    }

    function createAlert() {
      return createStyled<'div', AlertProps>('div', (css) => ({
        background: css.var('palette-neutral-bg-base'),
        '@variants': {
          palette: {
            success: {
              background: css.var('palette-success-bg-base'),
            },
            failure: {
              background: css.var('palette-failure-bg-base'),
            },
            warning: {
              background: css.var('palette-warning-bg-base'),
            },
          },
        },
      }));
    }

    it('supports variants', () => {
      const Alert = createAlert();

      const { debug, update } = render<AlertProps>(
        <Alert palette="success">
          <div>
            <h1>Title</h1>And other content!
          </div>
        </Alert>,
        {
          wrapper: <Wrapper />,
        },
      );

      expect(debug({ log: false })).toMatchSnapshot();
      expect(getRenderedStyles('standard')).toMatchSnapshot();

      update({ palette: 'failure' });

      expect(debug({ log: false })).toMatchSnapshot();

      update({ palette: undefined });

      expect(debug({ log: false })).toMatchSnapshot();
    });

    it('doesnt pass the variant prop to the HTML element', () => {
      const Alert = createAlert();

      const { debug } = render<AlertProps>(<Alert palette="success" />, {
        wrapper: <Wrapper />,
      });

      expect(debug({ log: false })).toMatchSnapshot();
    });

    it('inherits and merges variant props and types when composing', () => {
      const Alert = createAlert();

      const SubAlert = createStyled<typeof Alert, { size?: 'sm' | 'lg' }>(Alert, {
        '@variants': {
          size: {
            sm: { padding: 1 },
            lg: { padding: 2 },
          },
        },
      });

      const { debug } = render<AlertProps>(<SubAlert palette="success" size="lg" />, {
        wrapper: <Wrapper />,
      });

      expect(debug({ log: false })).toMatchSnapshot();
    });
  });

  describe('composition', () => {
    it('supports extending non-styled components', () => {
      function Base({ children, className }: { children: React.ReactNode; className?: string }) {
        return (
          <button type="button" className={className}>
            {children}
          </button>
        );
      }

      const Button = createStyled(Base, () => ({
        display: 'inline-flex',
        textAlign: 'center',
        padding: '1rem',
      }));

      const { debug } = render<{}>(<Button className="test">Normal</Button>, {
        wrapper: <Wrapper />,
      });

      expect(debug({ log: false })).toMatchSnapshot();
      expect(getRenderedStyles('standard')).toMatchSnapshot();
    });

    it('supports extending other styled components', () => {
      const Button = createStyled('button', () => ({
        display: 'inline-flex',
        textAlign: 'center',
        padding: '1rem',
      }));

      const BlockButton = createStyled(Button, {
        display: 'flex',
        width: '100%',
      });

      const LargeBlockButton = createStyled(BlockButton, {
        padding: '2rem',
        fontSize: 18,
      });

      const { debug } = render<{}>(
        <>
          <Button type="button">Normal</Button>
          <BlockButton type="submit">Block</BlockButton>
          <LargeBlockButton disabled>Large</LargeBlockButton>
        </>,
        {
          wrapper: <Wrapper />,
        },
      );

      expect(debug({ log: false })).toMatchSnapshot();
      expect(getRenderedStyles('standard')).toMatchSnapshot();
    });

    it('can access the ref from multiple layers of composition', () => {
      const Leaf = createStyled('main', {});
      const Branch = createStyled(Leaf, {});
      const Trunk = createStyled(Branch, {});
      const Root = createStyled(Trunk, {});

      const svg = document.createElement('main');
      const spy = jest.fn();
      const { debug } = render<{}>(<Root ref={spy} />, {
        mockRef: () => svg,
        wrapper: <Wrapper />,
      });

      expect(spy).toHaveBeenCalledWith(svg);
      expect(debug({ log: false })).toMatchSnapshot();
    });
  });
});
