/* eslint-disable react/jsx-no-literals */

import React from 'react';
import { View } from 'react-native';
import { render } from '@testing-library/react-native';
import {
	ComponentSheet,
	NativeRule,
	NativeStyles,
	ThemeProvider,
	withStyles,
	WithStylesWrappedProps,
} from '../src';
import {
	ButtonProps,
	createAdditionalStyleSheet,
	createStyleSheet,
	Wrapper,
} from './__fixtures__/Button';
import { dawnTheme, setupAestheticReact, teardownAestheticReact, twilightTheme } from './helpers';

describe('withStyles()', () => {
	let sheet: ComponentSheet<
		'button_block' | 'button_disabled' | 'button',
		NativeRule,
		NativeStyles
	>;

	beforeEach(() => {
		setupAestheticReact();
		sheet = createStyleSheet();
	});

	afterEach(() => {
		teardownAestheticReact();
	});

	function BaseButton({
		children,
		compose: sx,
		block,
		disabled,
		large,
		small,
	}: ButtonProps &
		WithStylesWrappedProps<
			'button_block' | 'button_disabled' | 'button_large' | 'button_small' | 'button'
		>) {
		return (
			<View
				style={sx(
					{
						// eslint-disable-next-line no-nested-ternary
						size: large ? 'lg' : small ? 'sm' : 'df',
					},
					'button',
					block && 'button_block',
					disabled && 'button_disabled',
				)}
				testID="button"
			>
				{children}
			</View>
		);
	}

	function MultiSheetButton({
		children,
		compose: cx,
		icon,
	}: ButtonProps & WithStylesWrappedProps<'button' | 'icon'>) {
		return (
			<View style={cx('button', icon && 'icon')} testID="button">
				{children}
			</View>
		);
	}

	// Props need to exist for generic inheritance to work correctly
	interface BaseComponentProps {
		unknown?: unknown;
	}

	function BaseComponent(props: BaseComponentProps & WithStylesWrappedProps<string>) {
		return null;
	}

	function WrappingComponent({ children }: { children?: React.ReactNode }) {
		return <ThemeProvider name="dawn">{children ?? <View />}</ThemeProvider>;
	}

	it('inherits name from component `constructor.name`', () => {
		const Wrapped = withStyles(sheet)(BaseComponent);

		expect(Wrapped.displayName).toBe('withStyles(BaseComponent)');
	});

	it('inherits name from component `displayName`', () => {
		function DisplayComponent() {
			return null;
		}

		DisplayComponent.displayName = 'CustomDisplayName';

		const Wrapped = withStyles(sheet)(DisplayComponent);

		expect(Wrapped.displayName).toBe('withStyles(CustomDisplayName)');
	});

	it('stores the original component as a static property', () => {
		const Wrapped = withStyles(sheet)(BaseComponent);

		expect(Wrapped.WrappedComponent).toBe(BaseComponent);
	});

	it('can bubble up the ref with `wrappedRef`', () => {
		interface RefProps {
			unknown?: boolean;
		}

		// eslint-disable-next-line react/prefer-stateless-function
		class RefComponent extends React.Component<RefProps & WithStylesWrappedProps<string>> {
			override render() {
				return <View />;
			}
		}

		let foundRef: Function | null = null;
		const Wrapped = withStyles(sheet)(RefComponent);

		render(
			<Wrapped
				wrappedRef={(ref: Function | null) => {
					foundRef = ref;
				}}
			/>,
			{ wrapper: WrappingComponent },
		);

		expect(foundRef).not.toBeNull();
		expect(foundRef!.constructor.name).toBe('RefComponent');
	});

	it('renders a button and its base styles', () => {
		const Button = withStyles(sheet)(BaseButton);
		const result = render(<Button>Child</Button>, {
			wrapper: Wrapper,
		});

		expect(result.getByTestId('button').props.style).toEqual([
			{
				':active': {
					backgroundColor: '#000',
				},
				':hover': {
					backgroundColor: '#000',
				},
				appearance: 'none',
				backgroundColor: '#000',
				border: 0,
				color: '#000',
				cursor: 'pointer',
				display: 'flex',
				margin: 0,
				padding: 0,
				position: 'relative',
				textAlign: 'center',
				textDecoration: 'none',
				userSelect: 'auto',
				width: 'auto',
				verticalAlign: 'middle',
			},
			{ minWidth: '10rem', padding: '1.25rem 2.50rem' },
		]);
	});

	it('only renders once unless theme or direction change', () => {
		const Button = withStyles(sheet)(BaseButton);
		const spy = jest.spyOn(sheet, 'render');

		const { update } = render(<Button>Child</Button>, {
			wrapper: Wrapper,
		});

		update(<Button>Child</Button>);
		update(<Button>Child</Button>);
		update(<Button>Child</Button>);

		expect(spy).toHaveBeenCalledTimes(1);
	});

	it('re-renders if direction changes', () => {
		const Button = withStyles(sheet)(BaseButton);
		const spy = jest.spyOn(sheet, 'render');

		const { rerender } = render(
			<Wrapper>
				<Button>Child</Button>
			</Wrapper>,
		);

		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenCalledWith(
			expect.anything(),
			twilightTheme,
			expect.objectContaining({
				direction: 'ltr',
				theme: 'twilight',
			}),
		);

		rerender(
			<Wrapper direction="rtl">
				<Button>Child</Button>
			</Wrapper>,
		);

		expect(spy).toHaveBeenCalledTimes(2);
		expect(spy).toHaveBeenCalledWith(
			expect.anything(),
			twilightTheme,
			expect.objectContaining({
				direction: 'rtl',
				theme: 'twilight',
			}),
		);
	});

	it('re-renders if theme changes', () => {
		const Button = withStyles(sheet)(BaseButton);
		const spy = jest.spyOn(sheet, 'render');

		const { rerender } = render(
			<Wrapper>
				<Button>Child</Button>
			</Wrapper>,
		);

		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenCalledWith(
			expect.anything(),
			twilightTheme,
			expect.objectContaining({
				direction: 'ltr',
				theme: 'twilight',
			}),
		);

		rerender(
			<Wrapper theme="dawn">
				<Button>Child</Button>
			</Wrapper>,
		);

		expect(spy).toHaveBeenCalledTimes(2);
		expect(spy).toHaveBeenCalledWith(
			expect.anything(),
			dawnTheme,
			expect.objectContaining({
				direction: 'ltr',
				theme: 'dawn',
			}),
		);
	});

	it('supports rendering multiple style sheets', () => {
		const Button = withStyles(sheet, createAdditionalStyleSheet())(MultiSheetButton);

		const result = render(<Button>Child</Button>, {
			wrapper: Wrapper,
		});

		expect(result.getByTestId('button').props.style).toEqual([
			expect.objectContaining({ position: 'absolute' }),
		]);

		result.update(<Button icon>Child</Button>);

		expect(result.getByTestId('button').props.style).toEqual([
			expect.objectContaining({ position: 'absolute' }),
			expect.objectContaining({ flex: 1 }),
		]);
	});
});
