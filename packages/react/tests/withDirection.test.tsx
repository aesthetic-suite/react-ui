import React from 'react';
import { render } from 'rut-dom';
import {
	DirectionProvider,
	DirectionProviderProps,
	withDirection,
	WithDirectionWrappedProps,
} from '../src';
import { setupAestheticReact, teardownAestheticReact } from './helpers';

describe('withDirection()', () => {
	beforeEach(() => {
		setupAestheticReact();
	});

	afterEach(() => {
		teardownAestheticReact();
	});

	function BaseComponent(props: WithDirectionWrappedProps) {
		return null;
	}

	function WrappingComponent({ children }: { children?: React.ReactNode }) {
		return <DirectionProvider direction="ltr">{children ?? <div />}</DirectionProvider>;
	}

	it('inherits name from component `constructor.name`', () => {
		const Wrapped = withDirection()(BaseComponent);

		expect(Wrapped.displayName).toBe('withDirection(BaseComponent)');
	});

	it('inherits name from component `displayName`', () => {
		function DisplayComponent() {
			return null;
		}

		DisplayComponent.displayName = 'CustomDisplayName';

		const Wrapped = withDirection()(DisplayComponent);

		expect(Wrapped.displayName).toBe('withDirection(CustomDisplayName)');
	});

	it('stores the original component as a static property', () => {
		const Wrapped = withDirection()(BaseComponent);

		expect(Wrapped.WrappedComponent).toBe(BaseComponent);
	});

	it('receives direction from provider', () => {
		function DirComponent(props: { direction?: {} }) {
			return <div />;
		}

		const Wrapped = withDirection()(DirComponent);
		const { root } = render<{}>(<Wrapped />, { wrapper: <WrappingComponent /> });

		expect(root.findOne(DirComponent)).toHaveProp('direction', 'ltr');
	});

	it('can bubble up the ref with `wrappedRef`', () => {
		interface RefProps {
			unknown?: boolean;
		}

		// eslint-disable-next-line react/prefer-stateless-function
		class RefComponent extends React.Component<RefProps & WithDirectionWrappedProps> {
			override render() {
				return <div />;
			}
		}

		let foundRef: Function | null = null;
		const Wrapped = withDirection()(RefComponent);

		render<{}>(
			<Wrapped
				wrappedRef={(ref: Function | null) => {
					foundRef = ref;
				}}
			/>,
			{ wrapper: <WrappingComponent /> },
		);

		expect(foundRef).not.toBeNull();
		expect(foundRef!.constructor.name).toBe('RefComponent');
	});

	it('returns new direction if direction context changes', () => {
		const Wrapped = withDirection()(BaseComponent);
		const { root, update } = render<DirectionProviderProps>(
			<DirectionProvider direction="rtl">
				<Wrapped />
			</DirectionProvider>,
		);

		expect(root.findOne(BaseComponent)).toHaveProp('direction', 'rtl');

		update({ direction: 'ltr' });

		expect(root.findOne(BaseComponent)).toHaveProp('direction', 'ltr');
	});
});
