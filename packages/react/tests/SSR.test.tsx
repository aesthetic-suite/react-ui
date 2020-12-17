/* eslint-disable react/jsx-no-literals */

import React from 'react';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import { StyleEngine } from '@aesthetic/style';
import { createServerEngine, extractStyles, renderToStyleMarkup } from '@aesthetic/style/server';
import { useStyles, ThemeProvider } from '../src';
import { createStyleSheet, ButtonProps } from './__mocks__/Button';
import { setupAestheticReact, teardownAestheticReact } from './helpers';

describe('SSR', () => {
  let engine: StyleEngine;

  function Button({ children, block, disabled, large, small }: ButtonProps) {
    const cx = useStyles(createStyleSheet());

    return (
      <button
        type="button"
        className={cx(
          {
            // eslint-disable-next-line no-nested-ternary
            size: large ? 'lg' : small ? 'sm' : 'df',
          },
          'button',
          block && 'button_block',
          disabled && 'button_disabled',
        )}
      >
        {children}
      </button>
    );
  }

  function App() {
    return (
      <ThemeProvider name="twilight">
        <main>
          <div>You are not logged in!</div>
          <Button href="/login">Login</Button>
          <Button href="/register">Register</Button>
        </main>
      </ThemeProvider>
    );
  }

  beforeEach(() => {
    setupAestheticReact();

    engine = createServerEngine();
  });

  afterEach(() => {
    teardownAestheticReact();

    // @ts-expect-error
    delete global.AESTHETIC_CUSTOM_ENGINE;
  });

  describe('renderToString()', () => {
    it('renders markup', () => {
      expect(renderToString(extractStyles(<App />, engine))).toMatchSnapshot();
      expect(renderToStyleMarkup(engine)).toMatchSnapshot();
    });
  });

  describe('renderToStaticMarkup()', () => {
    it('renders markup', () => {
      expect(renderToStaticMarkup(extractStyles(<App />, engine))).toMatchSnapshot();
      expect(renderToStyleMarkup(engine)).toMatchSnapshot();
    });
  });
});
