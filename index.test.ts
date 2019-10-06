import { serial as test } from 'ava'
import { renderHook, act } from '@testing-library/react-hooks'
import { useDeferred } from '.'

function noop () {}

test('change defer state', t => {
    const { result } = renderHook(() => useDeferred())
    t.true(result.current.isBefore)
    t.false(result.current.isPending)
    t.false(result.current.isComplete)
    t.false(result.current.isResolved)
    t.false(result.current.isRejected)

    act(() => { result.current.execute() })
    t.false(result.current.isBefore)
    t.true(result.current.isPending)
    t.false(result.current.isComplete)
    t.false(result.current.isResolved)
    t.false(result.current.isRejected)

    act(() => result.current.resolve('resolve'))
    t.false(result.current.isBefore)
    t.false(result.current.isPending)
    t.true(result.current.isComplete)
    t.true(result.current.isResolved)
    t.false(result.current.isRejected)

    act(() => { result.current.execute().catch(noop) })
    t.false(result.current.isBefore)
    t.true(result.current.isPending)
    t.false(result.current.isComplete)
    t.false(result.current.isResolved)
    t.false(result.current.isRejected)

    act(() => result.current.reject())
    t.false(result.current.isBefore)
    t.false(result.current.isPending)
    t.true(result.current.isComplete)
    t.false(result.current.isResolved)
    t.true(result.current.isRejected)
})

test('If forceExecute, the previous defer is canceled', async t => {
    const { result } = renderHook(() => useDeferred())

    const p = t.throwsAsync(() => act(() => result.current.execute()))
    t.true(result.current.isPending)

    act(() => { result.current.forceExecute() })
    await p
})

test.only('Handlers should be replaced immediately.', t => {
    let capture!: string

    const { result, rerender } = renderHook(({ str, resolve }) => {
        const defer = useDeferred({
            onExecute () { capture = str },
            onResolve () { capture = str }
        })

        if (resolve) defer.resolve('resolved!')

        return defer
    }, {
        initialProps: { str: 'hello', resolve: false }
    })

    t.falsy(capture)
    act(() => { result.current.execute() })
    t.is(capture, 'hello')

    rerender({ str: 'world', resolve: true })
    t.is(capture, 'world')
})
