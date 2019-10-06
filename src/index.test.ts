import test from 'ava'
import { renderHook, act } from '@testing-library/react-hooks'
import { useDeferred } from '.'

test('change defer state', t => {
    const { result } = renderHook(() => useDeferred())
    t.true(result.current.isBefore)
    t.false(result.current.isPending)
    t.false(result.current.isComplete)
    t.false(result.current.isResolved)
    t.false(result.current.isRejected)

    act(() => result.current.execute())
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

    act(() => result.current.execute().catch(() => {}))
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
