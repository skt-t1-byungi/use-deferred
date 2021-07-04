import { act, renderHook } from '@testing-library/react-hooks'
import { useDeferred } from './index'

function noop() {}

test('change defer state', () => {
    const { result } = renderHook(() => useDeferred<string>())
    function assertTrueValue(...names: ('before' | 'pending' | 'complete' | 'resolved' | 'rejected')[]) {
        expect(result.current).toEqual(
            expect.objectContaining({
                isBefore: names.includes('before'),
                isPending: names.includes('pending'),
                isComplete: names.includes('complete'),
                isResolved: names.includes('resolved'),
                isRejected: names.includes('rejected'),
            })
        )
    }

    assertTrueValue('before')
    act(() => void result.current.execute())
    assertTrueValue('pending')
    act(() => result.current.resolve('resolve'))
    assertTrueValue('complete', 'resolved')
    act(() => void result.current.execute().catch(noop))
    assertTrueValue('pending')
    act(() => result.current.reject())
    assertTrueValue('complete', 'rejected')
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

test('Handlers should be replaced immediately.', async () => {
    let capture!: string
    const { result, rerender } = renderHook(
        str => {
            const defer = useDeferred({
                onExecute() {
                    capture = str
                },
                onResolve() {
                    capture = str
                },
            })
            return defer
        },
        { initialProps: 'hello' }
    )

    expect(capture).toBeFalsy()
    let p: Promise<void>
    act(() => {
        p = result.current.execute()
    })
    expect(capture).toBe('hello')
    rerender('world')
    act(() => result.current.resolve())
    await p!
    expect(capture).toBe('world')
})

test('handler parameters should resolved value.', async () => {
    const onResolve = jest.fn()
    const { result } = renderHook(() => useDeferred({ onResolve }))
    await act(async () => {
        result.current.execute()
        const p = Promise.resolve('test')
        result.current.resolve(p)
        await p
    })
    expect(onResolve).toHaveBeenCalledWith('test')
})
