import { IS_PRODUCTION } from '@/constants'

const INVARIANT_MESSAGE_PREFIX: string = 'Invariant Violation'

/**
 * Asserts that `condition` is truthy otherwise throws an `Error` with the given
 * `message` if provided (prefixed with "Invariant Violation: ") otherwise a default message.
 *
 * In production the error message is stripped to only "Invariant Violation".
 *
 * Type is narrowed via TypeScript `asserts` to strip `undefined`/`null` from a value's type
 * or signal an unreachable branch to the compiler.
 *
 * Falsey values that will throw: `false`, `0`, `""`, `null`, `undefined`, `NaN`.
 *
 * @throws {Error} when `condition` is falsy. Error messages are prefixed with "Invariant Violation: ".
 */
export function invariant(condition: unknown, message?: string | (() => string) | undefined): asserts condition {
	if (condition) {
		return
	}

	if (IS_PRODUCTION) {
		throw new Error(INVARIANT_MESSAGE_PREFIX)
	}

	const errorMessage = (typeof message === 'function' ? message() : message)?.trim()
	throw new Error(errorMessage ? `${INVARIANT_MESSAGE_PREFIX}: ${errorMessage}` : INVARIANT_MESSAGE_PREFIX)
}

/**
 * Type narrowing helper that asserts its input value is not `null` and not `undefined`
 * and returns the value as `NonNullable<T>`.
 *
 * More convenient in many cases vs. `invariant()` because it returns the value and
 * can be used in expressions, variable assignments, etc. and is strictly for non-nullable checks.
 *
 * @throws {TypeError} if input is `null` or `undefined` when no error class is provided.
 */
export function ensureValue<T>(
	input: T | undefined | null,
	error?: string | Error | (new (...args: unknown[]) => Error),
): NonNullable<T> {
	if (input === null || input === undefined) {
		if (error) {
			if (typeof error === 'string') {
				throw new TypeError(error)
			}

			throw typeof error === 'function' ? new error('Expected value to be non-nullable') : error
		}

		throw new TypeError('Input value cannot be null or undefined')
	}

	return input
}
