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
  PublicationUpdateRequest,
  _SERVICE as OrchService,
  PublicationDeleteRequest,
  PublicationRegisterResult,
  
  SubscriptionRegistration} from "../../src/declarations/orchestrator/orchestrator.did.d";
export const orch_WASM_PATH = ".dfx/local/canisters/orchestrator/orchestrator.wasm.gz"; 

import {idlFactory as mockIDLFactory,
  init as mockInit } from "../../src/declarations/orchestratorMock/orchestratorMock.did.js";
import type {
  _SERVICE as MockService,} from "../../src/declarations/orchestratorMock/orchestratorMock.did.d";
import { get } from "http";
import { ICRC16Map, EventNotification, PublicationRegistration } from "../../src/declarations/orchestrator/orchestrator.did.js";
import * as exp from "constants";
import { register } from "module";
import { SubscriptionUpdateRequest } from "../../src/declarations/example/example.did.js";
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

async function registerPublication(identity: Identity): Promise<PublicationRegisterResult[]> {
  let pubResult = await orchestrator_fixture.actor.icrc72_register_publication([
    {
      namespace: "com.example.app.events",
      config: [
        ["icrc72:publication:publishers:allowed:list", {
          "Array": [
            { "Blob": new Uint8Array(Principal.fromText(identity.getPrincipal().toText()).toUint8Array()) }
          ]
        }],
        ["icrc72:publication:mode", {
          "Text": "fifo"
        }]
      ],
      memo: []
    }]);
  return pubResult;
};

describe("test orchestrator publications", () => {


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

    

    await pic.tick(5);
    await pic.advanceTime(60_000); // Advance time by 60 seconds

    await orchestrator_fixture.actor.file_subnet_canister(orchestrator_fixture.canisterId, mock_fixture.canisterId);
    await orchestrator_fixture.actor.file_subnet_broadcaster(mock_fixture.canisterId);

    await orchestrator_fixture.actor.initialize();

    await pic.tick(5);
    await pic.advanceTime(60_000);
    await pic.tick(5);


    await mock_fixture.actor.simulateBroadcasterReady(orchestrator_fixture.canisterId);

    await pic.tick(5);
    await pic.advanceTime(60_000); // Advance time by 60 seconds  
    await pic.tick(5);


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
    expect(state.publications.length).toEqual(3);
    expect(state.subscriptions.length).toEqual(2);
    expect(state.broadcasters.length).toEqual(1);
    expect(state.nextPublicationID).toBeGreaterThan(0n);
    expect(state.nextSubscriptionID).toBeGreaterThan(0n);
    

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
    expect(state.icrc72Publisher.icrc72Subscriber.error.length).toBe(0);
    expect(state.icrc72Publisher.icrc72Subscriber.tt).toBeDefined();
    expect(state.icrc72Publisher.icrc72Subscriber.tt.timers).toEqual(0n);

    // Verify the Publisher component within the Orchestrator remains unchanged
    expect(state.icrc72Publisher.orchestrator).toEqual(orchestrator_fixture.canisterId);
    expect(state.icrc72Publisher.broadcasters.length).toEqual(3);
    expect(state.icrc72Publisher.publications.length).toEqual(1);
    expect(state.icrc72Publisher.eventsProcessing).toEqual(false); 
    expect(state.icrc72Publisher.pendingEvents.length).toEqual(1);
    expect(state.icrc72Publisher.previousEventIds.length).toEqual(1);
    expect(state.icrc72Publisher.drainEventId.length).toEqual(0);
    expect(state.icrc72Publisher.readyForPublications).toEqual(false);
    expect(state.icrc72Publisher.error.length).toBe(0); 
    expect(state.icrc72Publisher.tt).toBeDefined();
    expect(state.icrc72Publisher.tt.timers).toEqual(0n);
  });

  // Orchestrator Initializes as expected after a wait
  it('should initialize successfully after wait', async function testInitializationWait_Success() {
    // Arrange: Set up Orchestrator with the default scenario
    await setUpOrchestrator("defaultOrchestrator");


    await orchestrator_fixture.actor.file_subnet_canister(orchestrator_fixture.canisterId, mock_fixture.canisterId);
    await orchestrator_fixture.actor.file_subnet_canister(orchestrator_fixture.canisterId, orchestrator_fixture.canisterId);
    await orchestrator_fixture.actor.file_subnet_broadcaster(mock_fixture.canisterId);

    await pic.tick(5);
    await pic.advanceTime(60_000);
    await pic.tick(5)


    await mock_fixture.actor.simulateBroadcasterReady(orchestrator_fixture.canisterId);

    // Act: Simulate waiting by advancing time and ticking the PocketIc instance
    await pic.tick(5);
    await pic.advanceTime(60_000); // Advance time by 60 seconds
    await pic.tick(5);

    // Fetch the Orchestrator's state after the wait
    const state = await orchestrator_fixture.actor.get_stats();
    console.log("Orchestrator Initialize State After Wait", JSON.stringify(state, dataItemStringify, 2));

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
    expect(state.icrc72Publisher.pendingEvents.length).toEqual(1);
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

    await pic.tick(5);
    await pic.advanceTime(60_000); // Advance time by 60 seconds
    await pic.tick(5);

    await orchestrator_fixture.actor.setIdentity(alice);
    // Call the register_publication method
    const result = await registerPublication(alice);

    // Assertions to verify successful registration
    expect(result).toBeDefined();
    expect(result.length).toBe(1);
    expect(result[0]).toBeDefined();
    console.log("result", result);
    if (result[0][0] && 'Ok' in result[0][0]) {
      expect(result[0][0].Ok).toBeGreaterThan(0n);
    } else {
      throw(`Expected Ok but got Err: ${JSON.stringify(result[0], dataItemStringify,2)}`);
    }

    await pic.tick(5);
    await pic.advanceTime(60_000); // Advance time by 60 seconds
    await pic.tick(5);


    // Optionally, verify that the publication is stored correctly
    const stats = await orchestrator_fixture.actor.get_stats();

    console.log("statsPost", JSON.stringify(stats, dataItemStringify, 2));
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

    //does create pending event
    expect(stats.icrc72Publisher.pendingEvents).toBeDefined();
    expect(stats.icrc72Publisher.pendingEvents.length).toBeGreaterThan(0);
    console.log("pendingEvents", JSON.stringify(stats.icrc72Publisher.pendingEvents, dataItemStringify, 2));
    expect(stats.icrc72Publisher.pendingEvents[0]).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          Map: expect.arrayContaining([
            expect.arrayContaining([
              "icrc72:broadcaster:publisher:add",
              expect.anything(),
            ]),
          ]),
        }),
        namespace: "icrc72:broadcaster:sys:" + mock_fixture.canisterId.toText(),
      })
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

    

    // Call the register_publication method
    const resultPre = await registerPublication(bob);

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

    
    
    orchestrator_fixture.actor.setIdentity(alice);

    

    // Call the register_publication method for the first time
    const firstResult = await registerPublication(alice);


    // Assertions for the first registration
     expect(firstResult).toBeDefined();
    expect(firstResult.length).toBe(1);
    expect(firstResult[0]).toBeDefined();
    console.log("result", firstResult);
    if (firstResult[0][0] && 'Ok' in firstResult[0][0]) {
      expect(firstResult[0][0].Ok).toBeGreaterThan(0n);
    } else {
      throw(`Expected Ok but got Err: ${JSON.stringify(firstResult[0], dataItemStringify,2)}`);
    }

    await pic.tick(5);
    await pic.advanceTime(60_000); // Advance time by 60 seconds
    
    // Call the register_publication method for the duplicate registration
    const duplicateResult = await registerPublication(alice);

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

   
    await pic.tick(5);
    await pic.advanceTime(60_000); // Advance time by 60 seconds  
    await pic.tick(5);

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
    var foundItem = 0n
    results.forEach((result, index) => {
      expect(result).toBeDefined();
      if (result[0] && 'Ok' in result[0]) {
        expect(result[0].Ok).toBeGreaterThan(2n);
        if(foundItem == 0n){
          foundItem = result[0].Ok;
        }else {
          expect(result[0].Ok).toBeGreaterThan(foundItem);
        }
        
      } else {
        throw(`Expected Ok but got Err: ${JSON.stringify(result)}`);
      }
    });

    expect(results[0][0] && 'Ok' in results[0][0] && results[0][0].Ok).not.toEqual(results[1][0] && 'Ok' in results[1][0] && results[1][0].Ok);

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

  it('should handle duplicate entries when registering multiple publications', async function testRegisterMultiplePublications_WithDuplicates() {
    // Setup the orchestrator with the default scenario
    await setUpOrchestrator("default");

   
    await pic.tick(5);
    await pic.advanceTime(60_000); // Advance time by 60 seconds  
    await pic.tick(5);

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
              { "Blob": new Uint8Array(Principal.fromText(alice.getPrincipal().toText()).toUint8Array()) }
            ]
          }
          ],
          ["icrc72:publication:mode", {
            "Text": "fifo"
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
      expect(results[0][0].Ok).toEqual(3n);
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
      expect(results[2][0].Ok).toBeGreaterThan(3n);
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
    // Arrange: Set up Orchestrator with the default scenario and register a publication
    await setUpOrchestrator("defaultOrchestrator");

    await pic.tick(5);
    await pic.advanceTime(60_000); // Advance time by 60 seconds

    orchestrator_fixture.actor.setIdentity(alice);

    

    // Register the publication and retrieve the publication ID
    const registerResult = await registerPublication(alice);
    expect(registerResult.length).toBe(1);
    expect(registerResult[0]).toBeDefined();
    if (registerResult[0][0] && 'Ok' in registerResult[0][0]) {
      expect(registerResult[0][0].Ok).toBeGreaterThan(0n);
    } else {
      throw new Error(`Expected Ok but got Err: ${JSON.stringify(registerResult[0][0])}`);
    }

    const publicationId = registerResult[0][0]?.Ok;

    // add a controller
    // Define the PublicationUpdateRequest to update the publication mode
    let publicationUpdate: PublicationUpdateRequest = {
      publication: { publicationId },
      config: ["icrc72:publication:controllers:list:add", {
          "Blob": bob.getPrincipal().toUint8Array()
        }]
      ,
      memo: []
    };

    // Act: Perform the publication update
    let updateResult = await orchestrator_fixture.actor.icrc72_update_publication([publicationUpdate]);

    console.log("updateResult", updateResult);

    // Assert: Verify the update was successful
    expect(updateResult.length).toBe(1);
    expect(updateResult[0]).toBeDefined();
    if (updateResult[0][0] && 'Ok' in updateResult[0][0]) {
      expect(updateResult[0][0].Ok).toBe(true);
    } else {
      throw new Error(`Expected Ok but got Err: ${JSON.stringify(updateResult[0][0], dataItemStringify, 2)}`);
    }

    // Fetch the Orchestrator's state and verify the update
    let state = await orchestrator_fixture.actor.get_stats();
    let foundPub = state.publications.find((pub) => pub[0] === publicationId);

    expect(foundPub).toBeDefined();
    expect(foundPub).toBeDefined();
    if (foundPub) {
      expect(foundPub[1].controllers.length).toEqual(2);
    }

    //remove a controller
    publicationUpdate = {
      publication: { publicationId },
      config: ["icrc72:publication:controllers:list:remove", {
          "Blob": bob.getPrincipal().toUint8Array()
        }]
      ,
      memo: []
    };

    updateResult = await orchestrator_fixture.actor.icrc72_update_publication([publicationUpdate]);

    console.log("updateResult", updateResult);

    // Assert: Verify the update was successful
    expect(updateResult.length).toBe(1);
    expect(updateResult[0]).toBeDefined();
    if (updateResult[
      0][0] && 'Ok' in updateResult[0][0]) {
      expect(updateResult[0][0].Ok).toBe(true);
    } else {
      throw new Error(`Expected Ok but got Err: ${JSON.stringify(updateResult[0][0], dataItemStringify, 2)}`);
    };

    // Fetch the Orchestrator's state and verify the update
    state = await orchestrator_fixture.actor.get_stats();
    foundPub = state.publications.find((pub) => pub[0] === publicationId);

    expect(foundPub).toBeDefined();
    expect(foundPub).toBeDefined();
    if (foundPub) {
      expect(foundPub[1].controllers.length).toEqual(1);
    };

    //add a publisher
    publicationUpdate = {
      publication: { publicationId },
      config: ["icrc72:publication:publishers:allowed:list:add", {
          "Blob": admin.getPrincipal().toUint8Array()
        }]
      ,
      memo: []
    };

    updateResult = await orchestrator_fixture.actor.icrc72_update_publication([publicationUpdate]);

    console.log("updateResult", updateResult);

    // Assert: Verify the update was successful
    expect(updateResult.length).toBe(1);
    expect(updateResult[0]).toBeDefined();
    if (updateResult[
      0][0] && 'Ok' in updateResult[0][0]) {
      expect(updateResult[0][0].Ok).toBe(true);
    } else {
      throw new Error(`Expected Ok but got Err: ${JSON.stringify(updateResult[0][0], dataItemStringify, 2)}`);
    };

    // Fetch the Orchestrator's state and verify the update
    state = await orchestrator_fixture.actor.get_stats();
    foundPub = state.publications.find((pub) => pub[0] === publicationId);

    expect(foundPub).toBeDefined();
    expect(foundPub).toBeDefined();
    if (foundPub) {
      console.log("foundPub", JSON.stringify(foundPub,dataItemStringify,2));
      expect(foundPub[1].allowedPublishers[0] && 'allowed' in foundPub[1].allowedPublishers[0] && foundPub[1].allowedPublishers[0].allowed.length).toEqual(2);
      
    };

    //remove a publisher
    publicationUpdate = {
      publication: { publicationId },
      config: ["icrc72:publication:publishers:allowed:list:remove", {
          "Blob": admin.getPrincipal().toUint8Array()
        }]
      ,
      memo: []
    };

    updateResult = await orchestrator_fixture.actor.icrc72_update_publication([publicationUpdate]);

    console.log("updateResult", updateResult);

    // Assert: Verify the update was successful
    expect(updateResult.length).toBe(1);
    expect(updateResult[0]).toBeDefined();
    if (updateResult[
      0][0] && 'Ok' in updateResult[0][0]) {
      expect(updateResult[0][0].Ok).toBe(true);
    } else {
      throw new Error(`Expected Ok but got Err: ${JSON.stringify(updateResult[0][0], dataItemStringify, 2)}`);
    };

    // Fetch the Orchestrator's state and verify the update
    state = await orchestrator_fixture.actor.get_stats();
    foundPub = state.publications.find((pub) => pub[0] === publicationId);

    expect(foundPub).toBeDefined();
    expect(foundPub).toBeDefined();
    if (foundPub) {
      expect(foundPub[1].allowedPublishers[0] && 'allowed' in foundPub[1].allowedPublishers[0] && foundPub[1].allowedPublishers[0].allowed.length).toEqual(1);
    };

    //add a subscriber
    publicationUpdate = {
      publication: { publicationId },
      config: ["icrc72:publication:subscribers:allowed:list:add", {
          "Blob": admin.getPrincipal().toUint8Array()
        }]
      ,
      memo: []
    };

    updateResult = await orchestrator_fixture.actor.icrc72_update_publication([publicationUpdate]);

    console.log("updateResult", updateResult);

    // Assert: Verify the update was successful
    expect(updateResult.length).toBe(1);
    expect(updateResult[0]).toBeDefined();
    if (updateResult[
      0][0] && 'Ok' in updateResult[0][0]) {
      expect(updateResult[0][0].Ok).toBe(true);
    } else {
      throw new Error(`Expected Ok but got Err: ${JSON.stringify(updateResult[0][0], dataItemStringify, 2)}`);
    };

    // Fetch the Orchestrator's state and verify the update
    state = await orchestrator_fixture.actor.get_stats();
    foundPub = state.publications.find((pub) => pub[0] === publicationId);

    expect(foundPub).toBeDefined();
    expect(foundPub).toBeDefined();
    if (foundPub) {
      console.log("foundPub", JSON.stringify(foundPub,dataItemStringify,2));
      expect(foundPub[1].allowedSubscribers[0] && 'allowed' in foundPub[1].allowedSubscribers[0] && foundPub[1].allowedSubscribers[0].allowed.length).toEqual(1);
      
    };

    //remove a subscriber
    publicationUpdate = {
      publication: { publicationId },
      config: ["icrc72:publication:subscribers:allowed:list:remove", {
          "Blob": admin.getPrincipal().toUint8Array()
        }]
      ,
      memo: []
    };

    updateResult = await orchestrator_fixture.actor.icrc72_update_publication([publicationUpdate]);

    console.log("updateResult", updateResult);

    // Assert: Verify the update was successful
    expect(updateResult.length).toBe(1);
    expect(updateResult[0]).toBeDefined();
    if (updateResult[
      0][0] && 'Ok' in updateResult[0][0]) {
      expect(updateResult[0][0].Ok).toBe(true);
    } else {
      throw new Error(`Expected Ok but got Err: ${JSON.stringify(updateResult[0][0], dataItemStringify, 2)}`);
    };

    // Fetch the Orchestrator's state and verify the update
    state = await orchestrator_fixture.actor.get_stats();
    foundPub = state.publications.find((pub) => pub[0] === publicationId);

    expect(foundPub).toBeDefined();
    expect(foundPub).toBeDefined();
    if (foundPub) {
      console.log("foundPub", JSON.stringify(foundPub,dataItemStringify,2));
      expect(foundPub[1].allowedSubscribers[0] && 'allowed' in foundPub[1].allowedSubscribers[0] && foundPub[1].allowedSubscribers[0].allowed.length).toEqual(0);
      
    };


  });

  it('should not update a publication with invalid data', async function testUpdatePublication_InvalidUpdate() {
    // Arrange: Set up Orchestrator with the default scenario and register a publication
    await setUpOrchestrator("defaultOrchestrator");

    await pic.tick(5);
    await pic.advanceTime(60_000); // Advance time by 60 seconds

    
    // Register the publication and retrieve the publication ID
    const registerResult = await registerPublication(alice);
    expect(registerResult.length).toBe(1);
    expect(registerResult[0]).toBeDefined();
    if (registerResult[0][0] && 'Ok' in registerResult[0][0]) {
      expect(registerResult[0][0].Ok).toBeGreaterThan(0n);
    } else {
      throw new Error(`Expected Ok but got Err: ${JSON.stringify(registerResult[0][0])}`);
    }

    const publicationId = registerResult[0][0]?.Ok;

    // Define the PublicationUpdateRequest to update the publication mode
    const publicationUpdate: PublicationUpdateRequest = {
      publication: { publicationId },
      config: ["icrc72:publication:unsupported-key", {
          "Text": "invalid"
        }]
      ,
      memo: []
    };

    // Act: Perform the publication update
    const updateResult = await orchestrator_fixture.actor.icrc72_update_publication([publicationUpdate]);

    // Assert: Verify the update was successful
    expect(updateResult.length).toBe(1);
    expect(updateResult[0]).toBeDefined();
    if (updateResult[0][0] && 'Err' in updateResult[0][0]) {
      expect(updateResult[0][0].Err).toBeDefined();
    } else {
      throw new Error(`Expected Err but got Ok: ${JSON.stringify(updateResult[0][0], dataItemStringify, 2)}`);
    }

  });

  it('should prevent unauthorized callers from updating publications', async function testUpdatePublication_Unauthorized() {
    await setUpOrchestrator("defaultOrchestrator");

    await pic.tick(5);
    await pic.advanceTime(60_000); // Advance time by 60 seconds

    // Register as admin and publish a publication
    let result = await mock_fixture.actor.setIdentity(admin);
    
    const publicationRegistration: PublicationRegistration = {
      namespace: "com.example.app.events",
      config: [
        ["icrc72:publication:publishers:allowed:list", {
          "Array": [
            { "Blob": new Uint8Array(Principal.fromText(admin.getPrincipal().toText()).toUint8Array()) }
          ]
        }],
        ["icrc72:publication:mode", {
          "Text": "fifo"
        }],
        ["icrc72:publication:controllers", {
          "Blob": bob.getPrincipal().toUint8Array()
        }],

      ],
      memo: []
    };

    const registerResult = await orchestrator_fixture.actor.icrc72_register_publication([publicationRegistration]);
    expect(registerResult.length).toBe(1);
    expect(registerResult[0]).toBeDefined();
    if (registerResult[0][0] && 'Ok' in registerResult[0][0]) {
      expect(registerResult[0][0].Ok).toBeGreaterThan(0n);
    } else {
      throw new Error(`Expected Ok but got Err: ${JSON.stringify(registerResult[0][0])}`);
    }

    const publicationId = registerResult[0][0]?.Ok;

    // Change identity to unauthorized user (alice)
    await orchestrator_fixture.actor.setIdentity(alice);

    // Define a valid PublicationUpdateRequest targeting the publication
    const publicationUpdate: PublicationUpdateRequest = {
      publication: { publicationId },
      config: 
        ["icrc72:publication:publishers:allowed:list:add", {
          "Blob": admin.getPrincipal().toUint8Array()
        }]
      ,
      memo: []
    };

    // Act: Attempt to perform the publication update as unauthorized caller
    const updateResult = await orchestrator_fixture.actor.icrc72_update_publication([publicationUpdate]);

    // Assert: Verify that the update failed with Unauthorized error
    expect(updateResult.length).toBe(1);
    expect(updateResult[0]).toBeDefined();
    if (updateResult[0][0] && 'Err' in updateResult[0][0]) {
      expect(updateResult[0][0].Err).toBeDefined();
      expect(updateResult[0][0].Err).toEqual({
        "Unauthorized": null
      });
    } else {
      throw new Error(`Expected Err but got Ok: ${JSON.stringify(updateResult[0], null, 2)}`);
    }
  });

  it('should handle updates to non-existing publications gracefully', async function testUpdatePublication_NotFound() {
    // Arrange: Set up Orchestrator with the default scenario
  await setUpOrchestrator("defaultOrchestrator");

  // Define a non-existing PublicationIdentifier
  const nonExistingPublicationId = 9999n;

  const publicationUpdate: PublicationUpdateRequest = {
    publication: { publicationId: nonExistingPublicationId },
    config: 
      ["icrc72:publication:mode", {
        "Text": "priority"
      }]
    ,
    memo: []
  };

    // Act: Attempt to perform the publication update on non-existing publication
    const updateResult = await orchestrator_fixture.actor.icrc72_update_publication([publicationUpdate]);

    // Assert: Verify that the update failed with NotFound error
    expect(updateResult.length).toBe(1);
    expect(updateResult[0]).toBeDefined();
    if (updateResult[0][0] && 'Err' in updateResult[0][0]) {
      expect(updateResult[0][0].Err).toBeDefined();
      expect(updateResult[0][0].Err).toEqual({
        "NotFound": null
      });
    } else {
      throw new Error(`Expected Err but got Ok: ${JSON.stringify(updateResult[0], null, 2)}`);
    }
  });

  // Publication Deletion Tests
  it('should delete a publication successfully', async function testDeletePublication_Success() {
    // Arrange: Set up Orchestrator with the default scenario and register a publication
    await setUpOrchestrator("defaultOrchestrator");

    await pic.tick(5);
    await pic.advanceTime(60_000); // Advance time by 60 seconds

   
  
    const registerResult = await registerPublication(admin);
    expect(registerResult.length).toBe(1);
    expect(registerResult[0]).toBeDefined();
    if (registerResult[0][0] && 'Ok' in registerResult[0][0]) {
      expect(registerResult[0][0].Ok).toBeGreaterThan(0n);
    } else {
      throw new Error(`Expected Ok but got Err: ${JSON.stringify(registerResult[0][0])}`);
    }

    let stats = await orchestrator_fixture.actor.get_stats();

    console.log("pubs", JSON.stringify(stats.publications, dataItemStringify, 2));  

    expect(stats.publications.length).toBe(4);
  
    const publicationId = registerResult[0][0]?.Ok;
  
    // Act: Delete the publication
    const deleteRequest: PublicationDeleteRequest = {
      publication: { publicationId },
      memo: []
    };
  
    const deleteResult = await orchestrator_fixture.actor.icrc72_delete_publication([deleteRequest]);

    await pic.tick(5);
    await pic.advanceTime(60_000); // Advance time by 60 seconds

    console.log("deleteResult", deleteResult);
  
    // Assert: Verify the deletion was successful
    expect(deleteResult.length).toBe(1);
    expect(deleteResult[0]).toBeDefined();
    if (deleteResult[0] && deleteResult[0][0] && 'Ok' in deleteResult[0][0]) {
      expect(deleteResult[0][0].Ok).toBe(true);
    } else {
      throw new Error(`Expected Ok but got Err: ${JSON.stringify(deleteResult[0][0])}`);
    }
  
    // Fetch the Orchestrator's state and verify the publication has been removed
    const state = await orchestrator_fixture.actor.get_stats();
    console.log("state", JSON.stringify(state, dataItemStringify, 2));
    expect(state.publications.length).toBe(3);
  });

  it('should prevent unauthorized callers from deleting publications', async function testDeletePublication_Unauthorized() {
    // Arrange: Set up Orchestrator with the default scenario and register a publication
    await setUpOrchestrator("defaultOrchestrator");

    // Register as admin and publish a publication
    let result = await mock_fixture.actor.setIdentity(admin);
    let result2 = await mock_fixture.actor.set_scenario("default");
    
    

    const registerResult = await registerPublication(admin);
    expect(registerResult.length).toBe(1);
    expect(registerResult[0]).toBeDefined();
    if (registerResult[0][0] && 'Ok' in registerResult[0][0]) {
      expect(registerResult[0][0].Ok).toBeGreaterThan(0n);
    } else {
      throw new Error(`Expected Ok but got Err: ${JSON.stringify(registerResult[0][0])}`);
    }

    const publicationId = registerResult[0][0]?.Ok;

    // Change identity to unauthorized user (bob)
    await orchestrator_fixture.actor.setIdentity(bob);

    // Define a PublicationDeleteRequest targeting the publication
    const deleteRequest: PublicationDeleteRequest = {
      publication: { publicationId },
      memo: []
    };

    // Act: Attempt to delete the publication as unauthorized caller
    const deleteResult = await orchestrator_fixture.actor.icrc72_delete_publication([deleteRequest]);

    // Assert: Verify that the deletion failed with Unauthorized error
    expect(deleteResult.length).toBe(1);
    expect(deleteResult[0]).toBeDefined();
    if (deleteResult[0][0] && 'Err' in deleteResult[0][0]) {
      expect(deleteResult[0][0].Err).toBeDefined();
      expect(deleteResult[0][0].Err).toEqual({
        "Unauthorized": null
      });
    } else {
      throw new Error(`Expected Err but got Ok: ${JSON.stringify(deleteResult[0], null, 2)}`);
    }

    // Reset identity to admin for further tests
    await orchestrator_fixture.actor.setIdentity(admin);
  });

  it('should handle deletion of non-existing publications gracefully', async function testDeletePublication_NotFound() {
    // Arrange: Set up Orchestrator with the default scenario
    await setUpOrchestrator("defaultOrchestrator");

    // Define a non-existing PublicationIdentifier
    const nonExistingPublicationId = 9999n;

    const deleteRequest: PublicationDeleteRequest = {
      publication: { publicationId: nonExistingPublicationId },
      memo: []
    };

    // Act: Attempt to delete a non-existing publication
    const deleteResult = await orchestrator_fixture.actor.icrc72_delete_publication([deleteRequest]);

    // Assert: Verify that the deletion failed with NotFound error
    expect(deleteResult.length).toBe(1);
    expect(deleteResult[0]).toBeDefined();
    if (deleteResult[0][0] && 'Err' in deleteResult[0][0]) {
      expect(deleteResult[0][0].Err).toBeDefined();
      expect(deleteResult[0][0].Err).toEqual({
        "NotFound": null
      });
    } else {
      throw new Error(`Expected Err but got Ok: ${JSON.stringify(deleteResult[0], null, 2)}`);
    }
  });

  
});