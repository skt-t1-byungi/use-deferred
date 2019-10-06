import { useState, useRef, useMemo } from 'react'
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

interface UseDeferredOptions<Result, Args extends [] > {
    onExecute: (...args: Args) => void;
    onResolve: (value: Result) => void;
    onReject: (reason?: any) => void;
    onComplete: () => void;
}

export default useDeferred

export function useDeferred <Result = any, Args extends [] = []> (
    {
        onExecute = noop,
        onResolve = noop,
        onReject = noop,
        onComplete = noop
    }: Partial<UseDeferredOptions<Result, Args>> = {},
    deps: any[] = []
) {
    const [state, setState] = useState<STATE>(STATE_BEFORE)
    const deferRef = useRef<Deferred<Result>|null>(null)

    const methods = useMemo(() => ({
        execute (...args: Args) {
            if (deferRef.current) return deferRef.current.promise
            return methods.forceExecute(...args)
        },

        forceExecute (...args: Args) {
            setState(STATE_PENDING)
            onExecute(...args)

            if (deferRef.current) {
                deferRef.current.reject(new ForceCancelError('Canceled for a force execute.'))
            }

            return (deferRef.current = pDefer()).promise
        },

        resolve (value: Result) {
            setState(STATE_RESOLVED)
            onResolve(value)
            onComplete()

            if (deferRef.current) {
                deferRef.current.resolve(value)
                deferRef.current = null
            }
        },

        reject (reason?: any) {
            setState(STATE_REJECTED)
            onReject(reason)
            onComplete()

            if (deferRef.current) {
                deferRef.current.reject(reason)
                deferRef.current = null
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), deps)

    return {
        isBefore: state === STATE_BEFORE,
        isPending: state === STATE_PENDING,
        isResolved: state === STATE_RESOLVED,
        isRejected: state === STATE_REJECTED,
        isComplete: state === STATE_RESOLVED || state === STATE_REJECTED,
        ...methods
    }
}

function noop () { }
