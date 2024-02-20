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

### The Basics

#### Wrap your components in the provider

    <FrameLinkProvider>
        <MyComponent /> or {children}
    </FrameLinkProvider>

#### Register Target

    useEffect(() => {

        registerTarget(window.parent)
    }, [ready])

    useEffect(() => {

        registerTarget(iframeRef)
    }, [ready])

#### Sending

    const abcUpdater = usePostMessage('abc'); // Creates an updater for 'abc'

    abcUpdater('hello world') // Sends 'hello world' to the other frame.

#### Subscribing

    const abc = useSubscribe('abc'); // Subscribe to key 'abc' and update any time something is messaged to this key

### More Detailed examples

See [Examples](https://github.com/dcassil/frame-link-react/tree/main/examples)

### On Parent

#### Wrap everything with the provider. This is often done in app.tsx / app.js

    import { useContext, useEffect, useRef } from "react"; 
    import FrameLinkProvider, { FrameLinkContext } from "../src/FrameLinkProvider"; 

    export default function App() {
        return (

            <FrameLinkProvider>
                <MyComponent />
                <MyButtonComponent />
                <MyNotificationComponent />
            </FrameLinkProvider>

        ); 
    }

#### Register the target ( in this case it will be the iframe )

    import { useContext, useEffect, useRef } from "react";
    import { FrameLinkContext } from "../src/FrameLinkProvider";

    function MyComponent() {
        const { registerTarget, ready, connected } = useContext(FrameLinkContext);

        const frameRef = useRef<any>();

        useEffect(() => {

            if (!!frameRef.current) {
            registerTarget && registerTarget(frameRef.current);
            }
        }, [ready, frameRef]);

        useEffect(() => {

            console.log("connected", connected);
        }, [connected]);

        return (
            <div>
            <iframe ref={frameRef} src="www.something.com" />{" "}
            </div>
        );
    }

#### Create an updater for a given key

    import { useContext } from "react";
    import { FrameLinkContext } from "../src/FrameLinkProvider";

    function MyButtonComponent() {
    const { usePostMessage } = useContext(FrameLinkContext);

    const updateTest = usePostMessage("test");

    return (
        <button
            onClick={() =>
                updateTest({ myPayload: "this is a test" }, () => {
                // Optional callback... well it is supposed to be. I need to fix the type
                })
            }
        >
            send test
        </button>
    );
    }

#### Subscribe to a key from the parent

    import { useContext } from "react";
    import { FrameLinkContext } from "../src/FrameLinkProvider";

    function MyNotificationComponent() {
        const { useSubscribe } = useContext(FrameLinkContext);

        const testTwo = useSubscribe < { myPayload: string } > "test-two";

        // This will update whenever "test-two" gets new data.

        return <div>{testTwo?.myPayload}</div>;
    }

### On iFrame

#### Wrap componets in the FrameLinkProvider

    import { useContext, useEffect, useRef } from "react";
    import FrameLinkProvider, { FrameLinkContext } from "../src/FrameLinkProvider";

    export default function App() {
        return (

            <FrameLinkProvider>
                <MyComponent />
                <MyButtonComponent />
                <MyNotificationComponent />
            </FrameLinkProvider>

        ); 
    }

#### Register the target ( in this case it will be window.parent )

    import { useContext, useEffect } from "react";
    import { FrameLinkContext } from "../src/FrameLinkProvider";

    function MyComponent() {
    const { registerTarget, ready, connected } = useContext(FrameLinkContext);

    useEffect(() => {

        if (ready && registerTarget) {
        // Register the target ( in this case the parent )

        registerTarget(window.parent);
        }
    }, [ready]);

    useEffect(() => {

        // Wait for them to connect ( sends a ping and gets a reply ping )

        console.log("connected", connected);
    }, [connected]);

    return <div></div>;
    }

#### Create an updater for a given key

    import { useContext } from "react";
    import { FrameLinkContext } from "../src/FrameLinkProvider";

    function MyButtonComponent() {
    const { usePostMessage } = useContext(FrameLinkContext);

    const updateTestTwo = usePostMessage("test-two");

    return (
        <button
            onClick={() =>
                // Call the updater with the data to send to the other frame.

                updateTestTwo({ myPayload: "this is a test-two test" }, (replyData) => {
                // Optional callback... See subscribe
                // If a reply callback is included, when this is received on the parent, we will send a response back
                // If the parent includes a reply callback when subscribing, replyData will be whatever that callback returns.
                })
            }
        >
            send test
        </button>
    );
    }

    const optionalReplyFunction = (latestData) => {
        return { anything: "you want" }; //
    };

#### Subscribe to messages from the parent

    import { useContext } from "react";
    import { FrameLinkContext } from "../src/FrameLinkProvider";

    function MyNotificationComponent() {
        const { useSubscribe } = useContext(FrameLinkContext);

        const test =
            useSubscribe < { myPayload: string } > ("test", optionalReplyFunction);

        // This will update whenever "test-two" gets new data.

        return <div>{test?.myPayload}</div>;
    }
