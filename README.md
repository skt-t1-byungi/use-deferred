# use-deferred
React hook to handle the deferred promise

> WIP

## Install
```sh
npm i use-deferred
```

## Example
```js
import useDeferred from 'ues-deferred'

function App(){
    const defer = useDeferred()

}
```

## API
### useDeferred(opts?, deps?)

#### opts
- `onExecute` -
- `onComplete` -
- `onResolve` -
- `onReject` -

### deps

### defer.isBefore
### defer.isPending
### defer.isResolved
### defer.isRejected
### defer.isComplete

### defer.execute()

### defer.forceExecute()

### defer.resolve(value)

### defer.reject(reason?)

## License
MIT
