import { Principal } from "@dfinity/principal";
import type { Identity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';

import { IDL } from "@dfinity/candid";

import {
  PocketIc,
  createIdentity,
  FromPathSubnetStateConfig,
  SubnetStateType
} from "@hadronous/pic";

import type {
  Actor,
  CanisterFixture,
  DeferredActor
} from "@hadronous/pic";

import {idlFactory as subscriberIDLFactory,
  init as subscriberInit } from "../../src/declarations/subscriber/subscriber.did.js";
import type {
  
  _SERVICE as SubscriberService,ICRC16} from "../../src/declarations/subscriber/subscriber.did.d";
export const subscriber_WASM_PATH = ".dfx/local/canisters/subscriber/subscriber.wasm.gz"; 

import {idlFactory as orchestratorIDLFactory,
  init as orchestratorInit } from "../../src/declarations/orchestratorMock/orchestratorMock.did.js";
import type {
  
  _SERVICE as OrchestratorService,} from "../../src/declarations/orchestratorMock/orchestratorMock.did.d";
import { get } from "http";
import { ICRC16Map, EventNotification } from "../../src/declarations/orchestrator/orchestrator.did.js";
export const orchestrator_WASM_PATH = ".dfx/local/canisters/orchestratorMock/orchestratorMock.wasm.gz"; 



const admin = createIdentity("admin");
const alice = createIdentity("alice");
const bob = createIdentity("bob");
const serviceProvider = createIdentity("serviceProvider");

const minterPublicKey = 'Uu8wv55BKmk9ZErr6OIt5XR1kpEGXcOSOC1OYzrAwuk=';
const minterPrivateKey =
  'N3HB8Hh2PrWqhWH2Qqgr1vbU9T3gb1zgdBD8ZOdlQnVS7zC/nkEqaT1kSuvo4i3ldHWSkQZdw5I4LU5jOsDC6Q==';

/* const base64ToUInt8Array = (base64String: string): Uint8Array => {
  return Buffer.from(base64String, 'base64');
}; */

/* const minterIdentity = Ed25519KeyIdentity.fromKeyPair(
  base64ToUInt8Array(minterPublicKey).buffer,
  base64ToUInt8Array(minterPrivateKey).buffer,
); */


let pic: PocketIc;
let subscriber_fixture: CanisterFixture<SubscriberService>;
let deferredSubscriberActor: DeferredActor<SubscriberService>;
let orchestrator_fixture: CanisterFixture<OrchestratorService>;

const getTimeNanos = async () => {
  return BigInt(Math.floor(((await pic.getTime()) * 1_000_000)));
};

describe("test subscriber", () => {


  async function setUpSubscriber(scenario: string) {
    console.log("setting up canisters");

    orchestrator_fixture = await pic.setupCanister<OrchestratorService>({
      sender: admin.getPrincipal(),
      idlFactory: orchestratorIDLFactory,
      wasm: orchestrator_WASM_PATH,
      arg: IDL.encode(orchestratorInit({IDL}), []),
    });

    console.log("set up orchestrator_fixture", orchestrator_fixture.canisterId);

    let result = await orchestrator_fixture.actor.setIdentity(admin);
    let result2 = await orchestrator_fixture.actor.set_scenario(scenario);

    subscriber_fixture = await pic.setupCanister<SubscriberService>({
      //targetCanisterId: Principal.fromText("q26le-iqaaa-aaaam-actsa-cai"),
      sender: admin.getPrincipal(),
      idlFactory: subscriberIDLFactory,
      wasm: subscriber_WASM_PATH,
      //targetSubnetId: subnets[0].id,
      arg: IDL.encode(subscriberInit({IDL}), [[{
        orchestrator: orchestrator_fixture.canisterId,
        icrc72SubscriberArgs: [],
        ttArgs: [],
      }]]),
    });

    console.log("set up subscriber_fixture", subscriber_fixture.canisterId);

    console.log("orch_fixture", subscriber_fixture);

    deferredSubscriberActor = await pic.createDeferredActor(subscriberIDLFactory, subscriber_fixture.canisterId)

    await subscriber_fixture.actor.setIdentity(admin);
  };
  

  beforeEach(async () => {

    pic = await PocketIc.create(process.env.PIC_URL, {
      /*  nns: {
        state: {
          type: SubnetStateType.FromPath,
          path: NNS_STATE_PATH,
          subnetId: Principal.fromText(NNS_SUBNET_ID),
        }
      }, 
      ii: {
        state: {
          type: SubnetStateType.New
        }
      } ,*/
      processingTimeoutMs: 1000 * 120 * 5,
    } );

    

  });


  afterEach(async () => {
   /*  if (childProcess) {
      // Terminate the spawned process
      childProcess.kill('SIGTERM');
    } */
    await pic.tearDown();
  });

  // =====================
  // Subscriber Component Tests
  // =====================

  /**
   * Test that the Subscriber initializes correctly with the expected default state.
   */
  async function testSubscriberInitialization() {
    await setUpSubscriber("default");
    const state = await subscriber_fixture.actor.get_stats();
    console.log("state",state);

    // Verify default properties
    expect(state).toBeDefined();
    expect(state.icrc72OrchestratorCanister).toEqual(orchestrator_fixture.canisterId);
    expect(state.broadcasters.length).toEqual(0);
    expect(state.subscriptions.length).toEqual(0);
    expect(state.validBroadcasters).toBeDefined(); 
    expect(state.confirmAccumulator.length).toEqual(0);
    expect(state.confirmTimer.length).toEqual(0);
    expect(state.lastEventId.length).toEqual(0);
    expect(state.backlogs.length).toEqual(0);
    expect(state.readyForSubscription).toEqual(false);
    expect(state.error.length).toBe(0); 
    expect(state.tt).toBeDefined();
    expect(state.tt.timers).toEqual(0n);
  }

  /**
   * Test that the Subscriber initializes after some time passes on the replica.
   */
  async function testSubscriberInitializesItself() {
    await setUpSubscriber("default");
    const statePre = await subscriber_fixture.actor.get_stats();
    console.log("state",statePre);

    await pic.tick(5);
    await pic.advanceTime(60_000);
    await pic.tick(5);

    const state = await subscriber_fixture.actor.get_stats();
    console.log("state", state);

    // Verify default properties
    expect(state).toBeDefined();
    expect(state.icrc72OrchestratorCanister).toEqual(orchestrator_fixture.canisterId);
    expect(state.broadcasters.length).toEqual(0);
    expect(state.subscriptions.length).toEqual(1);
    expect(state.subscriptions[0][0]).toEqual(777n);
    console.log("state.subscriptions[0][1]",state.subscriptions[0][1]);
    expect(state.subscriptions[0][1].namespace).toEqual("icrc72:subscriber:sys:" + subscriber_fixture.canisterId.toText());
    expect(state.validBroadcasters).toBeDefined(); 
    expect(state.confirmAccumulator.length).toEqual(0);
    expect(state.confirmTimer.length).toEqual(0);
    expect(state.lastEventId.length).toEqual(0);
    expect(state.backlogs.length).toEqual(0);
    expect(state.readyForSubscription).toEqual(true);
    expect(state.error.length).toBe(0); 
    expect(state.tt).toBeDefined();
    expect(state.tt.timers).toEqual(0n);
  }

  /**
   * Test that the Subscriber initializes after some time passes on the replica.
   */
  async function testSubscriberGetErrorIfOrchestratorThrowsError() {
    await setUpSubscriber("errorOnNotify");
    const statePre = await subscriber_fixture.actor.get_stats();
    console.log("state",statePre);

    await pic.tick(5);
    await pic.advanceTime(60_000);
    await pic.tick(5);

    const state = await subscriber_fixture.actor.get_stats();
    console.log("state", state);

    // Verify default properties

    expect(state.error.length).toBe(1); 
    expect(state.error[0]).toContain("No route to canister");
  }

  /**
   * Test that a synchronous event listener can be registered successfully.
   */
  async function testRegisterSynchronousListener() {

    await setUpSubscriber("default");

    await pic.tick(5);
    await pic.advanceTime(60_000);
    await pic.tick(5);
    const namespace = "syncListenerNamespace";

    // Register the synchronous listener
    let reg = await subscriber_fixture.actor.registerExecutionListenerSync([]);

    // Fetch the Subscriber's state to verify listener registration
    const state = await subscriber_fixture.actor.get_stats();

    console.log("state", state.subscriptions);

    // Assuming the state has a 'listeners' property with details
    const registeredListener = state.subscriptions.find((listener: any) => listener[1].namespace === namespace);

    expect(registeredListener).toBeDefined();

    // Simulate an event
    const testEvent = {
      namespace: namespace,
      data: {Map: []},
      headers: [] as [],
      source: orchestrator_fixture.canisterId,
      notificationId: 1n,
      eventId: 1n,
      prevEventId: [] as [] | [bigint], 
      filter: [] as [] | [string],
      timestamp: await getTimeNanos(),
    };

    await subscriber_fixture.actor.setIdentity(admin);

    // Emit the event to trigger the listener
    await subscriber_fixture.actor.simulate_notification([] ,[testEvent]);

    await pic.tick(5);

    let mockHandler = await subscriber_fixture.actor.registerExecutionListenerSyncCalled();



    // Verify that the mock handler was called with the test event
    expect(mockHandler).toEqual(1n);
  };

  /**
   * Test that an asynchronous event listener can be registered successfully.
   */
  async function testRegisterAsynchronousListener() {
    await setUpSubscriber("default");

    await pic.tick(5);
    await pic.advanceTime(60_000);
    await pic.tick(5);
    const namespace = "syncListenerNamespaceAsync";

    // Register the synchronous listener
    let reg = await subscriber_fixture.actor.registerExecutionListenerASync([]);

    // Fetch the Subscriber's state to verify listener registration
    const state = await subscriber_fixture.actor.get_stats();

    console.log("state", state.subscriptions);

    // Assuming the state has a 'listeners' property with details
    const registeredListener = state.subscriptions.find((listener: any) => listener[1].namespace === namespace);

    expect(registeredListener).toBeDefined();

    // Simulate an event
    const testEvent = {
      namespace: namespace,
      data: {Map: []},
      headers: [] as [],
      source: orchestrator_fixture.canisterId,
      notificationId: 1n,
      eventId: 1n,
      prevEventId: [] as [] | [bigint], 
      filter: [] as [] | [string],
      timestamp: await getTimeNanos(),
    };

    await subscriber_fixture.actor.setIdentity(admin);

    // Emit the event to trigger the listener
    await subscriber_fixture.actor.simulate_notification([] ,[testEvent]);

    await pic.tick(5);

    let mockHandler = await subscriber_fixture.actor.registerExecutionListenerASyncCalled();

    

    // Verify that the mock handler was called with the test event
    expect(mockHandler).toEqual(1n);
  }

  /**
   * Test that received notifications are confirmed properly.
   */
  async function testConfirmReceivedNotifications() {
    // Setup the Subscriber and Orchestrator canisters with the default scenario
    await setUpSubscriber("default");
    
    // Advance time to allow initial setup (if necessary)
    await pic.tick(5);
    await pic.advanceTime(60_000);
    await pic.tick(5);

    const namespace = "syncListenerNamespace";

    // Register a synchronous event listener for the specified namespace
    await subscriber_fixture.actor.registerExecutionListenerSync([]);

    // Simulate receiving a notification for the registered namespace
    const testEvent = {
      namespace: namespace,
      data: { Map: [] },
      headers: [
        [
          ["icrc72:broadcaster", {Blob: orchestrator_fixture.canisterId.toUint8Array()}] as [string, ICRC16]
        ] as ICRC16Map
      ],
      source: orchestrator_fixture.canisterId,
      notificationId: 1n,
      eventId: 1n,
      prevEventId: [] as [] | [bigint],
      filter: [] as [] | [string],
      timestamp: await getTimeNanos(),
    } as EventNotification;

    await subscriber_fixture.actor.simulate_notification([], [testEvent]);

    // Advance time to allow the Subscriber to process the notification
    await pic.tick(5);
    await pic.advanceTime(60_000);
    await pic.tick(5);

    //todo confirm sent confirm notification in icrc3 log 

    // Retrieve the Subscriber's state to verify confirmation
    const stats = await orchestrator_fixture.actor.getConfirmNotices();
    
    // Assertions to ensure the confirmation was recorded correctly
    expect(stats.length).toEqual(1);
    expect(stats[0][0]).toEqual(1n);
  }

  /**
   * Test updating an existing subscription's configuration.
   */
  async function testUpdateExistingSubscription() {
    // Setup the Subscriber and Orchestrator canisters with the default scenario
    await setUpSubscriber("testUpdateSub");
    
    // Advance time to allow initial setup (if necessary)
    await pic.tick(5);
    await pic.advanceTime(60_000);
    await pic.tick(5);

    const namespace = "syncListenerNamespace";

    // Register a synchronous event listener for the specified namespace
    await subscriber_fixture.actor.registerExecutionListenerSync([]);

    let statspre = await subscriber_fixture.actor.get_stats();

    console.log("statspre",statspre);


    // Advance time to allow the Subscriber to process the initial notification
    await pic.tick(5);
    await pic.advanceTime(60_000);
    await pic.tick(5);

    // Update the subscription by re-registering with a new handler or configuration
    await subscriber_fixture.actor.updateSubscription([
      {
        subscription : {namespace : namespace},
        subscriber : [],
        config : ["icrc72:subscription:stopped",{Text : "false"}],
        memo : []
      }
    ]);

    await pic.tick(5);
    await pic.advanceTime(60_000);
    await pic.tick(5);

    let updateSubCalledOnOrchestrator = await orchestrator_fixture.actor.getSubscriptionUpdates();

    expect(updateSubCalledOnOrchestrator.length).toEqual(1);
    expect(updateSubCalledOnOrchestrator[0][0]).toEqual(
      {
        subscription : {namespace : namespace},
        subscriber : [],
        config : ["icrc72:subscription:stopped", {Text :"false"}],
        memo : []
      }
    ); // Assuming subscriptionId=777 from the Orchestrator mock

    let stats = await subscriber_fixture.actor.get_stats();

    console.log("stats",stats.subscriptions );
    
    
  
    // Assertions to ensure the updated configuration is reflected
    expect(stats.subscriptions.length).toEqual(2);
    expect(stats.subscriptions[1][0]).toEqual(780n); // Assuming subscriptionId=777 from the Orchestrator mock
    expect(stats.subscriptions[1][1].namespace).toEqual(namespace);

    let config = stats.subscriptions[1][1].config;
    console.log("config",config);

    //i need to check that the config has a member of type [string, ICRC16] with "stopped" and #Text("false"); 
    expect(config).toContainEqual(["icrc72:subscription:stopped", { Text: "false" }]);
  }

  /**
   * Test removing a subscription and ensuring it no longer exists.
   */
  async function testRemoveSubscription() {
    // todo: code pending.
  }

  /**
   * Test that notifications from unauthorized broadcasters are rejected.
   */
  async function testRejectUnauthorizedBroadcasterNotifications() {
    await setUpSubscriber("default");

    await pic.tick(5);
    await pic.advanceTime(60_000);
    await pic.tick(5);
    const namespace = "syncListenerNamespace";

    // Register the synchronous listener
    let reg = await subscriber_fixture.actor.registerExecutionListenerSync([]);

    // Fetch the Subscriber's state to verify listener registration
    const state = await subscriber_fixture.actor.get_stats();

    console.log("state", state.subscriptions);

    // Assuming the state has a 'listeners' property with details
    const registeredListener = state.subscriptions.find((listener: any) => listener[1].namespace === namespace);

    expect(registeredListener).toBeDefined();

    // Simulate an event
    const testEvent = {
      namespace: namespace,
      data: {Map: []},
      headers: [] as [],
      source: orchestrator_fixture.canisterId,
      notificationId: 1n,
      eventId: 1n,
      prevEventId: [] as [] | [bigint], 
      filter: [] as [] | [string],
      timestamp: await getTimeNanos(),
    };

    await subscriber_fixture.actor.setIdentity(admin);

    // Emit the event to trigger the listener
    console.log("bob principal",bob.getPrincipal());
    await subscriber_fixture.actor.simulate_notification([bob.getPrincipal()] ,[testEvent]);

    await pic.tick(5);

    let mockHandler = await subscriber_fixture.actor.registerExecutionListenerSyncCalled();

    // Verify that the mock handler was called with the test event
    expect(mockHandler).toEqual(0n);
  }



  /**
   * Test handling of a maximum number of event notifications to ensure no overflow or crashes.
   */
  async function testHandleMultipleEventNotifications() {
    await setUpSubscriber("default");

    await pic.tick(5);
    await pic.advanceTime(60_000);
    await pic.tick(5);
    const namespace = "syncListenerNamespace";

    // Register the synchronous listener
    let reg = await subscriber_fixture.actor.registerExecutionListenerSync([]);

    // Fetch the Subscriber's state to verify listener registration
    const state = await subscriber_fixture.actor.get_stats();

    console.log("state", state.subscriptions);

    // Assuming the state has a 'listeners' property with details
    const registeredListener = state.subscriptions.find((listener: any) => listener[1].namespace === namespace);

    expect(registeredListener).toBeDefined();

    // Simulate an event
    const testEvent = {
      namespace: namespace,
      data: {Map: []},
      headers: [] as [],
      source: orchestrator_fixture.canisterId,
      notificationId: 1n,
      eventId: 1n,
      prevEventId: [] as [] | [bigint], 
      filter: [] as [] | [string],
      timestamp: await getTimeNanos(),
    };

    const testEvent2 = {
      namespace: namespace,
      data: {Map: []},
      headers: [] as [],
      source: orchestrator_fixture.canisterId,
      notificationId: 2n,
      eventId: 2n,
      prevEventId: [] as [] | [bigint], 
      filter: [] as [] | [string],
      timestamp: await getTimeNanos(),
    };

    const testEvent3 = {
      namespace: namespace,
      data: {Map: []},
      headers: [] as [],
      source: orchestrator_fixture.canisterId,
      notificationId: 3n,
      eventId: 3n,
      prevEventId: [] as [] | [bigint], 
      filter: [] as [] | [string],
      timestamp: await getTimeNanos(),
    };

    await subscriber_fixture.actor.setIdentity(admin);

    // Emit the event to trigger the listener
    await subscriber_fixture.actor.simulate_notification([] ,[testEvent, testEvent2, testEvent3]);

    await pic.tick(5);

    let mockHandler = await subscriber_fixture.actor.registerExecutionListenerSyncCalled();

    // Verify that the mock handler was called with the test event
    expect(mockHandler).toEqual(3n);
  }


  //error handling only works for async listeners
  async function testRegisterAsynchronousError() {
    await setUpSubscriber("default");

    await pic.tick(5);
    await pic.advanceTime(60_000);
    await pic.tick(5);
    const namespace = "syncListenerNamespaceAsync";

    // Register the synchronous listener
    let reg = await subscriber_fixture.actor.registerExecutionListenerASync([]);

    // Fetch the Subscriber's state to verify listener registration
    const state = await subscriber_fixture.actor.get_stats();

    console.log("state", state.subscriptions);

    // Assuming the state has a 'listeners' property with details
    const registeredListener = state.subscriptions.find((listener: any) => listener[1].namespace === namespace);

    expect(registeredListener).toBeDefined();

    // Simulate an event
    const testEvent = {
      namespace: namespace,
      data: {Map: []},
      headers: [
        [
          ["forceError", {Text: "true"} as ICRC16] as [string, ICRC16]
        ] as ICRC16Map
      ] as [] | [ICRC16Map],
      source: orchestrator_fixture.canisterId,
      notificationId: 1n,
      eventId: 1n,
      prevEventId: [] as [] | [bigint], 
      filter: [] as [] | [string],
      timestamp: await getTimeNanos(),
    };

    await subscriber_fixture.actor.setIdentity(admin);

    // Emit the event to trigger the listener
    await subscriber_fixture.actor.simulate_notification([] ,[testEvent]);

    await pic.tick(5);

    let mockHandler = await subscriber_fixture.actor.registerExecutionListenerASyncCalled();

    

    // Verify that the mock handler was called with the test event
    expect(mockHandler).toEqual(0n);

    let error = await subscriber_fixture.actor.getErrors();
    console.log("error",error);

    expect(error.length).toEqual(1);
    expect(error[0]).toContain("Forced Error");
  }

  //error handling only works for async listeners
  async function testOutOfOrderProcessing() {
    await setUpSubscriber("default");

    await pic.tick(5);
    await pic.advanceTime(60_000);
    await pic.tick(5);
    const namespace = "syncListenerNamespaceAsync";

    // Register the synchronous listener
    let reg = await subscriber_fixture.actor.registerExecutionListenerASync([]);

    // Fetch the Subscriber's state to verify listener registration
    const state = await subscriber_fixture.actor.get_stats();

    console.log("state", state.subscriptions);

    // Assuming the state has a 'listeners' property with details
    const registeredListener = state.subscriptions.find((listener: any) => listener[1].namespace === namespace);

    expect(registeredListener).toBeDefined();

    // Simulate an event
    const testEvent = {
      namespace: namespace,
      data: {Map: []},
      headers:  [
        [
          ["forceOutOfOrder", {Text: "true"} as ICRC16] as [string, ICRC16]
        ] as ICRC16Map
      ] as [] | [ICRC16Map],
      source: orchestrator_fixture.canisterId,
      notificationId: 1n,
      eventId: 1n,
      prevEventId: [] as [] | [bigint], 
      filter: [] as [] | [string],
      timestamp: await getTimeNanos(),
    };

    await subscriber_fixture.actor.setIdentity(admin);

    // Emit the event to trigger the listener
    await subscriber_fixture.actor.simulate_notification([] ,[testEvent]);

    await pic.tick(5);

    const stateAfter = await subscriber_fixture.actor.get_stats();

    console.log("stateAfter", stateAfter.subscriptions);
    console.log("stateAfter", stateAfter.backlogs);
    expect(stateAfter.subscriptions.length).toEqual(2);
    expect(stateAfter.backlogs.length).toEqual(1);
    console.log("stateAfter backlog", stateAfter.backlogs[0]);


    //get the subscription id
    const foundSubscription = stateAfter.subscriptions.find((listener: any) => listener[1].namespace === namespace);
    const subscriptionId = foundSubscription ? foundSubscription[0] : undefined;

    console.log("subscriptionId", subscriptionId);


    // Verify that state.backlogs has the event in it
    expect(stateAfter.backlogs.length).toEqual(1);
    expect(stateAfter.backlogs[0].length).toEqual(2);

    const subscriptionBacklog = stateAfter.backlogs.find((backlog: any) => backlog[0] === subscriptionId);

    console.log("subscriptionBacklog", subscriptionBacklog);

    expect(subscriptionBacklog).toBeDefined();
    if (subscriptionBacklog) {
      expect(subscriptionBacklog.length).toEqual(2);
    };
    if (subscriptionBacklog) {
      expect(subscriptionBacklog[0]).toEqual(778n);
    }
    if (subscriptionBacklog) {
      expect(subscriptionBacklog[1].length).toEqual(1);
    }

    if (subscriptionBacklog) {
      expect(subscriptionBacklog[1][0].length).toEqual(2);
    }

    if (subscriptionBacklog) {
      expect(subscriptionBacklog[1][0][0]).toEqual(1n);
    }

    

    const testEvent2 = {
      namespace: namespace,
      data: {Map: []},
      headers: [] as [] | [ICRC16Map],
      source: orchestrator_fixture.canisterId,
      id: 1n,
      eventId: 1n,
      prevEventId: [] as [] | [bigint], 
      filter: [] as [] | [string],
      timestamp: await getTimeNanos(),
    };

    await subscriber_fixture.actor.setIdentity(admin);

    // Emit the event to trigger the listener
    await subscriber_fixture.actor.simulate_notification([] ,[testEvent]);

    await pic.tick(5);

    const stateAfter2 = await subscriber_fixture.actor.get_stats();

    console.log("stateAfter2", stateAfter2.subscriptions);
    console.log("stateAfter2", stateAfter2.backlogs);
    expect(stateAfter.subscriptions.length).toEqual(2);

    


    // Verify that state.backlogs has the event in it
    expect(stateAfter2.backlogs.length).toEqual(0);
    
    //should have been called twice
    let mockHandler = await subscriber_fixture.actor.registerExecutionListenerASyncCalled();

    expect(mockHandler).toEqual(2n);
  }

  async function testNotificationEvent() {
    await setUpSubscriber("default");

    await pic.tick(5);
    await pic.advanceTime(60_000);
    await pic.tick(5);
    const namespace = "syncListenerNamespace";

    // Register the synchronous listener
    let reg = await subscriber_fixture.actor.registerExecutionListenerSync([]);

    // Fetch the Subscriber's state to verify listener registration
    const state = await subscriber_fixture.actor.get_stats();

    console.log("state", state.subscriptions);

    // Assuming the state has a 'listeners' property with details
    const registeredListener = state.subscriptions.find((listener: any) => listener[1].namespace === namespace);

    expect(registeredListener).toBeDefined();

    // Simulate an event
    const testEvent = {
      namespace: namespace,
      data: {Map: []},
      headers: [] as [],
      source: orchestrator_fixture.canisterId,
      notificationId: 1n,
      eventId: 1n,
      prevEventId: [] as [] | [bigint], 
      filter: [] as [] | [string],
      timestamp: await getTimeNanos(),
    };

    const testEvent2 = {
      namespace: namespace,
      data: {Map: []},
      headers: [] as [],
      source: orchestrator_fixture.canisterId,
      notificationId: 2n,
      eventId: 2n,
      prevEventId: [] as [] | [bigint], 
      filter: [] as [] | [string],
      timestamp: await getTimeNanos(),
    };

    const testEvent3 = {
      namespace: namespace,
      data: {Map: []},
      headers: [] as [],
      source: orchestrator_fixture.canisterId,
      notificationId: 3n,
      eventId: 3n,
      prevEventId: [] as [] | [bigint], 
      filter: [] as [] | [string],
      timestamp: await getTimeNanos(),
    };

    await subscriber_fixture.actor.setIdentity(admin);

    // Emit the event to trigger the listener
    await subscriber_fixture.actor.simulate_notification([] ,[testEvent, testEvent2, testEvent3]);

    await pic.tick(5);

    let mockHandler = await subscriber_fixture.actor.registerExecutionListenerSyncCalled();

    // Verify that the mock handler was called with the test event
    expect(mockHandler).toEqual(3n);

    let recordlist = await subscriber_fixture.actor.getRecords();

    console.log("recordlist",recordlist);

    expect(recordlist.length).toEqual(3);

    //todo: check the value and details of the records
  }

  async function ovsRuns() {
    await setUpSubscriber("default");

    await pic.tick(5);
    await pic.advanceTime(60_000);
    await pic.tick(5);
    const namespace = "syncListenerNamespace";

    // Register the synchronous listener
    let reg = await subscriber_fixture.actor.registerExecutionListenerSync([]);

    // Fetch the Subscriber's state to verify listener registration
    const state = await subscriber_fixture.actor.get_stats();

    console.log("state", state.icrc85);

    // Assuming the state has a 'listeners' property with details
    const registeredListener = state.subscriptions.find((listener: any) => listener[1].namespace === namespace);

    expect(registeredListener).toBeDefined();

    // Simulate an event
    const testEvent = {
      namespace: namespace,
      data: {Map: []},
      headers: [] as [],
      source: orchestrator_fixture.canisterId,
      notificationId: 1n,
      eventId: 1n,
      prevEventId: [] as [] | [bigint], 
      filter: [] as [] | [string],
      timestamp: await getTimeNanos(),
    };

    

    await subscriber_fixture.actor.setIdentity(admin);

    let result = await subscriber_fixture.actor.simulateSubscriptionCreation(true,"syncListenerNamespace", [
      []]);


    console.log("result",result);
    

    

    let mockHandler = await subscriber_fixture.actor.registerExecutionListenerSyncCalled();

    await pic.tick(5);
    await pic.advanceTime(60_000);

    // Emit the event to trigger the listener
    for(let i = 0; i < 10; i++) {
      await subscriber_fixture.actor.simulate_notification([] ,[testEvent]);
    };

    await pic.tick(5);
    await pic.advanceTime(60_000);

    

    let statsBeforeCycles = await subscriber_fixture.actor.get_stats();
    console.log("cycles", await pic.getCyclesBalance(subscriber_fixture.canisterId));

    console.log("statsPost",statsBeforeCycles);
    await pic.advanceTime(60_000 *60*24*45);
    await pic.tick(5);

    let statsPostCycles = await subscriber_fixture.actor.get_stats();
    console.log("cycles", await pic.getCyclesBalance(subscriber_fixture.canisterId));

    console.log("statsPostCycles",statsPostCycles);

    
  }

  // Register the test functions within Jest's 'it' blocks
  it(`can say hello`, async () => {
    await setUpSubscriber("default");
    let response = await subscriber_fixture.actor.hello();
    expect(response).toEqual("Hello, World!");
  });
  it("should initialize the Subscriber correctly", testSubscriberInitialization);


  it("should produce an error after some time if orchestrator throws an error", testSubscriberGetErrorIfOrchestratorThrowsError);

  it("should initialize after some time", testSubscriberInitializesItself);
  
  //also tests propagation and adding of transaction log
  it("should register a synchronous event listener", testRegisterSynchronousListener);
  it("should register an asynchronous event listener", testRegisterAsynchronousListener);

  it("should confirm received notifications", testConfirmReceivedNotifications);

  it("should update an existing subscription", testUpdateExistingSubscription);

  it("should reject notifications from unauthorized broadcasters", testRejectUnauthorizedBroadcasterNotifications);

  it("should handle multiple of event notifications", testHandleMultipleEventNotifications);



  it("should handle errors during event processing async", testRegisterAsynchronousError);

  it("should report out of order processing",
    testOutOfOrderProcessing);

  it("should emit notification event",
      testNotificationEvent);


  it"ovs runs",
    ovsRuns);


  


  
});