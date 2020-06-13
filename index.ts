import { useMemo, useRef, useState } from 'react'

import { BEFORE, PENDING, REJECTED, RESOLVED, State } from './state'

export class ForceCancelError extends Error {
    name = 'ForceCancelError'
    isForceCanceled = true
}

interface Deferred<T> {
    resolve: (value?: T|PromiseLike<T>) => void
    reject: (reason?: any) => void,
    promise: Promise<T>
}

interface UseDeferredHandlers<Result, Args extends any[]>{
    onExecute?: (...args: Args) => void;
    onResolve?: (value: Result) => void;
    onReject?: (reason?: any) => void;
    onComplete?: () => void;
}

export default useDeferred

export function useDeferred <Result = any, Args extends any[] = []> (handlers: UseDeferredHandlers<Result, Args> = {}) {
    const [state, setState] = useState<State>(BEFORE)
    const deferRef = useRef<Deferred<Result>|null>(null)
    const handlersRef = useRef(handlers)

    handlersRef.current = handlers

    const methods = useMemo(() => ({
        execute (...args: Args) {
            return deferRef.current ? deferRef.current.promise : methods.forceExecute(...args)
        },

        forceExecute (...args: Args) {
            setState(PENDING)

            if (handlersRef.current.onExecute) handlersRef.current.onExecute(...args)
            if (deferRef.current) deferRef.current.reject(new ForceCancelError('Canceled by forced execution.'))

            const defer:Deferred<Result> = {} as any
            defer.promise = new Promise((resolve, reject) => {
                defer.resolve = resolve
                defer.reject = reject
            })

            return (deferRef.current = defer).promise
        },

        resolve (value: Result) {
            if (!deferRef.current) return

            setState(RESOLVED)

            if (handlersRef.current.onResolve) handlersRef.current.onResolve(value)
            if (handlersRef.current.onComplete) handlersRef.current.onComplete()

            deferRef.current.resolve(value)
            deferRef.current = null
        },

        reject (reason?: any) {
            if (!deferRef.current) return

            setState(REJECTED)

            if (handlersRef.current.onReject) handlersRef.current.onReject(reason)
            if (handlersRef.current.onComplete) handlersRef.current.onComplete()

            deferRef.current.reject(reason)
            deferRef.current = null
        }
    }), [])

    return {
        state,
        isBefore: state === BEFORE,
        isPending: state === PENDING,
        isResolved: state === RESOLVED,
        isRejected: state === REJECTED,
        isComplete: state === RESOLVED || state === REJECTED,
        ...methods
    }
}
