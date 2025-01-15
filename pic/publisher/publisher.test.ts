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

import {idlFactory as publisherIDLFactory,
  init as publisherInit } from "../../src/declarations/publisher/publisher.did.js";
import type {
  NewEvent as ICRC72NewEvent,
  _SERVICE as PublisherService,ICRC16} from "../../src/declarations/publisher/publisher.did.d";
export const publisher_WASM_PATH = ".dfx/local/canisters/publisher/publisher.wasm.gz"; 

import {idlFactory as orchestratorIDLFactory,
  init as orchestratorInit } from "../../src/declarations/orchestratorMock/orchestratorMock.did.js";
import type {
  
  _SERVICE as OrchestratorService,} from "../../src/declarations/orchestratorMock/orchestratorMock.did.d";
import { get } from "http";
import { ICRC16Map, EventNotification, PublicationRegistration } from "../../src/declarations/orchestrator/orchestrator.did.js";
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
let publisher_fixture: CanisterFixture<PublisherService>;
let deferredPublisherActor: DeferredActor<PublisherService>;
let orchestrator_fixture: CanisterFixture<OrchestratorService>;

const getTimeNanos = async () => {
  return BigInt(Math.floor(((await pic.getTime()) * 1_000_000)));
};

describe("test publisher", () => {


  async function setUpPublisher(scenario: string) {
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

    publisher_fixture = await pic.setupCanister<PublisherService>({
      //targetCanisterId: Principal.fromText("q26le-iqaaa-aaaam-actsa-cai"),
      sender: admin.getPrincipal(),
      idlFactory: publisherIDLFactory,
      wasm: publisher_WASM_PATH,
      //targetSubnetId: subnets[0].id,
      arg: IDL.encode(publisherInit({IDL}), [[{
        orchestrator: orchestrator_fixture.canisterId,
        icrc72PublisherArgs: [],
        ttArgs: [],
      }]]),
    });

    console.log("set up publisher_fixture", publisher_fixture.canisterId);

    console.log("orch_fixture", publisher_fixture);

    deferredPublisherActor = await pic.createDeferredActor(publisherIDLFactory, publisher_fixture.canisterId)

    await publisher_fixture.actor.setIdentity(admin);
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
  async function testpublisherInitialization() {
    await setUpPublisher("defaultPublisher");
    const state = await publisher_fixture.actor.get_stats();
    console.log("stateInitialize",state);

    // Verify default properties
    expect(state).toBeDefined();
    expect(state.orchestrator).toEqual(orchestrator_fixture.canisterId);
    expect(state.broadcasters.length).toEqual(0);
    expect(state.publications.length).toEqual(0);
    expect(state.eventsProcessing).toEqual(false); 
    expect(state.pendingEvents.length).toEqual(0);
    expect(state.previousEventIds.length).toEqual(0);
    expect(state.drainEventId.length).toEqual(0);
    expect(state.readyForPublications).toEqual(false);
    expect(state.error.length).toBe(0); 
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
  }

  /**
   * Test that the Subscriber initializes correctly with the expected default state.
   */
  async function testPublisherInitializationWithWait() {
    await setUpPublisher("defaultPublisher");
    const statePre = await publisher_fixture.actor.get_stats();
    console.log("state",statePre);

    await pic.tick(5);
    await pic.advanceTime(60_000);
    await pic.tick(5);

    const state = await publisher_fixture.actor.get_stats();
    console.log("state", state);
    console.log("stateafter", state);

    // Verify initialized properties
    expect(state).toBeDefined();
    expect(state.orchestrator).toEqual(orchestrator_fixture.canisterId);
    expect(state.broadcasters.length).toEqual(0);
    expect(state.publications.length).toEqual(0);
    expect(state.eventsProcessing).toEqual(false); 
    expect(state.pendingEvents.length).toEqual(0);
    expect(state.previousEventIds.length).toEqual(0);
    expect(state.drainEventId.length).toEqual(0);
    expect(state.readyForPublications).toEqual(false);
    expect(state.error.length).toBe(0); 
    expect(state.tt).toBeDefined();
    expect(state.tt.timers).toEqual(0n);
    expect(state.icrc72Subscriber).toBeDefined();

    expect(state.icrc72Subscriber.icrc72OrchestratorCanister).toEqual(orchestrator_fixture.canisterId);
    expect(state.icrc72Subscriber.broadcasters.length).toEqual(0);
    expect(state.icrc72Subscriber.subscriptions.length).toEqual(2);
    expect(state.icrc72Subscriber.subscriptions[0][0]).toEqual(777n);
    expect(state.icrc72Subscriber.subscriptions[1][0]).toEqual(778n);
    console.log("state.icrc72Subscriber.subscriptions.length",state.icrc72Subscriber.subscriptions.length);
    console.log("state.icrc72Subscriber.subscriptions[0]",state.icrc72Subscriber.subscriptions[0]);
    console.log("state.icrc72Subscriber.subscriptions[1]",state.icrc72Subscriber.subscriptions[1]);
    expect(state.icrc72Subscriber.subscriptions[0][1].namespace).toEqual("icrc72:publisher:sys:" + publisher_fixture.canisterId.toText());
    expect(state.icrc72Subscriber.subscriptions[1][1].namespace).toEqual("icrc72:subscriber:sys:" + publisher_fixture.canisterId.toText());
    expect(state.icrc72Subscriber.validBroadcasters).toBeDefined();
    if ('list' in state.icrc72Subscriber.validBroadcasters) {
      expect(state.icrc72Subscriber.validBroadcasters.list).toBeDefined();
      expect(state.icrc72Subscriber.validBroadcasters.list.length).toEqual(1);
      expect(state.icrc72Subscriber.validBroadcasters.list[0]).toEqual(orchestrator_fixture.canisterId);
    } else {
      throw new Error("Expected validBroadcasters to be a list");
    };
     
    expect(state.icrc72Subscriber.confirmAccumulator.length).toEqual(0);
    expect(state.icrc72Subscriber.confirmTimer.length).toEqual(0);
    expect(state.icrc72Subscriber.lastEventId.length).toEqual(0);
    expect(state.icrc72Subscriber.backlogs.length).toEqual(0);
    expect(state.icrc72Subscriber.readyForSubscription).toEqual(true);
    expect(state.icrc72Subscriber.error.length).toBe(0); 
    expect(state.icrc72Subscriber.tt).toBeDefined();
    expect(state.icrc72Subscriber.tt.timers).toEqual(0n);
  };


  /**
   * Test registering a new publication successfully.
   */
  async function testPublisherRegisterPublication() {

    await setUpPublisher("defaultPublisher");

    await pic.tick(5);
    await pic.advanceTime(60_000);
    await pic.tick(5);


    // Attempt to register the new publication
    const registerResult = await publisher_fixture.actor.registerSamplePublication([getPublicationRegistration()]);
    console.log("registerResult",registerResult[0][0]);

    // Expect that the registration result contains an Ok with a publication ID
    expect(registerResult[0]).toBeDefined();
    expect(registerResult[0]?.length).toBeGreaterThan(0);
    expect(registerResult[0] && registerResult[0][0] && 'Ok' in registerResult[0][0] && registerResult[0][0].Ok).toEqual(777n);

    console.log("registerResult",registerResult);
    // Optionally, verify that the publication appears in the stats
    const stats = await publisher_fixture.actor.get_stats();
    expect(stats.publications.length).toBeGreaterThan(0);
    const registeredPub = stats.publications.find(pub => pub[1].namespace === "com.example.testapp.events");
    console.log("registeredPub",registeredPub);
    expect(registeredPub).toBeDefined();
    expect(registeredPub?.[1]?.id).toEqual(777n);
  }

  /**
   * Test registering a publication that already exists.
   */
  async function testPublisherRegisterPublicationAlreadyExists() {
    await setUpPublisher("defaultPublisher");

    await pic.tick(5);
    await pic.advanceTime(60_000);
    await pic.tick(5);


    // Attempt to register the new publication
    const registerResult = await publisher_fixture.actor.registerSamplePublication([getPublicationRegistration()]);
    console.log("registerResult",registerResult[0][0]);

    const secondRegisterResult = await publisher_fixture.actor.registerSamplePublication([getPublicationRegistration()]);
    console.log("secondRegisterResult",secondRegisterResult[0][0]);

    // Expect that the second registration returns an Err with PublicationRegisterError::AlreadyExists
    expect(secondRegisterResult[0]).toBeDefined();
    expect(secondRegisterResult[0][0]).toBeDefined();
    expect(secondRegisterResult[0] && secondRegisterResult[0][0] && 'Err' in secondRegisterResult[0][0]).toBe(true);
    if (secondRegisterResult[0][0] && 'Err' in secondRegisterResult[0][0]) {
      expect(secondRegisterResult[0][0].Err).toEqual({
        "GenericBatchError": "Network Error:Publication already exists" 
      });
    } else {
      throw new Error("Expected an error result but got none");
    }
  }


  /**
   * Test publishing a single event successfully.
   */
  async function testPublisherPublishSingleEvent() {
    await setUpPublisher("defaultPublisher");


    // Register the new publication
    const registerResult = await publisher_fixture.actor.registerSamplePublication([getPublicationRegistration()]);
    console.log("registerResult",registerResult[0][0]);


    await pic.tick(5);
    await pic.advanceTime(60_000);

    //simulate broadcast assignment
    await publisher_fixture.actor.simulateBroadcastAssignment("com.example.testapp.events", orchestrator_fixture.canisterId);


    await pic.tick(5);
    await pic.advanceTime(60_000);

    let statePre = await publisher_fixture.actor.get_stats();

    console.log("statePre",statePre);

    // Define a single event to publish
    const singleEvent = generateSingleEvent("com.example.testapp.events");

    // Mock a Broadcaster to listen to this publication
    // Assuming you have a subscriber_fixture set up similarly to the PublisherTest
    // You might need to set up a mock Broadcaster canister and ensure it's subscribed to the publication

    // Publish the single event
    const publishResult = await publisher_fixture.actor.simulatePublish([singleEvent]);

    console.log("publishResult",publishResult);

    // Expect that the publish result contains an Ok with a notification ID
    expect(publishResult[0]).toBeDefined();
    expect(publishResult[0]).toBeInstanceOf(Array);
    expect(publishResult[0][0]).toBe(0n);

    await pic.tick(5);
    await pic.advanceTime(60_000);
    await pic.tick(5);

    // Verify that the event was sent to the broadcaster
    const orchestratorEvents = await orchestrator_fixture.actor.getPublishMessages();
    console
    expect(orchestratorEvents).toBeDefined();
    expect(orchestratorEvents.length).toBeGreaterThan(0);
    expect(orchestratorEvents[0][0].namespace).toEqual("com.example.testapp.events");
  }

  /**
   * Test publishing multiple events successfully.
   */
  async function testPublisherPublishMultipleEvents() {
    // Set the OrchestratorMock scenario to 'defaultPublisherMultiSend' to simulate multiple broadcasters
    await setUpPublisher("defaultPublisher");

    

    // Register a sample publication
    const pubReg = getPublicationRegistration();
    const regResult = await publisher_fixture.actor.registerSamplePublication([pubReg]);

    await pic.tick(5);
    await pic.advanceTime(60_000);

    //simulate broadcast assignment
    await publisher_fixture.actor.simulateBroadcastAssignment("com.example.testapp.events", orchestrator_fixture.canisterId);

    
    // Expect the registration to be successful with publication ID 777
    expect(regResult[0] && regResult[0][0] && 'Ok' in regResult[0][0] && regResult[0][0].Ok).toEqual(777n);

    // Simulate publishing a single event
    const singleEvent = generateSingleEvent("com.example.testapp.events");
    const singleEvent1 = generateSingleEvent("com.example.testapp.events");
    const singleEvent2 = generateSingleEvent("com.example.testapp.events");

    const publishResult = await publisher_fixture.actor.simulatePublish([singleEvent, singleEvent1, singleEvent2]);

    // Expect that multiple notification IDs are returned (e.g., [1, 2, 3] for multiple broadcasters)
    expect(publishResult).toBeDefined();
    expect(publishResult.length).toBeGreaterThan(2);
    expect(publishResult[0]).toBeDefined();

    await pic.tick(5);
    await pic.advanceTime(60_000);

    // Retrieve the publish messages from OrchestratorMock
    const publishMessages = await orchestrator_fixture.actor.getPublishMessages();
    

    console.log("publishMessages",publishMessages);
    expect(publishMessages).toBeDefined();
    expect(publishMessages.length).toBeGreaterThan(0);
    expect(publishMessages[0].length).toBeGreaterThan(2);
    expect(publishMessages[0][0].namespace).toEqual("com.example.testapp.events");
    console.log("publishMessages[0][0]",publishMessages[0][0]);
    expect(publishMessages[0][0].id).toEqual(0n);
    

    expect(publishMessages[0][1].namespace).toEqual("com.example.testapp.events");
    console.log("publishMessages2[1][0]",publishMessages[0][1]);
    expect(publishMessages[0][1].id).toEqual(1n);

    expect(publishMessages[0][2].namespace).toEqual("com.example.testapp.events");
    console.log("publishMessages[2][0]",publishMessages[0][2]);
    expect(publishMessages[0][2].id).toEqual(2n);
  }

  /**
   * Test publishing an event with an invalid namespace.
   */
  async function testPublisherPublishInvalidNamespace() {
    await setUpPublisher("defaultPublisher");


    // Register the new publication
    const registerResult = await publisher_fixture.actor.registerSamplePublication([getPublicationRegistration()]);
    console.log("registerResult",registerResult[0][0]);


    await pic.tick(5);
    await pic.advanceTime(60_000);

    //simulate broadcast assignment
    await publisher_fixture.actor.simulateBroadcastAssignment("com.example.testapp.events", orchestrator_fixture.canisterId);


    await pic.tick(5);
    await pic.advanceTime(60_000);

    let statePre = await publisher_fixture.actor.get_stats();

    console.log("statePre",statePre);

    // Define a single event to publish
    const singleEvent = generateSingleEvent("com.example.testapp.events.fake");

    // Mock a Broadcaster to listen to this publication
    // Assuming you have a subscriber_fixture set up similarly to the PublisherTest
    // You might need to set up a mock Broadcaster canister and ensure it's subscribed to the publication

    // Publish the single event
    const publishResult = await publisher_fixture.actor.simulatePublish([singleEvent]);

    console.log("publishResult",publishResult);

    // Expect that the publish result contains an Ok with a notification ID
    expect(publishResult[0]).toBeDefined();
    expect(publishResult[0]).toBeInstanceOf(Array);
    expect(publishResult[0].length).toBe(0);

  }

  /**
   * Test publishing without any assigned Broadcasters.
   */
  async function testPublisherPublishWithoutBroadcasters() {
    await setUpPublisher("defaultPublisher");


    // Register the new publication
    const registerResult = await publisher_fixture.actor.registerSamplePublication([getPublicationRegistration()]);
    console.log("registerResult",registerResult[0][0]);


    await pic.tick(5);
    await pic.advanceTime(60_000);




    let statePre = await publisher_fixture.actor.get_stats();

    console.log("statePre",statePre);

    // Define a single event to publish
    const singleEvent = generateSingleEvent("com.example.testapp.events.fake");

    // Mock a Broadcaster to listen to this publication
    // Assuming you have a subscriber_fixture set up similarly to the PublisherTest
    // You might need to set up a mock Broadcaster canister and ensure it's subscribed to the publication

    // Publish the single event
    const publishResult = await publisher_fixture.actor.simulatePublish([singleEvent]);

    console.log("publishResult",publishResult);

    // Expect that the publish result contains an Ok with a notification ID
    expect(publishResult[0]).toBeDefined();
    expect(publishResult[0]).toBeInstanceOf(Array);
    expect(publishResult[0].length).toBe(0);

  }

  /**
   * Test handling broadcaster add events.
   */
  async function testPublisherHandleBroadcasterAdd() {

    await setUpPublisher("defaultPublisher");


    // Register the new publication
    const registerResult = await publisher_fixture.actor.registerSamplePublication([getPublicationRegistration()]);
    console.log("registerResult",registerResult[0][0]);


    await pic.tick(5);
    await pic.advanceTime(60_000);

    //simulate broadcast assignment
    await publisher_fixture.actor.simulateBroadcastAssignmentEvent("com.example.testapp.events", orchestrator_fixture.canisterId);


    await pic.tick(5);
    await pic.advanceTime(60_000);

    let statePre = await publisher_fixture.actor.get_stats();

    console.log("statePre",statePre);

    expect(statePre.broadcasters.length).toEqual(1);
    expect(statePre.broadcasters[0].length).toEqual(2);
    expect(statePre.broadcasters[0][0]).toEqual("com.example.testapp.events");
    expect(statePre.broadcasters[0][1].length).toEqual(1);

  }

  /**
   * Test handling broadcaster remove events.
   */
  async function testPublisherHandleBroadcasterRemove() {
    await setUpPublisher("defaultPublisher");

    let orch2 = await pic.setupCanister<OrchestratorService>({
      sender: admin.getPrincipal(),
      idlFactory: orchestratorIDLFactory,
      wasm: orchestrator_WASM_PATH,
      arg: IDL.encode(orchestratorInit({IDL}), []),
    });


    // Register the new publication
    const registerResult = await publisher_fixture.actor.registerSamplePublication([getPublicationRegistration()]);
    console.log("registerResult",registerResult[0][0]);


    await pic.tick(5);
    await pic.advanceTime(60_000);

    //simulate broadcast assignment
    await publisher_fixture.actor.simulateBroadcastAssignmentEvent("com.example.testapp.events", orchestrator_fixture.canisterId);

    await publisher_fixture.actor.simulateBroadcastAssignmentEvent("com.example.testapp.events", orch2.canisterId);



    await pic.tick(5);
    await pic.advanceTime(60_000);

    let statePre = await publisher_fixture.actor.get_stats();

    console.log("statePre",statePre);
    

    expect(statePre.broadcasters.length).toEqual(1);
    expect(statePre.broadcasters[0].length).toEqual(2);
    expect(statePre.broadcasters[0][0]).toEqual("com.example.testapp.events");
    expect(statePre.broadcasters[0][1].length).toEqual(2);


    await publisher_fixture.actor.simulateBroadcastRemovalEvent("com.example.testapp.events", orch2.canisterId);



    await pic.tick(5);
    await pic.advanceTime(60_000);

    let statePost = await publisher_fixture.actor.get_stats();

    console.log("statePost",statePost);

    expect(statePost.broadcasters.length).toEqual(1);
    expect(statePost.broadcasters[0].length).toEqual(2);
    expect(statePost.broadcasters[0][0]).toEqual("com.example.testapp.events");
    expect(statePost.broadcasters[0][1].length).toEqual(1);


  }


  function generateSingleEvent (namespace: string): ICRC72NewEvent {
    const singleEvent = {

      namespace: namespace,
      data: { Map: [
        ["field1", { Text: "value1" }],
        ["field2", { Nat: 100n }]
      ] } as ICRC16,
      headers: [] as []
    };
    return singleEvent;
  };

  /**
   * Test that publisher can handle multiple publications.
   * This test is a bit more complex and will require setting up multiple publications and broadcasters.
   
  */
  async function testMultipleBroadcasterForNamespace() {
    // Set the OrchestratorMock scenario to 'defaultPublisherMultiSend' to simulate multiple broadcasters
    await setUpPublisher("defaultPublisher");

    let orchestrator_fixture2 = await pic.setupCanister<OrchestratorService>({
      sender: admin.getPrincipal(),
      idlFactory: orchestratorIDLFactory,
      wasm: orchestrator_WASM_PATH,
      arg: IDL.encode(orchestratorInit({IDL}), []),
    });
    let result = await orchestrator_fixture2.actor.setIdentity(admin);
    let result2 = await orchestrator_fixture2.actor.set_scenario("defaultPublisher");

    let orchestrator_fixture3 = await pic.setupCanister<OrchestratorService>({
      sender: admin.getPrincipal(),
      idlFactory: orchestratorIDLFactory,
      wasm: orchestrator_WASM_PATH,
      arg: IDL.encode(orchestratorInit({IDL}), []),
    });
    let result3 = await orchestrator_fixture3.actor.setIdentity(admin);
    let result4 = await orchestrator_fixture3.actor.set_scenario("defaultPublisher");

    // Register a sample publication
    const pubReg = getPublicationRegistration();
    const regResult = await publisher_fixture.actor.registerSamplePublication([pubReg]);

    await pic.tick(5);
    await pic.advanceTime(60_000);

    //simulate broadcast assignment
    await publisher_fixture.actor.simulateBroadcastAssignment("com.example.testapp.events", orchestrator_fixture.canisterId);

    //simulate broadcast assignment
    await publisher_fixture.actor.simulateBroadcastAssignment("com.example.testapp.events", orchestrator_fixture2.canisterId);
    //simulate broadcast assignment
    await publisher_fixture.actor.simulateBroadcastAssignment("com.example.testapp.events", orchestrator_fixture3.canisterId);
    
    // Expect the registration to be successful with publication ID 777
    expect(regResult[0] && regResult[0][0] && 'Ok' in regResult[0][0] && regResult[0][0].Ok).toEqual(777n);

    // Simulate publishing a single event
    const singleEvent = generateSingleEvent("com.example.testapp.events");
    const singleEvent1 = generateSingleEvent("com.example.testapp.events");
    const singleEvent2 = generateSingleEvent("com.example.testapp.events");

    const publishResult = await publisher_fixture.actor.simulatePublish([singleEvent, singleEvent1, singleEvent2]);

    // Expect that multiple notification IDs are returned (e.g., [1, 2, 3] for multiple broadcasters)
    expect(publishResult).toBeDefined();
    expect(publishResult.length).toBeGreaterThan(2);
    expect(publishResult[0]).toBeDefined();

    await pic.tick(5);
    await pic.advanceTime(60_000);

    // Retrieve the publish messages from OrchestratorMock
    const publishMessages = await orchestrator_fixture.actor.getPublishMessages();
    const publishMessages2 = await orchestrator_fixture2.actor.getPublishMessages();
    const publishMessages3 = await orchestrator_fixture3.actor.getPublishMessages();

    
    expect(publishMessages).toBeDefined();
    expect(publishMessages.length).toBeGreaterThan(0);
    expect(publishMessages[0][0].namespace).toEqual("com.example.testapp.events");
    console.log("publishMessages[0][0]",publishMessages[0][0]);
    expect(publishMessages[0][0].id).toEqual(2n);
    

    expect(publishMessages2).toBeDefined();
    expect(publishMessages2.length).toBeGreaterThan(0);
    expect(publishMessages2[0][0].namespace).toEqual("com.example.testapp.events");
    console.log("publishMessages2[0][0]",publishMessages2[0][0]);
    expect(publishMessages2[0][0].id).toEqual(0n);

    expect(publishMessages3).toBeDefined();
    expect(publishMessages3.length).toBeGreaterThan(0);
    expect(publishMessages3[0][0].namespace).toEqual("com.example.testapp.events");
    console.log("publishMessages3[0][0]",publishMessages3[0][0]);
    expect(publishMessages3[0][0].id).toEqual(1n);
  }

  /**
   * Test that publisher can remove broadcasters.
  */
  async function testRemovingBroadcasters() {
    await setUpPublisher("defaultPublisher");

    // Register the new publication
    const registerResult = await publisher_fixture.actor.registerSamplePublication([getPublicationRegistration()]);
    console.log("registerResult",registerResult[0][0]);


    await pic.tick(5);
    await pic.advanceTime(60_000);

    let fakeOrch2 = await pic.setupCanister<OrchestratorService>({
      sender: admin.getPrincipal(),
      idlFactory: orchestratorIDLFactory,
      wasm: orchestrator_WASM_PATH,
      arg: IDL.encode(orchestratorInit({IDL}), []),
    });

    let fakeOrch3 = await pic.setupCanister<OrchestratorService>({
      sender: admin.getPrincipal(),
      idlFactory: orchestratorIDLFactory,
      wasm: orchestrator_WASM_PATH,
      arg: IDL.encode(orchestratorInit({IDL}), []),
    });

    //simulate broadcast assignment
    await publisher_fixture.actor.simulateBroadcastAssignment("com.example.testapp.events", orchestrator_fixture.canisterId);
    await publisher_fixture.actor.simulateBroadcastAssignment("com.example.testapp.events", fakeOrch2.canisterId);
    await publisher_fixture.actor.simulateBroadcastAssignment("com.example.testapp.events", fakeOrch3.canisterId);


    await pic.tick(5);
    await pic.advanceTime(60_000);

    let statePre = await publisher_fixture.actor.get_stats();

    console.log("statePre",statePre);

    expect(statePre.broadcasters.length).toEqual(1);
    expect(statePre.broadcasters[0].length).toEqual(2);
    expect(statePre.broadcasters[0][0]).toEqual("com.example.testapp.events");
    expect(statePre.broadcasters[0][1].length).toEqual(3);
    expect(statePre.broadcasters[0][1][0]).toEqual(orchestrator_fixture.canisterId);
    expect(statePre.broadcasters[0][1][1]).toEqual(fakeOrch2.canisterId);
    expect(statePre.broadcasters[0][1][2]).toEqual(fakeOrch3.canisterId);

    let remove = await publisher_fixture.actor.simulateBroadcastRemoval("com.example.testapp.events", fakeOrch2.canisterId);

    let statePost = await publisher_fixture.actor.get_stats();

    console.log("statePost",statePost);
    expect(statePost.broadcasters.length).toEqual(1);
    expect(statePost.broadcasters[0].length).toEqual(2);
    expect(statePost.broadcasters[0][0]).toEqual("com.example.testapp.events");
    expect(statePost.broadcasters[0][1].length).toEqual(2);
    expect(statePost.broadcasters[0][1][0]).toEqual(orchestrator_fixture.canisterId);
   
    expect(statePost.broadcasters[0][1][1]).toEqual(fakeOrch3.canisterId);


  }

  /**
   * Test that publisher can add multiple broadcasters.
  */
  async function testPublisherAddMultipleBroadcasters() {
    await setUpPublisher("defaultPublisher");

    // Register the new publication
    const registerResult = await publisher_fixture.actor.registerSamplePublication([getPublicationRegistration()]);
    console.log("registerResult",registerResult[0][0]);


    await pic.tick(5);
    await pic.advanceTime(60_000);

    let fakeOrch2 = await pic.setupCanister<OrchestratorService>({
      sender: admin.getPrincipal(),
      idlFactory: orchestratorIDLFactory,
      wasm: orchestrator_WASM_PATH,
      arg: IDL.encode(orchestratorInit({IDL}), []),
    });

    let fakeOrch3 = await pic.setupCanister<OrchestratorService>({
      sender: admin.getPrincipal(),
      idlFactory: orchestratorIDLFactory,
      wasm: orchestrator_WASM_PATH,
      arg: IDL.encode(orchestratorInit({IDL}), []),
    });

    //simulate broadcast assignment
    await publisher_fixture.actor.simulateBroadcastAssignment("com.example.testapp.events", orchestrator_fixture.canisterId);
    await publisher_fixture.actor.simulateBroadcastAssignment("com.example.testapp.events", fakeOrch2.canisterId);
    await publisher_fixture.actor.simulateBroadcastAssignment("com.example.testapp.events", fakeOrch3.canisterId);


    await pic.tick(5);
    await pic.advanceTime(60_000);

    let statePre = await publisher_fixture.actor.get_stats();

    console.log("statePre",statePre);

    expect(statePre.broadcasters.length).toEqual(1);
    expect(statePre.broadcasters[0].length).toEqual(2);
    expect(statePre.broadcasters[0][0]).toEqual("com.example.testapp.events");
    expect(statePre.broadcasters[0][1].length).toEqual(3);
    expect(statePre.broadcasters[0][1][0]).toEqual(orchestrator_fixture.canisterId);
    expect(statePre.broadcasters[0][1][1]).toEqual(fakeOrch2.canisterId);
    expect(statePre.broadcasters[0][1][2]).toEqual(fakeOrch3.canisterId);
  }

  /**
   * Test that publisher can delete publications.
  */
  async function testCanDeletePublication() {
    await setUpPublisher("defaultPublisher");
    const statePre = await publisher_fixture.actor.get_stats();
    console.log("state",statePre);

    let reg = await publisher_fixture.actor.registerSamplePublication([getPublicationRegistration()]);

    await pic.tick(5);
    await pic.advanceTime(60_000);
    await pic.tick(5);

    const state = await publisher_fixture.actor.get_stats();
    console.log("state", state);
    console.log("stateafter", state);

    expect(state).toBeDefined();
    expect(state.publications.length).toEqual(1);

    await pic.tick(5);
    await pic.advanceTime(60_000);
    await pic.tick(5);

    let del = await publisher_fixture.actor.simulateDeletePublication("com.example.testapp.events");

    await pic.tick(5);
    await pic.advanceTime(60_000);
    await pic.tick(5);


    const statePost = await publisher_fixture.actor.get_stats();

    console.log("statePost", statePost);

    expect(statePost).toBeDefined();
    expect(statePost.publications.length).toEqual(0);



  }

  /**
   * Test that publisher can intercept errors.
  */
  async function testPublisherInterceptError() {


    await setUpPublisher("errorOnNotify");


    // Register the new publication
    const registerResult = await publisher_fixture.actor.registerSamplePublication([getPublicationRegistration()]);
    console.log("registerResultWithError",registerResult[0][0]);


    await pic.tick(5);
    await pic.advanceTime(60_000);

    //simulate broadcast assignment
    await publisher_fixture.actor.simulateBroadcastAssignment("com.example.testapp.events", orchestrator_fixture.canisterId);


    await pic.tick(5);
    await pic.advanceTime(60_000);

    let statePre = await publisher_fixture.actor.get_stats();

    console.log("statePre with error",statePre);

    // Define a single event to publish
    const singleEvent = generateSingleEvent("com.example.testapp.events");

    // Mock a Broadcaster to listen to this publication
    // Assuming you have a subscriber_fixture set up similarly to the PublisherTest
    // You might need to set up a mock Broadcaster canister and ensure it's subscribed to the publication

    // Publish the single event
    const publishResult = await publisher_fixture.actor.simulatePublish([singleEvent]);

    console.log("publishResult with error",publishResult);

    // Expect that the publish result contains an Ok with a notification ID
    expect(publishResult[0]).toBeDefined();
    expect(publishResult[0]).toBeInstanceOf(Array);
    expect(publishResult[0][0]).toBe(0n);

    await pic.tick(5);
    await pic.advanceTime(60_000);
    await pic.tick(5);

    // Verify that the event was sent to the broadcaster
    const intercepted = await publisher_fixture.actor.getPublishErrors();
    console.log("intercepted Error",intercepted);

    expect(intercepted).toBeDefined();
    expect(intercepted.length).toBeGreaterThan(0);
    expect(intercepted[0][0].namespace).toEqual("com.example.testapp.events");
    expect('GenericError' in intercepted[0][1]).toEqual(true);
  }

  /**
   * Test that publisher can update publication configurations.
  */
  async function testPublisherUpdatePublication() {
    await setUpPublisher("defaultPublisher");


    // Register the new publication
    const registerResult = await publisher_fixture.actor.registerSamplePublication([getPublicationRegistration()]);
    console.log("registerResult",registerResult[0][0]);


    await pic.tick(5);
    await pic.advanceTime(60_000);

    //simulate broadcast assignment
    let updateresult = await publisher_fixture.actor.simulateUpdatePublication([
      {
        publication : {namespace : "com.example.testapp.events"}, 
        config :(["test",{Text:"test"}]),
        memo: []
      }]);

      expect(updateresult).toBeDefined();


    await pic.tick(5);
    await pic.advanceTime(60_000);

    let statePre = await publisher_fixture.actor.get_stats();

    console.log("statePre",statePre);

    let result = await orchestrator_fixture.actor.getPublicationUpdates();


    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    if('namespace' in result[0][0].publication){
      expect(result[0][0].publication.namespace).toEqual("com.example.testapp.events");
    } else {
      throw new Error("Expected namespace in publication");
    }


  }

  /**
   * Test that publisher can handle intercepting publish results.
  */
  async function testPublisherInterceptResults() {
    await setUpPublisher("defaultPublisher");


    // Register the new publication
    const registerResult = await publisher_fixture.actor.registerSamplePublication([getPublicationRegistration()]);
    console.log("registerResult",registerResult[0][0]);


    await pic.tick(5);
    await pic.advanceTime(60_000);

    //simulate broadcast assignment
    await publisher_fixture.actor.simulateBroadcastAssignment("com.example.testapp.events", orchestrator_fixture.canisterId);


    await pic.tick(5);
    await pic.advanceTime(60_000);

    let statePre = await publisher_fixture.actor.get_stats();

    console.log("statePre",statePre);

    // Define a single event to publish
    const singleEvent = generateSingleEvent("com.example.testapp.events");

    // Mock a Broadcaster to listen to this publication
    // Assuming you have a subscriber_fixture set up similarly to the PublisherTest
    // You might need to set up a mock Broadcaster canister and ensure it's subscribed to the publication

    // Publish the single event
    const publishResult = await publisher_fixture.actor.simulatePublish([singleEvent]);

    console.log("publishResult",publishResult);

    // Expect that the publish result contains an Ok with a notification ID
    expect(publishResult[0]).toBeDefined();
    expect(publishResult[0]).toBeInstanceOf(Array);
    expect(publishResult[0][0]).toBe(0n);

    await pic.tick(5);
    await pic.advanceTime(60_000);
    await pic.tick(5);

    // Verify that the event was sent to the broadcaster
    const intercepted = await publisher_fixture.actor.getPublishedEvents();
    console.log("intercepted",intercepted);
    expect(intercepted).toBeDefined();
    expect(intercepted.length).toBeGreaterThan(0);
    expect(intercepted[0][0].namespace).toEqual("com.example.testapp.events");
    expect(intercepted[0][1][0]).toEqual({Ok: [1n]});
  }

  async function testPublisherPublishMultipleNamespaces() {
    // Set the OrchestratorMock scenario to 'defaultPublisherMultiSend' to simulate multiple broadcasters
    await setUpPublisher("defaultPublisher");

    

    // Register a sample publication
    const pubReg = getPublicationRegistration();
    const regResult = await publisher_fixture.actor.registerSamplePublication([pubReg]);

    await pic.tick(5);
    await pic.advanceTime(60_000);

    //simulate broadcast assignment
    await publisher_fixture.actor.simulateBroadcastAssignment("com.example.testapp.events", orchestrator_fixture.canisterId);
    await publisher_fixture.actor.simulateBroadcastAssignment("com.example.testapp.events2", orchestrator_fixture.canisterId);
    await publisher_fixture.actor.simulateBroadcastAssignment("com.example.testapp.events3", orchestrator_fixture.canisterId);

    
    // Expect the registration to be successful with publication ID 777
    expect(regResult[0] && regResult[0][0] && 'Ok' in regResult[0][0] && regResult[0][0].Ok).toEqual(777n);

    // Simulate publishing a single event
    const singleEvent = generateSingleEvent("com.example.testapp.events");
    const singleEvent1 = generateSingleEvent("com.example.testapp.events2");
    const singleEvent2 = generateSingleEvent("com.example.testapp.events3");

    const publishResult = await publisher_fixture.actor.simulatePublish([singleEvent, singleEvent1, singleEvent2]);

    // Expect that multiple notification IDs are returned (e.g., [1, 2, 3] for multiple broadcasters)
    expect(publishResult).toBeDefined();
    expect(publishResult.length).toBeGreaterThan(2);
    expect(publishResult[0]).toBeDefined();

    await pic.tick(5);
    await pic.advanceTime(60_000);

    // Retrieve the publish messages from OrchestratorMock
    const publishMessages = await orchestrator_fixture.actor.getPublishMessages();
    

    console.log("publishMessages",publishMessages);
    expect(publishMessages).toBeDefined();
    expect(publishMessages.length).toBeGreaterThan(0);
    expect(publishMessages[0].length).toBeGreaterThan(2);
    expect(publishMessages[0][0].namespace).toEqual("com.example.testapp.events");
    console.log("publishMessages[0][0]",publishMessages[0][0]);
    expect(publishMessages[0][0].id).toEqual(0n);
    

    expect(publishMessages[0][1].namespace).toEqual("com.example.testapp.events2");
    console.log("publishMessages2[0][1]",publishMessages[0][1]);
    expect(publishMessages[0][1].id).toEqual(0n);

    expect(publishMessages[0][2].namespace).toEqual("com.example.testapp.events3");
    console.log("publishMessages[0][2]",publishMessages[0][2]);
    expect(publishMessages[0][2].id).toEqual(0n);
  }

  
  


  function getPublicationRegistration(){
      return{
      namespace: "com.example.testapp.events",
      config: [
        ["icrc72:publication:publishers:allowed:list", { Blob: publisher_fixture.canisterId.toUint8Array() }],
        ["icrc72:publication:mode", { Text: "fifo" }]
      ] as ICRC16Map,
      memo: []
    } as PublicationRegistration;
  };

  // Register the test functions within Jest's 'it' blocks
  it(`can say hello`, async () => {
    await setUpPublisher("default");
    let response = await publisher_fixture.actor.hello();
    expect(response).toEqual("Hello, World!");
  });
  
  it("should initialize the Publisher correctly", testpublisherInitialization);

  it("should self initialize the Publisher correctly", testPublisherInitializationWithWait);

  it("should register a new publication successfully", testPublisherRegisterPublication);

  it("should not allow registering a publication that already exists", testPublisherRegisterPublicationAlreadyExists);


  it("should publish a single event successfully", testPublisherPublishSingleEvent);

  it("should publish multiple events successfully", testPublisherPublishMultipleEvents);

  it("should publish for multiple namespaces", testPublisherPublishMultipleNamespaces);

  it("should handle adding multiple broadcasters per namespace", testPublisherAddMultipleBroadcasters);

  it("should not publish an unknown namespace", testPublisherPublishInvalidNamespace);

  it("should distribute messages across multiple broadcasters for namespace", testMultipleBroadcasterForNamespace);

  it("should handle removing broadcasters", testRemovingBroadcasters);

  it("should error correctly without any assigned Broadcasters", testPublisherPublishWithoutBroadcasters);

  it("should handle broadcaster add events correctly", testPublisherHandleBroadcasterAdd);

  it("should handle broadcaster remove events correctly", testPublisherHandleBroadcasterRemove);

  /* 
  Todo tests:
  
  it("should drain notifications successfully", testPublisherDrainNotifications);

  it("should limit outgoing calls during drain to avoid queue overload", testPublisherDrainActionHandlesBatches);

  it("should retrieve publisher statistics accurately", testPublisherGetStats);

  it("should retrieve broadcaster statistics accurately", testPublisherGetBroadcasterStats); 
  
  it("should handle publishing the maximum number of events", testPublisherEdgeCasesMaxPublish);


  it("should handle publishing large messages appropriately", testPublisherEdgeCasesLargeMessages);


  it("should stop processing events after deregistration", testPublisherDeregistrationStopsEventProcessing);
  
  */


  it("can intercept returned publish results", testPublisherInterceptResults);

  it("can intercept returned publish errors", testPublisherInterceptError);

  it("should allow deleting publication", testCanDeletePublication);

  it("should allow updating config for publication", testPublisherUpdatePublication);

});