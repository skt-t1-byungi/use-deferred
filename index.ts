import { useMemo, useRef, useState } from 'react'

import { BEFORE, PENDING, REJECTED, RESOLVED, State } from './state'

export class ForceCancelError extends Error {
    name = 'ForceCancelError'
    isForceCanceled = true
}

interface Defer<T> {
    resolve: (value: T | PromiseLike<T>) => void
    reject: (reason?: any) => void
    promise: Promise<T>
}

interface Handlers<Result, Args extends any[]> {
    onExecute?: (...args: Args) => void
    onResolve?: (value: Result) => void
    onReject?: (reason?: any) => void
    onComplete?: () => void
}

export default useDeferred

export function useDeferred<Result = void, Args extends any[] = []>(handlers: Handlers<Result, Args> = {}) {
    const [state, setState] = useState<State>(BEFORE)
    const deferRef = useRef<Defer<Result> | null>(null)
    const handlersRef = useRef(handlers)

    handlersRef.current = handlers

    const methods = useMemo(
        () => ({
            execute(...args: Args) {
                return deferRef.current ? deferRef.current.promise : methods.forceExecute(...args)
            },

            forceExecute(...args: Args) {
                setState(PENDING)

                handlersRef.current.onExecute?.(...args)
                deferRef.current?.reject(new ForceCancelError('Canceled by forced execution.'))

                const defer: Defer<Result> = {} as any
                defer.promise = new Promise((resolve, reject) => {
                    defer.resolve = resolve
                    defer.reject = reject
                })

                return (deferRef.current = defer).promise
            },

            resolve(value: Result) {
                if (!deferRef.current) return

                setState(RESOLVED)
                deferRef.current.resolve(value)
                deferRef.current = null

                const { onResolve, onComplete } = handlersRef.current
                if (onResolve || onComplete) {
                    Promise.resolve(value).then(value => {
                        onResolve?.(value)
                        onComplete?.()
                    })
                }
            },

            reject(reason?: any) {
                if (!deferRef.current) return

                setState(REJECTED)
                deferRef.current.reject(reason)
                deferRef.current = null

                handlersRef.current.onReject?.(reason)
                handlersRef.current.onComplete?.()
            },
        }),
        []
    )

    return {
        state,
        isBefore: state === BEFORE,
        isPending: state === PENDING,
        isResolved: state === RESOLVED,
        isRejected: state === REJECTED,
        isComplete: state === RESOLVED || state === REJECTED,
        ...methods,
    }
}
