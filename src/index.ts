import { useState, useRef, useMemo, useLayoutEffect } from 'react'
import pDefer, { Deferred } from '@byungi/p-defer'

const STATE_BEFORE = 0 as const
const STATE_PENDING = 1 as const
const STATE_RESOLVED = 2 as const
const STATE_REJECTED = 3 as const
type STATE = 0|1|2|3

export class ForceCancelError extends Error {
    name = 'ForceCancelError'
    isForceCanceled = true
}

interface UseDeferredHandlers<Result, Args extends [] > {
    onExecute?: (...args: Args) => void;
    onResolve?: (value: Result) => void;
    onReject?: (reason?: any) => void;
    onComplete?: () => void;
}

export default useDeferred

export function useDeferred <Result = any, Args extends [] = []> (
    handlers: UseDeferredHandlers<Result, Args> = {}
) {
    const [state, setState] = useState<STATE>(STATE_BEFORE)
    const deferRef = useRef<Deferred<Result>|null>(null)
    const handlersRef = useRef(handlers)

    useLayoutEffect(() => { handlersRef.current = handlers })

    const methods = useMemo(() => ({
        execute (...args: Args) {
            return deferRef.current ? deferRef.current.promise : methods.forceExecute(...args)
        },

        forceExecute (...args: Args) {
            setState(STATE_PENDING)

            if (handlersRef.current.onExecute) handlersRef.current.onExecute(...args)
            if (deferRef.current) deferRef.current.reject(new ForceCancelError('Cancel for forced new execution.'))

            return (deferRef.current = pDefer()).promise
        },

        resolve (value: Result) {
            if (!deferRef.current) return

            setState(STATE_RESOLVED)

            if (handlersRef.current.onResolve) handlersRef.current.onResolve(value)
            if (handlersRef.current.onComplete) handlersRef.current.onComplete()

            deferRef.current.resolve(value)
            deferRef.current = null
        },

        reject (reason?: any) {
            if (!deferRef.current) return

            setState(STATE_REJECTED)

            if (handlersRef.current.onReject) handlersRef.current.onReject(reason)
            if (handlersRef.current.onComplete) handlersRef.current.onComplete()

            deferRef.current.reject(reason)
            deferRef.current = null
        }
    }), [])

    return {
        isBefore: state === STATE_BEFORE,
        isPending: state === STATE_PENDING,
        isResolved: state === STATE_RESOLVED,
        isRejected: state === STATE_REJECTED,
        isComplete: state === STATE_RESOLVED || state === STATE_REJECTED,
        ...methods
    }
}
