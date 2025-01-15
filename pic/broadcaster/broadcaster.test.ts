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

import {idlFactory as broadcasterIDLFactory,
  init as broadcasterInit } from "../../src/declarations/broadcaster/broadcaster.did.js";
import type {
  
  _SERVICE as BroadcasterService,ICRC16} from "../../src/declarations/broadcaster/broadcaster.did.d";
export const broadcaster_WASM_PATH = ".dfx/local/canisters/broadcaster/broadcaster.wasm.gz"; 

import {idlFactory as orchestratorIDLFactory,
  init as orchestratorInit } from "../../src/declarations/orchestratorMock/orchestratorMock.did.js";
import type {
  
  _SERVICE as OrchestratorService,} from "../../src/declarations/orchestratorMock/orchestratorMock.did.d";
import { get } from "http";
import { ICRC16Map, EventNotification, PublicationRegistration } from "../../src/declarations/orchestrator/orchestrator.did.js";
import * as exp from "constants";
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
let broadcaster_fixture: CanisterFixture<BroadcasterService>;
let deferredBroadcasterActor: DeferredActor<BroadcasterService>;
let orchestrator_fixture: CanisterFixture<OrchestratorService>;

const getTimeNanos = async () => {
  return BigInt(Math.floor(((await pic.getTime()) * 1_000_000)));
};

describe("test broadcaster", () => {


  async function setUpBroadcaster(scenario: string) {
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

    broadcaster_fixture = await pic.setupCanister<BroadcasterService>({
      //targetCanisterId: Principal.fromText("q26le-iqaaa-aaaam-actsa-cai"),
      sender: admin.getPrincipal(),
      idlFactory: broadcasterIDLFactory,
      wasm: broadcaster_WASM_PATH,
      //targetSubnetId: subnets[0].id,
      arg: IDL.encode(broadcasterInit({IDL}), [[{
        orchestrator: orchestrator_fixture.canisterId,
        icrc72BroadcasterArgs: [],
        icrc72SubscriberArgs: [],
        icrc72PublisherArgs: [],
        ttArgs: [],
      }]]),
    });

    console.log("set up broadcaster_fixture", broadcaster_fixture.canisterId);

    console.log("orch_fixture", broadcaster_fixture);

    deferredBroadcasterActor = await pic.createDeferredActor(broadcasterIDLFactory, broadcaster_fixture.canisterId)

    await broadcaster_fixture.actor.setIdentity(admin);
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


  /**
   * Test that the Broadcaster initializes correctly with the expected default state.
   */
  async function testBroadcasterInitialization() {
    //setUpBroadcaster("defaultBroadcaster");
    await setUpBroadcaster("defaultBroadcaster");
    const state = await broadcaster_fixture.actor.get_stats();
    console.log("Broadcaster Initialize State", state);

    // Verify default properties
    expect(state).toBeDefined();
    expect(state.icrc72OrchestratorCanister).toEqual(orchestrator_fixture.canisterId);
    expect(state.roundDelay.length).toEqual(0);
    expect(state.maxMessages.length).toEqual(0);
    expect(state.publications.length).toEqual(0);
    expect(state.subscriptions.length).toEqual(0);
    expect(state.eventStore.length).toEqual(0);
    expect(state.notificationStore.length).toEqual(0);
    expect(state.messageAccumulator.length).toEqual(0);
    expect(state.relayAccumulator.length).toEqual(0);
    expect(state.relayTimer.length).toEqual(0);
    expect(state.messageTimer.length).toEqual(0);
    expect(state.error.length).toBe(0);
    expect(state.nextNotificationId).toEqual(0n);
    expect(state.tt).toBeDefined();
    expect(state.tt.timers).toEqual(0n);
    expect(state.icrc72Subscriber).toBeDefined();

    expect(state.icrc72Subscriber.icrc72OrchestratorCanister).toEqual(orchestrator_fixture.canisterId);
    expect(state.icrc72Subscriber.broadcasters.length).toEqual(0);
    expect(state.icrc72Subscriber.subscriptions.length).toEqual(0);

    expect(state.icrc72Subscriber.validBroadcasters).toBeDefined();
    expect(state.icrc72Subscriber.confirmAccumulator.length).toEqual(0);
    expect(state.icrc72Subscriber.confirmTimer.length).toEqual(0);
    expect(state.icrc72Subscriber.lastEventId.length).toEqual(0);
    expect(state.icrc72Subscriber.backlogs.length).toEqual(0);
    expect(state.icrc72Subscriber.readyForSubscription).toEqual(false);
    expect(state.icrc72Subscriber.error.length).toBe(0);
    expect(state.icrc72Subscriber.tt).toBeDefined();
    expect(state.icrc72Subscriber.tt.timers).toEqual(0n);

    expect(state.icrc72Publisher.orchestrator).toEqual(orchestrator_fixture.canisterId);
    expect(state.icrc72Publisher.broadcasters.length).toEqual(0);
    expect(state.icrc72Publisher.publications.length).toEqual(0);
    expect(state.icrc72Publisher.eventsProcessing).toEqual(false); 
    expect(state.icrc72Publisher.pendingEvents.length).toEqual(0);
    expect(state.icrc72Publisher.previousEventIds.length).toEqual(0);
    expect(state.icrc72Publisher.drainEventId.length).toEqual(0);
    expect(state.icrc72Publisher.readyForPublications).toEqual(false);
    expect(state.error.length).toBe(0); 
    expect(state.tt).toBeDefined();
    expect(state.tt.timers).toEqual(0n);
  
  };

  

  it("test broadcaster initialization", testBroadcasterInitialization);

  async function testBroadcasterInitializatizesItself() {
    //setUpBroadcaster("defaultBroadcaster");
    await setUpBroadcaster("defaultBroadcaster");
    const statePre = await broadcaster_fixture.actor.get_stats();
    console.log("Broadcaster Initialize State", statePre);

    await pic.tick(5);
    await pic.advanceTime(60_000);
    await pic.tick(5);

    const state = await broadcaster_fixture.actor.get_stats();
    console.log("state", state);
    console.log("stateafter", state);

    // Verify default properties
    expect(state).toBeDefined();
    expect(state.icrc72OrchestratorCanister).toEqual(orchestrator_fixture.canisterId);
    expect(state.roundDelay.length).toEqual(0);
    expect(state.maxMessages.length).toEqual(0);
    expect(state.publications.length).toEqual(0);
    expect(state.subscriptions.length).toEqual(0);
    expect(state.eventStore.length).toEqual(0);
    expect(state.notificationStore.length).toEqual(0);
    expect(state.messageAccumulator.length).toEqual(0);
    expect(state.relayAccumulator.length).toEqual(0);
    expect(state.relayTimer.length).toEqual(0);
    expect(state.messageTimer.length).toEqual(0);
    expect(state.error.length).toBe(0);
    expect(state.nextNotificationId).toEqual(0n);
    expect(state.tt).toBeDefined();
    expect(state.tt.timers).toEqual(0n);
    expect(state.icrc72Subscriber).toBeDefined();

    expect(state.icrc72Subscriber.icrc72OrchestratorCanister).toEqual(orchestrator_fixture.canisterId);
    expect(state.icrc72Subscriber.broadcasters.length).toEqual(0);
    console.log("subscriptions", state.icrc72Subscriber.subscriptions);
    expect(state.icrc72Subscriber.subscriptions.length).toEqual(3);

    expect(state.icrc72Subscriber.validBroadcasters).toBeDefined();
    expect(state.icrc72Subscriber.confirmAccumulator.length).toEqual(0);
    expect(state.icrc72Subscriber.confirmTimer.length).toEqual(0);
    expect(state.icrc72Subscriber.lastEventId.length).toEqual(0);
    expect(state.icrc72Subscriber.backlogs.length).toEqual(0);
    expect(state.icrc72Subscriber.readyForSubscription).toEqual(true);
    expect(state.icrc72Subscriber.error.length).toBe(0);
    expect(state.icrc72Subscriber.tt).toBeDefined();
    expect(state.icrc72Subscriber.tt.timers).toEqual(0n);

    expect(state.icrc72Publisher.orchestrator).toEqual(orchestrator_fixture.canisterId);
    expect(state.icrc72Publisher.broadcasters.length).toEqual(0);
    expect(state.icrc72Publisher.publications.length).toEqual(0);
    expect(state.icrc72Publisher.eventsProcessing).toEqual(false); 
    expect(state.icrc72Publisher.pendingEvents.length).toEqual(0);
    expect(state.icrc72Publisher.previousEventIds.length).toEqual(0);
    expect(state.icrc72Publisher.drainEventId.length).toEqual(0);
    expect(state.icrc72Publisher.readyForPublications).toEqual(false);
    expect(state.error.length).toBe(0); 
    expect(state.tt).toBeDefined();
    expect(state.tt.timers).toEqual(0n);
  
  };

  it("test broadcaster initializatizes itself", testBroadcasterInitializatizesItself);

  function dataItemStringify(key: string, value: any) {
    if (typeof value === 'bigint') {
      return value.toString();
    } else if (key === 'Blob' && value instanceof Uint8Array) {
      return Array.from(value).map(byte => byte.toString(16).padStart(2, '0')).join('');
    } else if (key === 'Principal' && value instanceof Object) {
      return value.__principal__;
    } else {
      return value;
    }
  };

  

  it("test broadcaster register and deregisteres publication success", testBroadcasterRegisterPublicationSuccess);

  
  /**
   * Test registering and removing a new subscribers from Broadcaster.
   */
  async function testBroadcasterRegisterPublicationSuccess() {
    //setUpBroadcaster("defaultBroadcaster");
    await setUpBroadcaster("testNotifyBroadcasterOfPublisher");
    const statePre = await broadcaster_fixture.actor.get_stats();
    console.log("Broadcaster Initialize State", statePre);

    await pic.tick(5);
    await pic.advanceTime(60_000);
    await pic.tick(5);

    //simulate the orchestrator registering a publication
    let result = await broadcaster_fixture.actor.simulatePublisherAssignment("anamespace", 1n, orchestrator_fixture.canisterId);

    console.log("result", result);

    await pic.tick(5);
    await pic.advanceTime(60_000);

    let state = await broadcaster_fixture.actor.get_stats();
   console.log("state", state);
   console.log("stateafter", state);

   // Verify default properties
   expect(state).toBeDefined();
   
   expect(state.publications.length).toEqual(1);
   expect(state.publications[0][1].namespace).toEqual("anamespace");
   expect(state.publications[0][1].registeredPublishers[0]).toEqual(orchestrator_fixture.canisterId);
   expect(state.icrc72Subscriber).toBeDefined();
   expect(state.icrc72Subscriber.icrc72OrchestratorCanister).toEqual(orchestrator_fixture.canisterId);
   expect(state.icrc72Subscriber.broadcasters.length).toEqual(0);
   console.log("subscriptions", state.icrc72Subscriber.subscriptions);
   expect(state.icrc72Subscriber.subscriptions.length).toEqual(3);

   expect(state.icrc72Subscriber.validBroadcasters).toBeDefined();
   expect(state.icrc72Subscriber.confirmAccumulator.length).toEqual(0);
   expect(state.icrc72Subscriber.confirmTimer.length).toEqual(0);
   console.log("lastEventId", JSON.stringify(state.icrc72Subscriber.lastEventId, dataItemStringify, 2));
   expect(state.icrc72Subscriber.lastEventId.length).toEqual(1);
   expect(state.icrc72Subscriber.lastEventId[0][0]).toEqual("icrc72:broadcaster:sys:lqy7q-dh777-77777-aaaaq-cai");
   expect(state.icrc72Subscriber.lastEventId[0][1]).toEqual([[779n, 1n]]);

   let result2 = await broadcaster_fixture.actor.simulatePublisherAssignment("anamespace2", 2n,orchestrator_fixture.canisterId);
   let result3 = await broadcaster_fixture.actor.simulatePublisherAssignment("anamespace3", 3n,  orchestrator_fixture.canisterId);
   let result4 = await broadcaster_fixture.actor.simulatePublisherAssignment("anamespace4", 4n,  orchestrator_fixture.canisterId);
   let result5 = await broadcaster_fixture.actor.simulatePublisherAssignment("anamespace2", 5n, bob.getPrincipal());

   await pic.tick(5);
   await pic.advanceTime(60_000);

   state = await broadcaster_fixture.actor.get_stats();
   console.log("state", state);
   console.log("stateafter", state);

   // Verify default properties
   expect(state).toBeDefined();
   
   expect(state.publications.length).toEqual(4);
   expect(state.publications[0][1].namespace).toEqual("anamespace");
   expect(state.publications[0][1].registeredPublishers[0]).toEqual(orchestrator_fixture.canisterId);
   expect(state.publications[1][1].namespace).toEqual("anamespace2");
   expect(state.publications[1][1].registeredPublishers[0]).toEqual(orchestrator_fixture.canisterId);
   expect(state.icrc72Subscriber).toBeDefined();
   expect(state.icrc72Subscriber.icrc72OrchestratorCanister).toEqual(orchestrator_fixture.canisterId);

   let result6 = await broadcaster_fixture.actor.simulatePublisherRemoval("anamespace", 6n, orchestrator_fixture.canisterId);

   await pic.tick(5);
   await pic.advanceTime(60_000);

   state = await broadcaster_fixture.actor.get_stats();
   console.log("state", state);
   console.log("stateafter", state);

   expect(state).toBeDefined();
   console.log("publications", JSON.stringify(state.publications, dataItemStringify, 2));
   expect(state.publications.length).toEqual(3);
   expect(state.publications[0][1].namespace).toEqual("anamespace2");
   expect(state.publications[0][1].registeredPublishers[0]).toEqual(orchestrator_fixture.canisterId);
   expect(state.publications[1][1].namespace).toEqual("anamespace3");
   expect(state.publications[1][1].registeredPublishers[0]).toEqual(orchestrator_fixture.canisterId);
   expect(state.icrc72Subscriber).toBeDefined();
   expect(state.icrc72Subscriber.icrc72OrchestratorCanister).toEqual(orchestrator_fixture.canisterId);

 }

 it("test broadcaster register and deregisteres subscription success", testBroadcasterRegisterSubscriptionSuccess);

 /**
   * Test registering and removing a new publisher from Broadcaster.
   */
 async function testBroadcasterRegisterSubscriptionSuccess() {
  //setUpBroadcaster("defaultBroadcaster");
  await setUpBroadcaster("testNotifyBroadcasterOfPublisher");
  const statePre = await broadcaster_fixture.actor.get_stats();
  console.log("Broadcaster Initialize State", statePre);
  let mockSub1 = await pic.setupCanister<OrchestratorService>({
    sender: admin.getPrincipal(),
    idlFactory: orchestratorIDLFactory,
    wasm: orchestrator_WASM_PATH,
    arg: IDL.encode(orchestratorInit({IDL}), []),
  });
  let mockSub2 = await pic.setupCanister<OrchestratorService>({
    sender: admin.getPrincipal(),
    idlFactory: orchestratorIDLFactory,
    wasm: orchestrator_WASM_PATH,
    arg: IDL.encode(orchestratorInit({IDL}), []),
  });
  let mockSub3 = await pic.setupCanister<OrchestratorService>({
    sender: admin.getPrincipal(),
    idlFactory: orchestratorIDLFactory,
    wasm: orchestrator_WASM_PATH,
    arg: IDL.encode(orchestratorInit({IDL}), []),
  });
  let mockSub4 = await pic.setupCanister<OrchestratorService>({
    sender: admin.getPrincipal(),
    idlFactory: orchestratorIDLFactory,
    wasm: orchestrator_WASM_PATH,
    arg: IDL.encode(orchestratorInit({IDL}), []),
  });

  await pic.tick(5);
  await pic.advanceTime(60_000);
  await pic.tick(5);

  //simulate the orchestrator registering a publication
  let result = await broadcaster_fixture.actor.simulatePublisherAssignment("anamespace", 1n, orchestrator_fixture.canisterId);

  console.log("result", result);

  await pic.tick(5);
  await pic.advanceTime(60_000);

  let resultSub = await broadcaster_fixture.actor.simulateSubscriberAssignment("anamespace", 1n, broadcaster_fixture.canisterId);

  let state = await broadcaster_fixture.actor.get_stats();
  console.log("state", state);
  console.log("stateafter", state);

  // Verify default properties
  expect(state).toBeDefined();
  
  expect(state.publications.length).toEqual(1);
  expect(state.publications[0][1].namespace).toEqual("anamespace");
  expect(state.publications[0][1].registeredPublishers[0]).toEqual(orchestrator_fixture.canisterId);
  console.log("registeredSubscribers", JSON.stringify(state.publications[0][1], dataItemStringify, 2));
  expect(state.publications[0][1].registeredSubscribers[0][0]).toEqual(broadcaster_fixture.canisterId);
  expect(state.publications[0][1].registeredSubscribers[0][1].namespace).toEqual("anamespace");
  expect(state.publications[0][1].registeredSubscribers[0][1].subscriber).toEqual(broadcaster_fixture.canisterId);
    expect(state.publications[0][1].registeredSubscribers[0][1].subscriptionId).toEqual(1456321113n);
  expect(state.subscriptions.length).toEqual(1);
  expect(state.subscriptions[0][1].namespace).toEqual("anamespace");
  expect(state.icrc72Subscriber).toBeDefined();
  expect(state.icrc72Subscriber.icrc72OrchestratorCanister).toEqual(orchestrator_fixture.canisterId);
  expect(state.icrc72Subscriber.broadcasters.length).toEqual(0);
  console.log("subscriptions", state.icrc72Subscriber.subscriptions);
  expect(state.icrc72Subscriber.subscriptions.length).toEqual(3);

  expect(state.icrc72Subscriber.validBroadcasters).toBeDefined();
  expect(state.icrc72Subscriber.confirmAccumulator.length).toEqual(0);
  console.log("lastEventId", JSON.stringify(state.icrc72Subscriber.lastEventId, dataItemStringify, 2));
  expect(state.icrc72Subscriber.lastEventId.length).toEqual(1);
  expect(state.icrc72Subscriber.lastEventId[0][0]).toEqual("icrc72:broadcaster:sys:lqy7q-dh777-77777-aaaaq-cai");
  expect(state.icrc72Subscriber.lastEventId[0][1]).toEqual([[779n, 1n]]);

  let result2 = await broadcaster_fixture.actor.simulatePublisherAssignment("anamespace2", 2n,orchestrator_fixture.canisterId);
  let result3 = await broadcaster_fixture.actor.simulatePublisherAssignment("anamespace3", 3n,  orchestrator_fixture.canisterId);
  let result4 = await broadcaster_fixture.actor.simulatePublisherAssignment("anamespace4", 4n,  orchestrator_fixture.canisterId);
  let result5 = await broadcaster_fixture.actor.simulatePublisherAssignment("anamespace2", 5n, bob.getPrincipal());

  let result11 = await broadcaster_fixture.actor.simulateSubscriberAssignment("anamespace2", 6n,mockSub1.canisterId);
  let result10 = await broadcaster_fixture.actor.simulateSubscriberAssignment("anamespace3", 7n,  broadcaster_fixture.canisterId);
  let result7 = await broadcaster_fixture.actor.simulateSubscriberAssignment("anamespace4", 8n,  broadcaster_fixture.canisterId);
  let result9 = await broadcaster_fixture.actor.simulateSubscriberAssignment("anamespace2", 9n, mockSub2.canisterId);
  let result12 = await broadcaster_fixture.actor.simulateSubscriberAssignment("anamespace2", 10n, mockSub3.canisterId);
  let result13 = await broadcaster_fixture.actor.simulateSubscriberAssignment("anamespace2", 11n, mockSub4.canisterId);

  await pic.tick(5);
  await pic.advanceTime(60_000);

  state = await broadcaster_fixture.actor.get_stats();
  console.log("state", state);
  console.log("stateafter", state);

  // Verify default properties
  expect(state).toBeDefined();
  
  expect(state.publications.length).toEqual(4);
  expect(state.publications[0][1].namespace).toEqual("anamespace");
  expect(state.publications[0][1].registeredPublishers[0]).toEqual(orchestrator_fixture.canisterId);

  expect(state.publications[0][1].registeredSubscribers[0][0]).toEqual(broadcaster_fixture.canisterId);
  expect(state.publications[0][1].registeredSubscribers[0][1].namespace).toEqual("anamespace");
  expect(state.publications[0][1].registeredSubscribers[0][1].subscriber).toEqual(broadcaster_fixture.canisterId);
    expect(state.publications[0][1].registeredSubscribers[0][1].subscriptionId).toEqual(1456321113n);
  expect(state.publications[1][1].namespace).toEqual("anamespace2");
  console.log("registeredSubscribers", JSON.stringify(state.publications[1][1], dataItemStringify, 2));
  expect(state.publications[1][1].registeredPublishers[0]).toEqual(orchestrator_fixture.canisterId);
  expect(state.icrc72Subscriber).toBeDefined();
  expect(state.icrc72Subscriber.icrc72OrchestratorCanister).toEqual(orchestrator_fixture.canisterId);

  let result6 = await broadcaster_fixture.actor.simulateSubscriberRemoval("anamespace", 12n, broadcaster_fixture.canisterId);

  await pic.tick(5);
  await pic.advanceTime(60_000);

  state = await broadcaster_fixture.actor.get_stats();
  console.log("state", state);
  console.log("stateafter", state);

  expect(state).toBeDefined();
  console.log("publications", JSON.stringify(state.publications, dataItemStringify, 2));
  expect(state.publications.length).toEqual(4);
  expect(state.publications[0][1].namespace).toEqual("anamespace");
  expect(state.publications[0][1].registeredPublishers[0]).toEqual(orchestrator_fixture.canisterId);
  expect(state.publications[0][1].registeredSubscribers.length).toEqual(0);
  expect(state.publications[1][1].namespace).toEqual("anamespace2");
  console.log("subscriber1", JSON.stringify(state.publications[1][1].registeredSubscribers[0], dataItemStringify, 2));
  expect(state.publications[1][1].registeredSubscribers.length).toEqual(4)
  expect(state.publications[1][1].registeredSubscribers[0][0]).toEqual(mockSub1.canisterId);

  let publishResult = await broadcaster_fixture.actor.simulatePublish(13n,"anamespace2", 1n, orchestrator_fixture.canisterId);

  await pic.tick(5);
  await pic.advanceTime(2_000);
  await pic.tick(5);
  await pic.advanceTime(2_000);
  await pic.tick(5);
  await pic.advanceTime(2_000);
  await pic.tick(5);
  await pic.advanceTime(2_000);

  let didGetMessage1 = await mockSub1.actor.getReceivedNotifications();
  console.log("didGetMessage1", didGetMessage1);

  expect(didGetMessage1).toBeDefined();
  expect(didGetMessage1.length).toEqual(1);
  expect(didGetMessage1[0][0].eventId).toEqual(13n);
  expect(didGetMessage1[0][0].namespace).toEqual("anamespace2");
  expect(didGetMessage1[0][0].data).toEqual({Map: [["data", {Nat: 1n}]]});

  let didGetMessage2 = await mockSub2.actor.getReceivedNotifications();
  console.log("didGetMessage2", didGetMessage2);

  expect(didGetMessage2).toBeDefined();
  expect(didGetMessage2.length).toEqual(1);
  expect(didGetMessage2[0][0].eventId).toEqual(13n);
  expect(didGetMessage2[0][0].namespace).toEqual("anamespace2");
  expect(didGetMessage2[0][0].data).toEqual({Map: [["data", {Nat: 1n}]]});
  

  let didGetMessage3 = await mockSub3.actor.getReceivedNotifications();
  console.log(didGetMessage3);

  expect(didGetMessage3).toBeDefined();
  expect(didGetMessage3.length).toEqual(1);
  expect(didGetMessage3[0][0].eventId).toEqual(13n);
  expect(didGetMessage3[0][0].namespace).toEqual("anamespace2");
  expect(didGetMessage3[0][0].data).toEqual({Map: [["data", {Nat: 1n}]]});
  

  let didGetMessage4 = await mockSub4.actor.getReceivedNotifications();
  console.log(didGetMessage4);

  expect(didGetMessage4).toBeDefined();
  expect(didGetMessage4.length).toEqual(1);
  expect(didGetMessage4[0][0].eventId).toEqual(13n);
  expect(didGetMessage4[0][0].namespace).toEqual("anamespace2");
  expect(didGetMessage4[0][0].data).toEqual({Map: [["data", {Nat: 1n}]]});


  let publishResult2 = await deferredBroadcasterActor.simulatePublish(14n,"anamespace2", 2n, orchestrator_fixture.canisterId);
  let publishResult3 = await deferredBroadcasterActor.simulatePublish(15n,"anamespace2", 3n, orchestrator_fixture.canisterId);
  let publishResult4 = await deferredBroadcasterActor.simulatePublish(16n,"anamespace2", 4n, orchestrator_fixture.canisterId);
  let publishResult5 = await deferredBroadcasterActor.simulatePublish(17n,"anamespace2", 5n, orchestrator_fixture.canisterId);

  await pic.tick(5);
  await pic.advanceTime(2_000);
  await pic.tick(5);
  await pic.advanceTime(2_000);
  await pic.tick(5);
  await pic.advanceTime(2_000);
  await pic.tick(5);
  await pic.advanceTime(2_000);


  let didGetMessage5 = await mockSub1.actor.getReceivedNotifications();
  console.log("didGetMessage5", didGetMessage5);

  expect(didGetMessage5).toBeDefined();
  expect(didGetMessage5.length).toEqual(2);
  expect(didGetMessage5[1][0].eventId).toEqual(14n);
  expect(didGetMessage5[1][0].namespace).toEqual("anamespace2");
  expect(didGetMessage5[1][0].data).toEqual({Map: [["data", {Nat: 2n}]]});
  expect(didGetMessage5[1][3].eventId).toEqual(17n);
  expect(didGetMessage5[1][3].namespace).toEqual("anamespace2");
  expect(didGetMessage5[1][3].data).toEqual({Map: [["data", {Nat: 5n}]]});

  let didGetMessage6 = await mockSub4.actor.getReceivedNotifications();
  console.log("didGetMessage6", didGetMessage6);

  expect(didGetMessage6).toBeDefined();
  expect(didGetMessage6.length).toEqual(2);
  expect(didGetMessage6[1][0].eventId).toEqual(14n);
  expect(didGetMessage6[1][0].namespace).toEqual("anamespace2");
  expect(didGetMessage6[1][0].data).toEqual({Map: [["data", {Nat: 2n}]]});
  expect(didGetMessage6[1][3].eventId).toEqual(17n);
  expect(didGetMessage6[1][3].namespace).toEqual("anamespace2");
  expect(didGetMessage6[1][3].data).toEqual({Map: [["data", {Nat: 5n}]]});

}

it.only("test broadcaster register and deregisteres relay success", testBroadcasterRegisterRelaySuccess);

 /**
   * Test registering and removing a new publisher from Broadcaster.
   */
 async function testBroadcasterRegisterRelaySuccess() {
  //setUpBroadcaster("defaultBroadcaster");
  await setUpBroadcaster("testNotifyBroadcasterOfPublisher");
  const statePre = await broadcaster_fixture.actor.get_stats();
  console.log("Broadcaster Initialize State", statePre);

  let mockRelay1 = await pic.setupCanister<OrchestratorService>({
    sender: admin.getPrincipal(),
    idlFactory: orchestratorIDLFactory,
    wasm: orchestrator_WASM_PATH,
    arg: IDL.encode(orchestratorInit({IDL}), []),
  });
  let mockRelay2 = await pic.setupCanister<OrchestratorService>({
    sender: admin.getPrincipal(),
    idlFactory: orchestratorIDLFactory,
    wasm: orchestrator_WASM_PATH,
    arg: IDL.encode(orchestratorInit({IDL}), []),
  });
  let mockRelay3 = await pic.setupCanister<OrchestratorService>({
    sender: admin.getPrincipal(),
    idlFactory: orchestratorIDLFactory,
    wasm: orchestrator_WASM_PATH,
    arg: IDL.encode(orchestratorInit({IDL}), []),
  });
  let mockRelay4 = await pic.setupCanister<OrchestratorService>({
    sender: admin.getPrincipal(),
    idlFactory: orchestratorIDLFactory,
    wasm: orchestrator_WASM_PATH,
    arg: IDL.encode(orchestratorInit({IDL}), []),
  });;

  await pic.tick(5);
  await pic.advanceTime(60_000);
  await pic.tick(5);

  //simulate the orchestrator registering a publication
  let result = await broadcaster_fixture.actor.simulatePublisherAssignment("anamespace", 1n, orchestrator_fixture.canisterId);

  console.log("result", result);

  await pic.tick(5);
  await pic.advanceTime(60_000);

  let resultSub = await broadcaster_fixture.actor.simulateRelayAssignment("anamespace", 1n, broadcaster_fixture.canisterId);

  let state = await broadcaster_fixture.actor.get_stats();
  console.log("state", state);
  console.log("stateafter", state);

  // Verify default properties
  expect(state).toBeDefined();
  
  expect(state.publications.length).toEqual(1);
  expect(state.publications[0][1].namespace).toEqual("anamespace");
  expect(state.publications[0][1].registeredPublishers[0]).toEqual(orchestrator_fixture.canisterId);
  console.log("registeredSubscribers", JSON.stringify(state.publications[0][1], dataItemStringify, 2));
  expect(state.publications[0][1].registeredRelay[0][0]).toEqual(broadcaster_fixture.canisterId);
  expect(state.publications[0][1].registeredSubscribers.length).toEqual(0);
  expect(state.subscriptions.length).toEqual(1);
  expect(state.subscriptions[0][1].namespace).toEqual("anamespace");
  expect(state.icrc72Subscriber).toBeDefined();
  expect(state.icrc72Subscriber.icrc72OrchestratorCanister).toEqual(orchestrator_fixture.canisterId);
  expect(state.icrc72Subscriber.broadcasters.length).toEqual(0);
  console.log("subscriptions", state.icrc72Subscriber.subscriptions);
  expect(state.icrc72Subscriber.subscriptions.length).toEqual(3);

  expect(state.icrc72Subscriber.validBroadcasters).toBeDefined();
  expect(state.icrc72Subscriber.confirmAccumulator.length).toEqual(0);
  console.log("lastEventId", JSON.stringify(state.icrc72Subscriber.lastEventId, dataItemStringify, 2));
  expect(state.icrc72Subscriber.lastEventId.length).toEqual(1);
  expect(state.icrc72Subscriber.lastEventId[0][0]).toEqual("icrc72:broadcaster:sys:lqy7q-dh777-77777-aaaaq-cai");
  expect(state.icrc72Subscriber.lastEventId[0][1]).toEqual([[779n, 1n]]);

  let result2 = await broadcaster_fixture.actor.simulatePublisherAssignment("anamespace2", 2n, orchestrator_fixture.canisterId);
  let result3 = await broadcaster_fixture.actor.simulatePublisherAssignment("anamespace3", 3n,  orchestrator_fixture.canisterId);
  let result4 = await broadcaster_fixture.actor.simulatePublisherAssignment("anamespace4", 4n,  orchestrator_fixture.canisterId);
  let result5 = await broadcaster_fixture.actor.simulatePublisherAssignment("anamespace2", 5n, bob.getPrincipal());

  let result11 = await broadcaster_fixture.actor.simulateRelayAssignment("anamespace2", 6n,mockRelay1.canisterId);
  let result10 = await broadcaster_fixture.actor.simulateRelayAssignment("anamespace3", 7n,  broadcaster_fixture.canisterId);
  let result7 = await broadcaster_fixture.actor.simulateRelayAssignment("anamespace4", 8n,  broadcaster_fixture.canisterId);
  let result9 = await broadcaster_fixture.actor.simulateRelayAssignment("anamespace2", 9n, mockRelay2.canisterId);
  let result12 = await broadcaster_fixture.actor.simulateRelayAssignment("anamespace2", 10n, mockRelay3.canisterId);
  let result13 = await broadcaster_fixture.actor.simulateRelayAssignment("anamespace2", 11n, mockRelay4.canisterId);

  await pic.tick(5);
  await pic.advanceTime(60_000);

  state = await broadcaster_fixture.actor.get_stats();
  console.log("state", state);
  console.log("stateafter", state);

  // Verify default properties
  expect(state).toBeDefined();
  
  expect(state.publications.length).toEqual(4);
  expect(state.publications[0][1].namespace).toEqual("anamespace");
  expect(state.publications[0][1].registeredPublishers[0]).toEqual(orchestrator_fixture.canisterId);
  console.log("registeredrelay", JSON.stringify(state.publications[0][1].registeredRelay[0][0], dataItemStringify, 2));
  console.log("registeredrelay", JSON.stringify(state.publications[0][1].registeredRelay[0][0], dataItemStringify, 2));
  expect(state.publications[0][1].registeredRelay.length).toEqual(1); 
  expect(state.publications[1][1].registeredRelay.length).toEqual(4); 
  expect(state.publications[0][1].registeredRelay[0][0]).toEqual(broadcaster_fixture.canisterId);  
  expect(state.publications[1][1].registeredRelay[0][0]).toEqual(mockRelay1.canisterId); 
  expect(state.publications[1][1].registeredRelay[1][0]).toEqual(mockRelay2.canisterId); 

  expect(state.publications[0][1].registeredSubscribers.length).toEqual(0); //subscriptions are queried and filled
  expect(state.publications[1][1].namespace).toEqual("anamespace2");
  console.log("registeredSubscribers", JSON.stringify(state.publications[1][1], dataItemStringify, 2));
  expect(state.publications[1][1].registeredPublishers[0]).toEqual(orchestrator_fixture.canisterId);
  expect(state.icrc72Subscriber).toBeDefined();
  expect(state.icrc72Subscriber.icrc72OrchestratorCanister).toEqual(orchestrator_fixture.canisterId);

  let result6 = await broadcaster_fixture.actor.simulateSubscriberRemoval("anamespace", 6n, broadcaster_fixture.canisterId);

  await pic.tick(5);
  await pic.advanceTime(60_000);

  state = await broadcaster_fixture.actor.get_stats();
  console.log("state", state);
  console.log("stateafter", state);

  expect(state).toBeDefined();
  console.log("publications", JSON.stringify(state.publications, dataItemStringify, 2));
  expect(state.publications.length).toEqual(4);
  expect(state.publications[0][1].namespace).toEqual("anamespace");
  expect(state.publications[0][1].registeredPublishers[0]).toEqual(orchestrator_fixture.canisterId);
  expect(state.publications[0][1].registeredSubscribers.length).toEqual(0);
  expect(state.publications[1][1].namespace).toEqual("anamespace2");
  expect(state.publications[1][1].registeredPublishers[0]).toEqual(orchestrator_fixture.canisterId);

  let publishResult = await broadcaster_fixture.actor.simulatePublish(13n,"anamespace2", 1n, orchestrator_fixture.canisterId);

  await pic.tick(5);
  await pic.advanceTime(2_000);
  await pic.tick(5);
  await pic.advanceTime(2_000);
  await pic.tick(5);
  await pic.advanceTime(2_000);
  await pic.tick(5);
  await pic.advanceTime(2_000);

  let didGetMessage1 = await mockRelay1.actor.getPublishMessages();
  console.log("didGetMessage1", didGetMessage1);

  expect(didGetMessage1).toBeDefined();
  expect(didGetMessage1.length).toEqual(1);
  expect(didGetMessage1[0][0].id).toEqual(13n);
  expect(didGetMessage1[0][0].namespace).toEqual("anamespace2");
  expect(didGetMessage1[0][0].data).toEqual({Map: [["data", {Nat: 1n}]]});

  let didGetMessage2 = await mockRelay2.actor.getPublishMessages();
  console.log("didGetMessage2", didGetMessage2);

  expect(didGetMessage2).toBeDefined();
  expect(didGetMessage2.length).toEqual(1);
  expect(didGetMessage2[0][0].id).toEqual(13n);
  expect(didGetMessage2[0][0].namespace).toEqual("anamespace2");
  expect(didGetMessage2[0][0].data).toEqual({Map: [["data", {Nat: 1n}]]});
  

  let didGetMessage3 = await mockRelay3.actor.getPublishMessages();
  console.log(didGetMessage3);

  expect(didGetMessage3).toBeDefined();
  expect(didGetMessage3.length).toEqual(1);
  expect(didGetMessage3[0][0].id).toEqual(13n);
  expect(didGetMessage3[0][0].namespace).toEqual("anamespace2");
  expect(didGetMessage3[0][0].data).toEqual({Map: [["data", {Nat: 1n}]]});
  

  let didGetMessage4 = await mockRelay4.actor.getPublishMessages();
  console.log(didGetMessage4);

  expect(didGetMessage4).toBeDefined();
  expect(didGetMessage4.length).toEqual(1);
  expect(didGetMessage4[0][0].id).toEqual(13n);
  expect(didGetMessage4[0][0].namespace).toEqual("anamespace2");
  expect(didGetMessage4[0][0].data).toEqual({Map: [["data", {Nat: 1n}]]});


  let publishResult2 = await deferredBroadcasterActor.simulatePublish(14n,"anamespace2", 2n, orchestrator_fixture.canisterId);
  let publishResult3 = await deferredBroadcasterActor.simulatePublish(15n,"anamespace2", 3n, orchestrator_fixture.canisterId);
  let publishResult4 = await deferredBroadcasterActor.simulatePublish(16n,"anamespace2", 4n, orchestrator_fixture.canisterId);
  let publishResult5 = await deferredBroadcasterActor.simulatePublish(17n,"anamespace2", 5n, orchestrator_fixture.canisterId);

  await pic.tick(5);
  await pic.advanceTime(2_000);
  await pic.tick(5);
  await pic.advanceTime(2_000);
  await pic.tick(5);
  await pic.advanceTime(2_000);
  await pic.tick(5);
  await pic.advanceTime(2_000);


  let didGetMessage5 = await mockRelay1.actor.getPublishMessages();
  console.log("didGetMessage5", didGetMessage5);

  expect(didGetMessage5).toBeDefined();
  expect(didGetMessage5.length).toEqual(2);
  expect(didGetMessage5[1][0].id).toEqual(14n);
  expect(didGetMessage5[1][0].namespace).toEqual("anamespace2");
  expect(didGetMessage5[1][0].data).toEqual({Map: [["data", {Nat: 2n}]]});
  expect(didGetMessage5[1][3].id).toEqual(17n);
  expect(didGetMessage5[1][3].namespace).toEqual("anamespace2");
  expect(didGetMessage5[1][3].data).toEqual({Map: [["data", {Nat: 5n}]]});

  let didGetMessage6 = await mockRelay2.actor.getPublishMessages();
  console.log("didGetMessage6", didGetMessage6);

  expect(didGetMessage6).toBeDefined();
  expect(didGetMessage6.length).toEqual(2);
  expect(didGetMessage6[1][0].id).toEqual(14n);
  expect(didGetMessage6[1][0].namespace).toEqual("anamespace2");
  expect(didGetMessage6[1][0].data).toEqual({Map: [["data", {Nat: 2n}]]});
  expect(didGetMessage6[1][3].id).toEqual(17n);
  expect(didGetMessage6[1][3].namespace).toEqual("anamespace2");
  expect(didGetMessage6[1][3].data).toEqual({Map: [["data", {Nat: 5n}]]});
}

  /**
   * Test confirming notifications successfully.
   */
  async function testBroadcasterConfirmNotificationsSuccess() {
    // TODO: code pending.
  }

  /**
   * Test confirming notifications with some errors.
   */
  async function testBroadcasterConfirmNotificationsWithErrors() {
    // TODO: code pending.
  }

  /**
   * Test error handling during the publishing process.
   */
  async function testBroadcasterErrorHandlingDuringPublish() {
    // TODO: code pending.
  }

  /**
   * Test updating the configuration of an existing publication successfully.
   */
  async function testBroadcasterUpdatePublicationConfigSuccess() {
    // TODO: code pending.
  }

  /**
   * Test updating the configuration of a non-existing publication.
   */
  async function testBroadcasterUpdatePublicationConfigNonExisting() {
    // TODO: code pending.
  }

  /**
   * Test deleting an existing publication successfully.
   */
  async function testBroadcasterDeletePublicationSuccess() {
    // TODO: code pending.
  }

  /**
   * Test deleting a publication with an invalid identifier.
   */
  async function testBroadcasterDeletePublicationInvalidId() {
    // TODO: code pending.
  }

  /**
   * Test registering multiple publications simultaneously.
   */
  async function testBroadcasterRegisterMultiplePublications() {
    // TODO: code pending.
  }

  /**
   * Test deregistering all Subscribers from a publication.
   */
  async function testBroadcasterDeregisterAllSubscribers() {
    // TODO: code pending.
  }

  /**
   * Test handling multiple Relay Broadcasters concurrently.
   */
  async function testBroadcasterHandleMultipleRelays() {
    // TODO: code pending.
  }

  /**
   * Test handling errors from Relay Broadcasters.
   */
  async function testBroadcasterHandleRelayErrors() {
    // TODO: code pending.
  }

  /**
   * Test receiving and handling an invalid EventNotification.
   */
  async function testBroadcasterReceiveInvalidEventNotification() {
    // TODO: code pending.
  }

  /**
   * Test retrieving Broadcaster statistics accurately.
   */
  async function testBroadcasterRetrieveStats() {
    // TODO: code pending.
  }

  /**
   * Test the Broadcaster's response to high load conditions.
   */
  async function testBroadcasterHighLoadHandling() {
    // TODO: code pending.
  }


  /**
   * Test that the Broadcaster handles simultaneous add and remove requests gracefully.
   */
  async function testBroadcasterSimultaneousAddRemove() {
    // TODO: code pending.
  }

  /**
   * Test that the Broadcaster correctly updates internal mappings after configuration changes.
   */
  async function testBroadcasterInternalMappingsAfterConfigChange() {
    // TODO: code pending.
  }





  
});