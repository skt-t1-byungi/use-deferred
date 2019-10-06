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
import useDeferred from 'ues-deferred'

function App(){
    const {execute, resolve, reject, isPending} = useDeferred()

    return (
        <div>
            <A execute={execute} />
            {isPending && <B resolve={resolve} reject={reject} />}
        </div>)
}
```
```js
function A({execute}){

    async function onClick(){
        try {
            const result = await execute()
        } catch (err) {
            if (err.isClosed) return
        }
        /****/
    }

    /****/
}
```
```js
function B({resolve, reject}){

    function onEnter(){
        resolve(inputRef.current.value)
    }

    function onClose(){
        reject({ isClosed: true })
    }
    /****/
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

##### Example
```js
const { execute, isBefore, isPending } = useDeferred()

console.log(`isBefore: ${isBefore}`)
console.log(`isPending: ${isPending}`)

execute()
// => isBefore: true
// => isPending: false
// => isBefore: false
// => isPending: true
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
            console.log(err.isForceCanceled)
            console.log(err instanceof ForceCancelError)
            console.log(err.toString())
        }
    }

    // Second.
    async function onForceExecClick(){
        await forceExecute()
        // => true
        // => true
        // => 'Cancel for forced new execution.'
    }

    /****/
}
```

### defer.resolve(value)
Resolve the current pending promise.

### defer.reject(reason?)
Reject the current pending promise.

## License
MIT
