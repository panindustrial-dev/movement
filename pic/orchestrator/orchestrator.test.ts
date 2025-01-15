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

import {idlFactory as orchestratorIDLFactory,
  init as orchestratorInit } from "../../src/declarations/orchestrator/orchestrator.did.js";
import type {
  _SERVICE as OrchService,} from "../../src/declarations/orchestrator/orchestrator.did.d";
export const orch_WASM_PATH = ".dfx/local/canisters/orchestrator/orchestrator.wasm.gz"; 

import {idlFactory as mockIDLFactory,
  init as mockInit } from "../../src/declarations/orchestratorMock/orchestratorMock.did.js";
import type {
  _SERVICE as MockService,} from "../../src/declarations/orchestratorMock/orchestratorMock.did.d";
import { get } from "http";
import { ICRC16Map, EventNotification, PublicationRegistration } from "../../src/declarations/orchestrator/orchestrator.did.js";
import * as exp from "constants";
import { register } from "module";
export const orchestrator_WASM_PATH = ".dfx/local/canisters/orchestrator/orchestrator.wasm.gz"; 
export const mock_WASM_PATH = ".dfx/local/canisters/orchestratorMock/orchestratorMock.wasm.gz"; 



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
let orchestrator_fixture: CanisterFixture<OrchService>;
let deferredOrchestratorActor: DeferredActor<OrchService>;
let mock_fixture: CanisterFixture<MockService>;

const getTimeNanos = async () => {
  return BigInt(Math.floor(((await pic.getTime()) * 1_000_000)));
};

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

describe("test broadcaster", () => {


  async function setUpOrchestrator(scenario: string) {
    console.log("setting up canisters");

    mock_fixture = await pic.setupCanister<MockService>({
      sender: admin.getPrincipal(),
      idlFactory: mockIDLFactory,
      wasm: mock_WASM_PATH,
      arg: IDL.encode(mockInit({IDL}), []),
    });

    console.log("set up orchestrator_fixture", mock_fixture.canisterId, mock_fixture.actor);

    let result = await mock_fixture.actor.setIdentity(admin);
    let result2 = await mock_fixture.actor.set_scenario(scenario);

    orchestrator_fixture = await pic.setupCanister<OrchService>({
      //targetCanisterId: Principal.fromText("q26le-iqaaa-aaaam-actsa-cai"),
      sender: admin.getPrincipal(),
      idlFactory: orchestratorIDLFactory,
      wasm: orchestrator_WASM_PATH,
      //targetSubnetId: subnets[0].id,
      arg: IDL.encode(orchestratorInit({IDL}), [[{
        icrc72OrchestratorArgs: [],
        icrc72SubscriberArgs: [],
        icrc72PublisherArgs: [],
        ttArgs: [],
      }]]),
    });

    console.log("set up orchestrator", orchestrator_fixture.canisterId);

    console.log("orch_fixture", orchestrator_fixture);

    deferredOrchestratorActor = await pic.createDeferredActor(orchestratorIDLFactory, orchestrator_fixture.canisterId)

    await orchestrator_fixture.actor.setIdentity(admin);

    //let registerBroadcaster = await orchestrator_fixture.actor.registerBroadcaster({
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

  // Orchestrator Initializes as expected
  it('should initialize successfully', async function testInitialization_Success() {
    // Arrange: Set up Orchestrator with the default scenario
    await setUpOrchestrator("defaultOrchestrator");

    // Act: Fetch the Orchestrator's state
    const state = await orchestrator_fixture.actor.get_stats();
    console.log("Orchestrator Initialize State", state);

    // Assert: Verify that the Orchestrator's state remains consistent after the wait
    expect(state).toBeDefined();
    expect(state.icrc72Publisher.icrc72OrchestratorCanister).toEqual(orchestrator_fixture.canisterId);

    // Check that initial configuration arrays are still empty
    expect(state.maxTake).toEqual(100n);
    expect(state.defaultTake).toEqual(100n);
    expect(state.publications.length).toEqual(1);
    expect(state.subscriptions.length).toEqual(0);
    expect(state.broadcasters.length).toEqual(1);
    expect(state.nextPublicationID).toEqual(1n);
    expect(state.nextSubscriptionID).toEqual(0n);
    

    // Verify that the Timer Tool (TT) is still initialized correctly
    expect(state.tt).toBeDefined();
    expect(state.tt.timers).toEqual(1n);

    // Verify the Subscriber component within the Orchestrator remains unchanged
    expect(state.icrc72Publisher).toBeDefined();
    expect(state.icrc72Publisher.icrc72OrchestratorCanister).toEqual(orchestrator_fixture.canisterId);
    expect(state.icrc72Publisher.icrc72Subscriber.broadcasters.length).toEqual(0);
    expect(state.icrc72Publisher.icrc72Subscriber.subscriptions.length).toEqual(0);
    expect(state.icrc72Publisher.icrc72Subscriber.validBroadcasters).toBeDefined();
    expect(state.icrc72Publisher.icrc72Subscriber.confirmAccumulator.length).toEqual(0);
    expect(state.icrc72Publisher.icrc72Subscriber.confirmTimer.length).toEqual(0);
    expect(state.icrc72Publisher.icrc72Subscriber.lastEventId.length).toEqual(0);
    expect(state.icrc72Publisher.icrc72Subscriber.backlogs.length).toEqual(0);
    expect(state.icrc72Publisher.icrc72Subscriber.readyForSubscription).toEqual(false);
    expect(state.icrc72Publisher.icrc72Subscriber.error.length).toBe(0);
    expect(state.icrc72Publisher.icrc72Subscriber.tt).toBeDefined();
    expect(state.icrc72Publisher.icrc72Subscriber.tt.timers).toEqual(1n);

    // Verify the Publisher component within the Orchestrator remains unchanged
    expect(state.icrc72Publisher.orchestrator).toEqual(orchestrator_fixture.canisterId);
    expect(state.icrc72Publisher.broadcasters.length).toEqual(1);
    expect(state.icrc72Publisher.publications.length).toEqual(1);
    expect(state.icrc72Publisher.eventsProcessing).toEqual(false); 
    expect(state.icrc72Publisher.pendingEvents.length).toEqual(1);
    expect(state.icrc72Publisher.previousEventIds.length).toEqual(1);
    expect(state.icrc72Publisher.drainEventId.length).toEqual(1);
    expect(state.icrc72Publisher.readyForPublications).toEqual(false);
    expect(state.icrc72Publisher.error.length).toBe(0); 
    expect(state.icrc72Publisher.tt).toBeDefined();
    expect(state.icrc72Publisher.tt.timers).toEqual(1n);
  });

  // Orchestrator Initializes as expected after a wait
  it('should initialize successfully after wait', async function testInitializationWait_Success() {
    // Arrange: Set up Orchestrator with the default scenario
    await setUpOrchestrator("defaultOrchestrator");

    // Act: Simulate waiting by advancing time and ticking the PocketIc instance
    await pic.tick(5);
    await pic.advanceTime(60_000); // Advance time by 60 seconds
    await pic.tick(5);

    // Fetch the Orchestrator's state after the wait
    const state = await orchestrator_fixture.actor.get_stats();
    console.log("Orchestrator Initialize State After Wait", state);

    // Assert: Verify that the Orchestrator's state remains consistent after the wait
    expect(state).toBeDefined();
    expect(state.icrc72Publisher.icrc72OrchestratorCanister).toEqual(orchestrator_fixture.canisterId);

    // Check that initial configuration arrays are still empty
    expect(state.maxTake).toEqual(100n);
    expect(state.defaultTake).toEqual(100n);
    expect(state.publications.length).toEqual(3);
    expect(state.subscriptions.length).toEqual(2);
    expect(state.broadcasters.length).toEqual(1);
    expect(state.nextPublicationID).toEqual(3n);
    expect(state.nextSubscriptionID).toEqual(2n);
    

    // Verify that the Timer Tool (TT) is still initialized correctly
    expect(state.tt).toBeDefined();
    expect(state.tt.timers).toEqual(0n);

    // Verify the Subscriber component within the Orchestrator remains unchanged
    expect(state.icrc72Publisher).toBeDefined();
    expect(state.icrc72Publisher.icrc72OrchestratorCanister).toEqual(orchestrator_fixture.canisterId);
    expect(state.icrc72Publisher.icrc72Subscriber.broadcasters.length).toEqual(0);
    expect(state.icrc72Publisher.icrc72Subscriber.subscriptions.length).toEqual(2);
    expect(state.icrc72Publisher.icrc72Subscriber.validBroadcasters).toBeDefined();
    expect(state.icrc72Publisher.icrc72Subscriber.confirmAccumulator.length).toEqual(0);
    expect(state.icrc72Publisher.icrc72Subscriber.confirmTimer.length).toEqual(0);
    expect(state.icrc72Publisher.icrc72Subscriber.lastEventId.length).toEqual(0);
    expect(state.icrc72Publisher.icrc72Subscriber.backlogs.length).toEqual(0);
    expect(state.icrc72Publisher.icrc72Subscriber.readyForSubscription).toEqual(true);
    console.log("state.icrc72Publisher.icrc72Subscriber.error", state.icrc72Publisher.icrc72Subscriber.error);
    expect(state.icrc72Publisher.icrc72Subscriber.error.length).toBe(0);
    expect(state.icrc72Publisher.icrc72Subscriber.tt).toBeDefined();
    expect(state.icrc72Publisher.icrc72Subscriber.tt.timers).toEqual(0n);

    // Verify the Publisher component within the Orchestrator remains unchanged
    expect(state.icrc72Publisher.orchestrator).toEqual(orchestrator_fixture.canisterId);
    expect(state.icrc72Publisher.broadcasters.length).toEqual(3);
    expect(state.icrc72Publisher.publications.length).toEqual(1);
    expect(state.icrc72Publisher.eventsProcessing).toEqual(false); 
    expect(state.icrc72Publisher.pendingEvents.length).toEqual(5);
    expect(state.icrc72Publisher.previousEventIds.length).toEqual(1);
    expect(state.icrc72Publisher.drainEventId.length).toEqual(0);
    expect(state.icrc72Publisher.readyForPublications).toEqual(false);
    expect(state.icrc72Publisher.error.length).toBe(0); 
    expect(state.icrc72Publisher.tt).toBeDefined();
    expect(state.icrc72Publisher.tt.timers).toEqual(0n);
  });

  // Publication Registration Tests
  it('should register a publication successfully', async function testRegisterPublication_Success() {
    // Setup the orchestrator with the default scenario
    await setUpOrchestrator("default");

    // Define a valid PublicationRegistration object
    const publicationRegistration: PublicationRegistration = {
      namespace: "com.example.app.events",
      config: [
        ["icrc72:publication:publishers:allowed:list", {
          "Array": [
            { "Blob": new Uint8Array(Principal.fromText(alice.getPrincipal().toText()).toUint8Array()) }
          ]
        }],
        ["icrc72:publication:mode", {
          "Text": "fifo"
        }]
      ],
      memo: []
    };

    // Call the register_publication method
    const result = await orchestrator_fixture.actor.icrc72_register_publication([publicationRegistration]);

    // Assertions to verify successful registration
    expect(result).toBeDefined();
    expect(result.length).toBe(1);
    expect(result[0]).toBeDefined();
    console.log("result", result);
    if (result[0][0] && 'Ok' in result[0][0]) {
      expect(result[0][0].Ok).toBeGreaterThan(0);
    } else {
      throw(`Expected Ok but got Err: ${JSON.stringify(result[0], dataItemStringify,2)}`);
    }

    // Optionally, verify that the publication is stored correctly
    const stats = await orchestrator_fixture.actor.get_stats();
    expect(stats).toBeDefined();
    expect(stats.publications).toEqual(
      expect.arrayContaining([
        expect.arrayContaining([
          result[0][0]?.Ok,
          expect.objectContaining({
            namespace: "com.example.app.events"
            
          }),
        ]),
      ])
    );
  });

  /* it.only('should fail to register a publication with invalid config', async function testRegisterPublication_InvalidConfig() {
    // Setup the orchestrator with the default scenario
    await setUpOrchestrator("default");

    // Define an invalid PublicationRegistration object (e.g., missing required fields)
    const invalidPublicationRegistration: PublicationRegistration = {
      namespace: "", // Invalid namespace
      config: [
        // Missing required config entries
        ["icrc72:publication:mode", {
          "Text": "invalid_mode" // Assuming only certain modes are allowed
        }]
      ],
      memo: []
    };

    // Call the register_publication method
    const result = await orchestrator_fixture.actor.icrc72_register_publication([invalidPublicationRegistration]);

    // Assertions to verify registration failure
    expect(result).toBeDefined();
    expect(result.length).toBe(1);
    expect(result[0]).toBeDefined();
    if ('Err' in result[0]) {
      expect(result[0].Err).toBeDefined();
    } else {
      throw(`Expected Err but got Ok: ${JSON.stringify(result[0], dataItemStringify,2)}`);
    }
    expect(result[0]?.Err).toEqual({
      "GenericBatchError": "Invalid configuration for publication"
    });
  }); */

  it('should prevent unauthorized callers from registering publications', async function testRegisterPublication_Unauthorized() {
    // Setup the orchestrator with the default scenario
    await setUpOrchestrator("default");
    
    await pic.tick(5);
    await pic.advanceTime(60_000); // Advance time by 60 seconds
    // Change the orchestrator identity to an unauthorized principal (e.g., Alice)
    await orchestrator_fixture.actor.setIdentity(bob);

    // Define a valid PublicationRegistration object
    const publicationRegistration: PublicationRegistration = {
      namespace: "com.example.app.events",
      config: [
        ["icrc72:publication:publishers:allowed:list", {
          "Array": [
            { "Blob": new Uint8Array(Principal.fromText(bob.getPrincipal().toText()).toUint8Array()) }
          ]}
        ],
        ["icrc72:publication:mode", {
          "Text": "fifo"
        }]
      ],
      memo: []
    };

    // Call the register_publication method
    const resultPre = await orchestrator_fixture.actor.icrc72_register_publication([publicationRegistration]);

    console.log("resultPre", resultPre);

    await pic.tick(5);
    await pic.advanceTime(60_000); // Advance time by 60 seconds

    console.log("registering same with alice");
    await orchestrator_fixture.actor.setIdentity(alice);

    // Define a valid PublicationRegistration object
    const publicationRegistration2: PublicationRegistration = {
      namespace: "com.example.app.events",
      config: [],
      memo: []
    };


    // Call the register_publication method
    const result = await orchestrator_fixture.actor.icrc72_register_publication([publicationRegistration2]);

    console.log("result", result);

    // Assertions to verify registration failure
    expect(result).toBeDefined();
    expect(result.length).toBe(1);
    expect(result[0]).toBeDefined();
    
    if (result[0] && result[0][0] && 'Err' in result[0][0]) {
      expect(result[0][0].Err).toBeDefined();
    } else {
      throw(`Expected Err but got Ok: ${JSON.stringify(result[0], dataItemStringify,2)}`);
  
    }
    expect(result[0][0]?.Err).toEqual({
      "UnauthorizedPublisher": expect.anything()
    });
  });


  it('should handle duplicate publication registrations correctly', async function testRegisterPublication_Duplicate() {
    // Setup the orchestrator with the default scenario
    await setUpOrchestrator("default");

    await pic.tick(5);
    await pic.advanceTime(60_000); // Advance time by 60 seconds

    orchestrator_fixture.actor.setIdentity(alice);

    // Define a valid PublicationRegistration object
    const publicationRegistration: PublicationRegistration = {
      namespace: "com.example.app.events",
      config: [
        ["icrc72:publication:publishers:allowed:list", {
          "Array": [
            { "Blob": new Uint8Array(Principal.fromText(alice.getPrincipal().toText()).toUint8Array()) }
          ]
        }],
        ["icrc72:publication:mode", {
          "Text": "fifo"
        }]
      ],
      memo: []
    };

    // Call the register_publication method for the first time
    const firstResult = await orchestrator_fixture.actor.icrc72_register_publication([publicationRegistration]);


    // Assertions for the first registration
     expect(firstResult).toBeDefined();
    expect(firstResult.length).toBe(1);
    expect(firstResult[0]).toBeDefined();
    console.log("result", firstResult);
    if (firstResult[0][0] && 'Ok' in firstResult[0][0]) {
      expect(firstResult[0][0].Ok).toBeGreaterThan(0);
    } else {
      throw(`Expected Ok but got Err: ${JSON.stringify(firstResult[0], dataItemStringify,2)}`);
    }

    await pic.tick(5);
    await pic.advanceTime(60_000); // Advance time by 60 seconds
    
    // Call the register_publication method for the duplicate registration
    const duplicateResult = await orchestrator_fixture.actor.icrc72_register_publication([publicationRegistration]);

    console.log("duplicateResult", JSON.stringify(duplicateResult, dataItemStringify,2));

    // Assertions to verify duplicate registration handling
    expect(duplicateResult).toBeDefined();
    expect(duplicateResult.length).toBe(1);
    expect(duplicateResult[0]).toBeDefined();
    console.log("duplicateResult", duplicateResult);
    if (duplicateResult[0][0] && 'Ok' in duplicateResult[0][0]) {
      expect(duplicateResult[0][0].Ok).toBeGreaterThan(0);
    } else {
      throw(`Expected Ok but got Err: ${JSON.stringify(duplicateResult[0], dataItemStringify,2)}`);
    }
  });

  // Multiple Publication Registrations
  it('should register multiple publications successfully', async function testRegisterMultiplePublications_Success() {
    // Setup the orchestrator with the default scenario
    await setUpOrchestrator("default");

    // Define multiple PublicationRegistration objects
    const publicationRegistrations: PublicationRegistration[] = [
      {
        namespace: "com.example.app.events",
        config: [
          ["icrc72:publication:publishers:allowed:list", {
            "Array": [
              { "Blob": new Uint8Array(Principal.fromText(alice.getPrincipal().toText()).toUint8Array()) }
            ]
          }],
          ["icrc72:publication:mode", {
            "Text": "fifo"
          }]
        ],
        memo: []
      },
      {
        namespace: "com.example.app.logs",
        config: [
          ["icrc72:publication:publishers:allowed:list", {
            "Array": [
              { "Blob": new Uint8Array(Principal.fromText(bob.getPrincipal().toText()).toUint8Array()) }
            ]
          }],
          ["icrc72:publication:mode", {
            "Text": "priority"
          }]
        ],
        memo: []
      }
    ];

    // Call the register_publication method with multiple registrations
    const results = await orchestrator_fixture.actor.icrc72_register_publication(publicationRegistrations);

    console.log("results", results);

    // Assertions to verify all registrations are successful
    expect(results).toBeDefined();
    expect(results.length).toBe(2);

    // Check each publication registration result
    results.forEach((result, index) => {
      expect(result).toBeDefined();
      if (result[0] && 'Ok' in result[0]) {
        expect(result[0].Ok).toBeGreaterThan(0);
      } else {
        throw(`Expected Ok but got Err: ${JSON.stringify(result)}`);
      }
    });

    // Optionally, verify that both publications are stored correctly
    const stats = await orchestrator_fixture.actor.get_stats();
    expect(stats).toBeDefined();
    expect(stats.publications.length).toBeGreaterThanOrEqual(2);
    expect(stats.publications).toEqual(
      expect.arrayContaining([
        expect.arrayContaining([
          expect.anything(),
          expect.objectContaining({
            namespace: "com.example.app.events"
            
          }),
        ]),
      ])
    );
    expect(stats.publications).toEqual(
      expect.arrayContaining([
        expect.arrayContaining([
          expect.anything(),
          expect.objectContaining({
            namespace: "com.example.app.logs"
            
          }),
        ]),
      ])
    );
    
  });

  it.only('should handle duplicate entries when registering multiple publications', async function testRegisterMultiplePublications_WithDuplicates() {
    // Setup the orchestrator with the default scenario
    await setUpOrchestrator("default");

    orchestrator_fixture.actor.setIdentity(alice);

    // Define multiple PublicationRegistration objects with duplicates
    const publicationRegistrations: PublicationRegistration[] = [
      {
        namespace: "com.example.app.events",
        config: [
          ["icrc72:publication:publishers:allowed:list", {
            "Array": [
              { "Blob": new Uint8Array(Principal.fromText(alice.getPrincipal().toText()).toUint8Array()) }
            ]
          }],
          ["icrc72:publication:mode", {
            "Text": "fifo"
          }]
        ],
        memo: []
      },
      {
        namespace: "com.example.app.events", // Duplicate namespace
        config: [
          ["icrc72:publication:publishers:allowed:list", {
            "Array": [
              { "Blob": new Uint8Array(Principal.fromText(bob.getPrincipal().toText()).toUint8Array()) }
            ]
          }
          ],
          ["icrc72:publication:mode", {
            "Text": "priority"
          }]
    ],
        memo: []
      },
      {
        namespace: "com.example.app.logs",
        config: [
          ["icrc72:publication:publishers:allowed:list",{
            "Array": [
              { "Blob": new Uint8Array(mock_fixture.canisterId.toUint8Array()) }
            ]
          }],
          ["icrc72:publication:mode", {
            "Text": "fifo"
          }]
        ],
        memo: []
      }
    ];

    // Call the register_publication method with duplicate entries
    const results = await orchestrator_fixture.actor.icrc72_register_publication(publicationRegistrations);

    console.log("results", JSON.stringify(results, dataItemStringify,2));

    // Assertions to verify how duplicates are handled
    expect(results).toBeDefined();
    expect(results.length).toBe(3);

    // First registration should be successful

    expect(results[0]).toBeDefined();
    expect(results[0].length).toBe(1);
    expect(results[0][0]).toBeDefined();
    console.log("result", results[0]);
    if (results[0][0] && 'Ok' in results[0][0]) {
      expect(results[0][0].Ok).toBeGreaterThan(0);
    } else {
      throw(`Expected Ok but got Err 0: ${JSON.stringify(results[0], dataItemStringify,2)}`);
    }

    expect(results[1]).toBeDefined();
    expect(results[1].length).toBe(1);
    expect(results[1][0]).toBeDefined();
    console.log("result", results[0]);
    if (results[1][0] && 'Ok' in results[1][0]) {
      expect(results[1][0].Ok).toEqual(results[0][0].Ok);
    } else {
      throw(`Expected Ok but got Err 1: ${JSON.stringify(results[0], dataItemStringify,2)}`);
    }

    expect(results[2]).toBeDefined();
    expect(results[2].length).toBe(1);
    expect(results[2][0]).toBeDefined();
    console.log("result", results[0]);
    if (results[2][0] && 'Ok' in results[2][0]) {
      expect(results[2][0].Ok).toBeGreaterThan(1n);
    } else {
      throw(`Expected Ok but got Err 2: ${JSON.stringify(results[0], dataItemStringify,2)}`);
    }

    // Optionally, verify that only unique publications are stored
    const stats = await orchestrator_fixture.actor.get_stats();

    expect(stats).toBeDefined();
    console.log("stats", JSON.stringify(stats.publications, dataItemStringify,2));
    expect(stats.publications.length).toBeGreaterThanOrEqual(2);
    expect(stats.publications).toEqual(
      expect.arrayContaining([
        expect.arrayContaining([
          expect.anything(),
          expect.objectContaining({
            namespace: "com.example.app.events"
            
          }),
        ]),
      ])
    );
    expect(stats.publications).toEqual(
      expect.arrayContaining([
        expect.arrayContaining([
          expect.anything(),
          expect.objectContaining({
            namespace: "com.example.app.logs"
            
          }),
        ]),
      ])
    );
  });

  // Publication Update Tests
  it('should update a publication successfully', async function testUpdatePublication_Success() {
    // todo: code pending.
  });

  it('should not update a publication with invalid data', async function testUpdatePublication_InvalidUpdate() {
    // todo: code pending.
  });

  it('should prevent unauthorized callers from updating publications', async function testUpdatePublication_Unauthorized() {
    // todo: code pending.
  });

  it('should handle updates to non-existing publications gracefully', async function testUpdatePublication_NotFound() {
    // todo: code pending.
  });

  // Publication Deletion Tests
  it('should delete a publication successfully', async function testDeletePublication_Success() {
    // todo: code pending.
  });

  it('should prevent unauthorized callers from deleting publications', async function testDeletePublication_Unauthorized() {
    // todo: code pending.
  });

  it('should handle deletion of non-existing publications gracefully', async function testDeletePublication_NotFound() {
    // todo: code pending.
  });

  // Subscription Registration Tests
  it('should register a subscription successfully', async function testRegisterSubscription_Success() {
    // todo: code pending.
  });

  it('should fail to register a subscription with invalid config', async function testRegisterSubscription_InvalidConfig() {
    // todo: code pending.
  });

  it('should prevent unauthorized callers from registering subscriptions', async function testRegisterSubscription_Unauthorized() {
    // todo: code pending.
  });

  it('should handle duplicate subscription registrations correctly', async function testRegisterSubscription_Duplicate() {
    // todo: code pending.
  });

  // Multiple Subscription Registrations
  it('should register multiple subscriptions successfully', async function testRegisterMultipleSubscriptions_Success() {
    // todo: code pending.
  });

  it('should handle duplicate entries when registering multiple subscriptions', async function testRegisterMultipleSubscriptions_WithDuplicates() {
    // todo: code pending.
  });

  // Subscription Update Tests
  it('should update a subscription successfully', async function testUpdateSubscription_Success() {
    // todo: code pending.
  });

  it('should not update a subscription with invalid data', async function testUpdateSubscription_InvalidUpdate() {
    // todo: code pending.
  });

  it('should prevent unauthorized callers from updating subscriptions', async function testUpdateSubscription_Unauthorized() {
    // todo: code pending.
  });

  it('should handle updates to non-existing subscriptions gracefully', async function testUpdateSubscription_NotFound() {
    // todo: code pending.
  });

  // Subscription Deletion Tests
  it('should delete a subscription successfully', async function testDeleteSubscription_Success() {
    // todo: code pending.
  });

  it('should prevent unauthorized callers from deleting subscriptions', async function testDeleteSubscription_Unauthorized() {
    // todo: code pending.
  });

  it('should handle deletion of non-existing subscriptions gracefully', async function testDeleteSubscription_NotFound() {
    // todo: code pending.
  });

  // Broadcaster Retrieval Tests
  it('should retrieve a list of valid broadcasters', async function testGetValidBroadcasters_Success() {
    // todo: code pending.
  });

  it('should retrieve ICRC75-based broadcasters when applicable', async function testGetValidBroadcasters_WithICRC75() {
    // todo: code pending.
  });

  // Publisher Retrieval Tests
  it('should retrieve a list of publishers without filters', async function testGetPublishers_Success() {
    // todo: code pending.
  });

  it('should handle retrieval of publishers when no publishers exist', async function testGetPublishers_EmptyList() {
    // todo: code pending.
  });

  it('should retrieve publishers with specific filters', async function testGetPublishers_WithFilters() {
    // todo: code pending.
  });

  it('should handle pagination when retrieving publishers', async function testGetPublishers_Pagination() {
    // todo: code pending.
  });

  // Publication Retrieval Tests
  it('should retrieve a list of publications without filters', async function testGetPublications_Success() {
    // todo: code pending.
  });

  it('should handle retrieval of publications when no publications exist', async function testGetPublications_EmptyList() {
    // todo: code pending.
  });

  it('should retrieve publications with specific filters', async function testGetPublications_WithFilters() {
    // todo: code pending.
  });

  it('should handle pagination when retrieving publications', async function testGetPublications_Pagination() {
    // todo: code pending.
  });

  // Subscriber Retrieval Tests
  it('should retrieve a list of subscribers without filters', async function testGetSubscribers_Success() {
    // todo: code pending.
  });

  it('should handle retrieval of subscribers when no subscribers exist', async function testGetSubscribers_EmptyList() {
    // todo: code pending.
  });

  it('should retrieve subscribers with specific filters', async function testGetSubscribers_WithFilters() {
    // todo: code pending.
  });

  it('should handle pagination when retrieving subscribers', async function testGetSubscribers_Pagination() {
    // todo: code pending.
  });

  // Subscription Retrieval Tests
  it('should retrieve a list of subscriptions without filters', async function testGetSubscriptions_Success() {
    // todo: code pending.
  });

  it('should handle retrieval of subscriptions when no subscriptions exist', async function testGetSubscriptions_EmptyList() {
    // todo: code pending.
  });

  it('should retrieve subscriptions with specific filters', async function testGetSubscriptions_WithFilters() {
    // todo: code pending.
  });

  it('should handle pagination when retrieving subscriptions', async function testGetSubscriptions_Pagination() {
    // todo: code pending.
  });

  // Broadcaster Retrieval Tests
  it('should retrieve a list of broadcasters without filters', async function testGetBroadcasters_Success() {
    // todo: code pending.
  });

  it('should handle retrieval of broadcasters when no broadcasters exist', async function testGetBroadcasters_EmptyList() {
    // todo: code pending.
  });

  it('should retrieve broadcasters with specific filters', async function testGetBroadcasters_WithFilters() {
    // todo: code pending.
  });

  it('should handle pagination when retrieving broadcasters', async function testGetBroadcasters_Pagination() {
    // todo: code pending.
  });

  // Notification Confirmation Tests
  it('should confirm notifications successfully', async function testConfirmNotifications_Success() {
    // todo: code pending.
  });

  it('should handle partial failures when confirming notifications', async function testConfirmNotifications_PartialFailures() {
    // todo: code pending.
  });

  it('should handle complete failures when confirming notifications', async function testConfirmNotifications_AllFailures() {
    // todo: code pending.
  });

  // Publisher Error Handling Tests
  it('should handle publisher errors appropriately', async function testHandlePublisherError_Success() {
    // todo: code pending.
  });

  it('should handle unexpected publisher errors gracefully', async function testHandlePublisherError_InvalidError() {
    // todo: code pending.
  });

  // Relay Broadcaster Management Tests
  it('should add a relay broadcaster successfully', async function testHandleRelay_Add_Success() {
    // todo: code pending.
  });

  it('should handle adding duplicate relay broadcasters', async function testHandleRelay_Add_Duplicate() {
    // todo: code pending.
  });

  it('should remove a relay broadcaster successfully', async function testHandleRelay_Remove_Success() {
    // todo: code pending.
  });

  it('should handle removing non-existing relay broadcasters gracefully', async function testHandleRelay_Remove_NotExist() {
    // todo: code pending.
  });

  // Transaction Deduplication Test
  it('should prevent event duplication', async function testTransactionDeduplication() {
    // todo: code pending.
  });

  // Event Ordering Test
  it('should maintain correct event ordering', async function testEventOrdering() {
    // todo: code pending.
  });

  // Dynamic Orchestration Updates Test
  it('should update orchestration parameters dynamically', async function testDynamicOrchestrationUpdates() {
    // todo: code pending.
  });

  // State Persistence Test
  it('should persist orchestrator state across upgrades', async function testOrchestratorStatePersistence() {
    // todo: code pending.
  });

  // Internal Error Handling Test
  it('should handle internal orchestrator errors gracefully', async function testOrchestratorErrorHandling() {
    // todo: code pending.
  });

  // Security Authorization Checks Test
  it('should enforce security authorization checks consistently', async function testSecurityAuthorizationChecks() {
    // todo: code pending.
  });

  // Subscription Activation Test
  it('should correctly activate subscriptions', async function testSubscriptionActivation() {
    // todo: code pending.
  });

  // Subscription Deactivation Test
  it('should correctly deactivate subscriptions', async function testSubscriptionDeactivation() {
    // todo: code pending.
  });

  
});