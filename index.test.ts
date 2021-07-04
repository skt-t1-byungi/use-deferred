import { act, renderHook } from '@testing-library/react-hooks'

import { useDeferred } from '.'

function noop() {}

test('change defer state', () => {
    const { result } = renderHook(() => useDeferred())
    expect(result.current.isBefore).toBe(true)
    expect(result.current.isPending).toBe(false)
    expect(result.current.isComplete).toBe(false)
    expect(result.current.isResolved).toBe(false)
    expect(result.current.isRejected).toBe(false)

    act(() => {
        result.current.execute()
    })
    expect(result.current.isBefore).toBe(false)
    expect(result.current.isPending).toBe(true)
    expect(result.current.isComplete).toBe(false)
    expect(result.current.isResolved).toBe(false)
    expect(result.current.isRejected).toBe(false)

    act(() => result.current.resolve('resolve'))
    expect(result.current.isBefore).toBe(false)
    expect(result.current.isPending).toBe(false)
    expect(result.current.isComplete).toBe(true)
    expect(result.current.isResolved).toBe(true)
    expect(result.current.isRejected).toBe(false)

    act(() => {
        result.current.execute().catch(noop)
    })
    expect(result.current.isBefore).toBe(false)
    expect(result.current.isPending).toBe(true)
    expect(result.current.isComplete).toBe(false)
    expect(result.current.isResolved).toBe(false)
    expect(result.current.isRejected).toBe(false)

    act(() => result.current.reject())
    expect(result.current.isBefore).toBe(false)
    expect(result.current.isPending).toBe(false)
    expect(result.current.isComplete).toBe(true)
    expect(result.current.isResolved).toBe(false)
    expect(result.current.isRejected).toBe(true)
})

test('If forceExecute, the previous defer is canceled', async () => {
    const { result } = renderHook(() => useDeferred())
    let p: Promise<void>
    act(() => {
        p = result.current.execute()
    })
    expect(result.current.isPending).toBe(true)
    act(() => {
        result.current.forceExecute()
    })
    await expect(p!).rejects.toThrow('Canceled by forced execution.')
})

test('Handlers should be replaced immediately.', () => {
    let capture!: string

    const { result, rerender } = renderHook(
        ({ str, resolve }) => {
            const defer = useDeferred({
                onExecute() {
                    capture = str
                },
                onResolve() {
                    capture = str
                },
            })

            if (resolve) defer.resolve('resolved!')

            return defer
        },
        {
            initialProps: { str: 'hello', resolve: false },
        }
    )

    expect(capture).toBeFalsy()
    act(() => {
        result.current.execute()
    })
    expect(capture).toBe('hello')

    rerender({ str: 'world', resolve: true })
    expect(capture).toBe('world')
})
