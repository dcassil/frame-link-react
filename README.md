## Frame Link ( frame-link-react ) - (unstable version)

Frame Link is a lightweight library that makes two way async communication, between a parent site and iframe, easy.

## !! You have to install the package on both the parent and frame.

You can mix and match frame-link and frame-link-react ( one on iFrame and one on Parent )

## Vanilla version

Not using React? try out frame-link

## Getting started

### To install

yarn add frame-link

### or

npm i frame-link

## To use

### On Parent

```
import FrameLinkProvider from 'frame-link-react';

export default function App() {
    return (
        <FrameLinkProvider>
            <MyOtherComponent/>
        </FrameLinkProvider>
    )
}
```

## Then in MyOtherComponent

```
import {FrameLinkContext} from 'frame-link-react';

export default function MyOtherComponent() {
    const frameRef = useRef();
    const {ready, registerTarget, postMessage} = useContext(FrameLinkContext)

    useEffect(() => {
        frameLink.postMessage('my-event', {some: 'data'}, (respDataFromIframe) => {
            console.log('response from iFrame', respDataFromIframe)
        })
    }, [ready])

    useEffect(() => {
        if (!!frameRef) {
            registerTarget(frameRef)
        }

    }, [frameRef])

    return (
        <div >
            <iframe ref={frameRef} />
        </div>
    )
}
```

### On iFrame

```
import FrameLinkProvider from 'frame-link-react';

export default function App() {
    return (
        <FrameLinkProvider>
            <MyOtherComponent/>
        </FrameLinkProvider>
    )
}
```

```

import {FrameLinkContext} from 'frame-link-react';

export default function MyOtherComponent() {
    const frameRef = useRef();
    const {ready, registerTarget, postMessage} = useContext(FrameLinkContext)

    useEffect(() => {
        frameLink.addListener('my-event', (data, callback) => {
            // Here is the helpful bit.
            // it is optional.
            callback && callback({something: 'whatever data I want to send back to parent'})
        })
    }, [ready])

    useEffect(() => {
        if (!!frameRef) {
            registerTarget(frameRef)
        }

    }, [frameRef])

    return (
        <div >
            <iframe ref={frameRef} />
        </div>
    )
}
```

## Callbacks are not required, and you can setup one way listners and senders if that better suits your needs.

### iFrame

```
frameLink.addListener('my-event-from-parent', (data) => {
    console.log('do something with data', data);
})

frameLink.postMessage('my-event-from-child', {some: 'data'})
```

### Parent

```
frameLink.addListener('my-event-from-child', (data) => {
    console.log('do something with data', data);
})

frameLink.postMessage('my-event-from-[arent]', {some: 'data'})
```

## But.... why.

```

```
