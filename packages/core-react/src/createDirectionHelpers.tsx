import React, { cloneElement, createContext, useContext } from 'react';
import getDirection from 'direction';
import { Aesthetic, Direction } from '@aesthetic/core';
import createHOC from './createHOC';
import {
  DirectionContextType,
  DirectionProviderProps,
  WithDirectionWrappedProps,
  WrapperComponent,
  WrapperProps,
} from './types';

export default function createDirectionHelpers<Result, Block extends object>(
  aesthetic: Aesthetic<Result, Block>,
) /* infer */ {
  const DirectionContext = createContext<DirectionContextType>(
    aesthetic.getActiveDirection() || 'ltr',
  );

  /**
   * Explicitly define a direction or automatically infer a direction based on a string of text.
   * Will render an element with a `dir` attribute set.
   */
  function DirectionProvider({ children, direction, value, wrapper }: DirectionProviderProps) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const dir: Direction = direction || getDirection(value) || 'ltr';

    return (
      <DirectionContext.Provider value={dir}>
        {cloneElement(wrapper, { dir }, children)}
      </DirectionContext.Provider>
    );
  }

  /**
   * Hook within a component to return the current RTL direction.
   */
  function useDirection(): Direction {
    return useContext(DirectionContext);
  }

  /**
   * Wrap a React component with an HOC that injects the current direction object as a prop.
   */
  function withDirection() /* infer */ {
    return function withDirectionComposer<Props extends object = {}>(
      WrappedComponent: React.ComponentType<Props & WithDirectionWrappedProps>,
    ): React.FunctionComponent<Omit<Props, keyof WithDirectionWrappedProps> & WrapperProps> &
      WrapperComponent {
      return createHOC(
        'withDirection',
        WrappedComponent,
        // eslint-disable-next-line prefer-arrow-callback
        function WithDirection({ wrappedRef, ...props }) {
          const direction = useDirection();

          return <WrappedComponent {...(props as any)} ref={wrappedRef} direction={direction} />;
        },
      );
    };
  }

  return {
    DirectionContext,
    DirectionProvider,
    useDirection,
    withDirection,
  };
}
