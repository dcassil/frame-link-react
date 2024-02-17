
## Frame Link ( frame-link-react )

  

Frame Link is a lightweight library that makes two way async communication, between a parent site and iframe, easy.

  

## To use frame-link / frame-link-react
You need to have access to both the parent frame codebase and the target iframe.
Some version of frame-link must be installed in both.
  
## You can mix and match
frame-link: is the vanilla version "yarn add frame-link" see
frame-link-react ( this one ): uses React's context api along with react recoil to perform selective re-renders

## Getting started

### To install

yarn: yarn add frame-link-react
npm: npm i frame-link-react
## To use
### On Parent
Wrap everything with the provider.  This is often done in app.tsx / app.js
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
### Then in MyOtherComponent
#### Use the FrameLinkContext to register the target frame.
```
import {FrameLinkContext} from 'frame-link-react';

export default function MyOtherComponent() {
	const frameRef = useRef();
	const {ready, connected, registerTarget, postMessage} = useContext(FrameLinkContext)

	useEffect(() => {
		if (connected) {
			frameLink.postMessage('my-event', {some: 'data'}, (respDataFromIframe) => {
                // this callback is optional and is used for two way async com between frames.
                console.log('response from iFrame', respDataFromIframe)
		    })
		}
	}, [connected])

	useEffect(() => {
		if (!!frameRef && ready) {
			registerTarget(frameRef)
		}
	}, [frameRef, ready])

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
	const {useSubscribe, useAddListener, ready, connected} = useContext(FrameLinkContext)
	// This needs to be done once
	useAddListener('one'); 
	// Afterwards you can subscribe to the key in any component with
	// TODO: I will probably change this so that subscribe calls addListener if it has not been done.  No need for the extra step.
	const myListenerOne = useSubscribe('one');

	useEffect(() => {
		console.log('a connection with the parent/iframe has been made')
	}, [connected])
  
	useEffect(() => {
		registerTarget(window.parent)
	}, [ready])

	useEffect(() => {
		// any time myListenerOne is updated by the parent/iframe this component will re-render and this hook will run.
		console.log('myListenerOne updated', myListenerOne)
	}, [myListenerOne])
  
	return (
		<div >
			{myListenerOne.message}
		</div>
	)
}
```