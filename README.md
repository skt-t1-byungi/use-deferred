# use-deferred
React hook to handle the deferred promise.

[![npm](https://flat.badgen.net/npm/v/use-deferred)](https://www.npmjs.com/package/use-deferred)
[![license](https://flat.badgen.net/github/license/skt-t1-byungi/use-deferred)](https://github.com/skt-t1-byungi/use-deferred/blob/master/LICENSE)

## Install
```sh
npm i use-deferred
```

## Example
```jsx
import useDeferred from 'use-deferred'

function App(){
    const {execute, resolve, reject, isPending} = useDeferred()

    return (
        <>
            <Page openPopup={execute} />
            {isPending && (
                <Popup
                    onComplete={resolve}
                    onClose={() => reject({ isClosed: true })}
                />)}
        </>)
}
```
```js
function Page({ openPopup }){

    async function onBtnClick(){
        try {
            const popupResult = await openPopup()

            /* ... */
        } catch (err) {
            if (err.isClosed) return
        }

        /* ... */
    }

    /* ... */
}
```
```js
function Popup({ onComplete, onClose }){

    function handleComplete(){
        const popupResult = inputRef.current.value
        onComplete(popupResult)
    }

    function handleClose(){
        onClose()
    }

    /* ... */
}
```

## API
### useDeferred(handlers?) : defer
Returns an object to handle the deferred promise.

#### handlers
Handler called when deferred state changes.

- `onExecute(...args)`
- `onComplete()`
- `onResolve(value)`
- `onReject(reason?)`

##### Example
```js
const { execute } = useDeferred({
    onExecute(word1, word2){
        console.log((word1 + ' ' + word2).toUpperCase())
    }
})

execute('hello', 'world'); // => 'HELLO WORLD'
```

### State
Properties for the current state.

- `isBefore`
- `isPending`
- `isResolved`
- `isRejected`
- `isComplete`
- `state`

##### Example #1
```js
function App(){
    const { execute, isBefore, isPending } = useDeferred()

    console.log(`isBefore: ${isBefore}`)
    console.log(`isPending: ${isPending}`)

    execute()
    // => isBefore: true
    // => isPending: false
    // => isBefore: false
    // => isPending: true

    /* ... */
}
```

##### Example #2
```js
import { BEFORE, PENDING } from 'use-deferred/state'

function App(){
    const { execute, state } = useDeferred()

    if(state === BEFORE) console.log('current state: BEFORE')
    if(state === PENDING) console.log('current state: PENDING')

    execute()
    // => current state: BEFORE
    // => current state: PENDING

    /* ... */
}
```

### defer.execute(...args)
Execute a deferred promise. If there is an existing deferred promise that is not completed, return it.

### defer.forceExecute(...args)
Reject an existing deferred promise and execute a new deferred promise.

##### Example
```js
import { useDeferred, ForceCancelError } from 'use-deferred'

function App(){
    const { execute, forceExecute } = useDeferred()

    // First run.
    async function onExecClick(){
        try {
            await execute()
        } catch(err) {
            console.log('1. ' + err.isForceCanceled)
            console.log('2. ' + err instanceof ForceCancelError)
            console.log('3. ' + err.toString())
        }
    }

    // Second.
    async function onForceExecClick(){
        await forceExecute()
        // => 1. true
        // => 2. true
        // => 3. 'Canceled by forced execution.'
    }

    /* ... */
}
```

### defer.resolve(value)
Resolve the current pending promise.

### defer.reject(reason?)
Reject the current pending promise.

## License
MIT
