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
  init as orchestratorInit } from "../../src/declarations/orchestrator/orchestrator.did.js";
import type {
  
  _SERVICE as OrchestratorService,} from "../../src/declarations/orchestrator/orchestrator.did.d";

  import {idlFactory as broadcasterIDLFactory,
    init as broadcasterInit } from "../../src/declarations/broadcaster/broadcaster.did.js";
  import type {
    
    _SERVICE as BroadcasterService} from "../../src/declarations/broadcaster/broadcaster.did.d";
  export const broadcaster_WASM_PATH = ".dfx/local/canisters/broadcaster/broadcaster.wasm.gz"; 

  import {idlFactory as subscriberIDLFactory,
    init as subscriberInit } from "../../src/declarations/subscriber/subscriber.did.js";
  import type {
    
    _SERVICE as SubscriberService} from "../../src/declarations/subscriber/subscriber.did.d";
  export const subscriber_WASM_PATH = ".dfx/local/canisters/subscriber/subscriber.wasm.gz"; 


import { get } from "http";
import { ICRC16Map, EventNotification, PublicationRegistration } from "../../src/declarations/orchestrator/orchestrator.did.js";
import { assert } from "console";
import { publisher } from "../../src/declarations/publisher/index.js";
import { canisterId } from "../../src/declarations/broadcaster/index.js";
export const orchestrator_WASM_PATH = ".dfx/local/canisters/orchestrator/orchestrator.wasm.gz"; 



const admin = createIdentity("admin");
const alice = createIdentity("alice");
const bob = createIdentity("bob");

let pic: PocketIc;
let orchestratorFixture: CanisterFixture<OrchestratorService>;
let broadcasterFixtures1 : CanisterFixture<BroadcasterService>;
let broadcasterFixtures2 : CanisterFixture<BroadcasterService>;
let broadcasterFixtures3 : CanisterFixture<BroadcasterService>;
let subscriberFixtures1_1 : CanisterFixture<SubscriberService>;
let subscriberFixtures1_2 : CanisterFixture<SubscriberService>;
let subscriberFixtures1_3 : CanisterFixture<SubscriberService>;
let subscriberFixtures1_4 : CanisterFixture<SubscriberService>;
let subscriberFixtures2_1 : CanisterFixture<SubscriberService>;
let subscriberFixtures2_2 : CanisterFixture<SubscriberService>;
let subscriberFixtures2_3 : CanisterFixture<SubscriberService>;
let subscriberFixtures2_4 : CanisterFixture<SubscriberService>;
let subscriberFixtures3_1 : CanisterFixture<SubscriberService>;
let subscriberFixtures3_2 : CanisterFixture<SubscriberService>;
let subscriberFixtures3_3 : CanisterFixture<SubscriberService>;
let subscriberFixtures3_4 : CanisterFixture<SubscriberService>;
let publisherFixture: CanisterFixture<PublisherService>;

let subnet1 : Principal;
let subnet2 : Principal;
let subnet3 : Principal;

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

describe("integration test", () => {

    // Our integration test will be have as such:
    // 1. Initialize the Orchestrator
    // 2. Deploy broadcasters to 3 subnets
    // 3. Deploy 4 subscribers each to each subnet
    // 4. Deploy the Publisher
    // 5. Initialize the Publisher
    // 6. Initialize the Subscribers - some with filters
    // 7. Confirm that the broadcasters are all wired up between the publisher and the subscribers
    // 8. Produce a set of messages that will be sent to the subscribers 
    // 9. Confirm that the subscribers receive the messages as expected
    // 10. Confirm that the subscribers can confirm the messages as expected
    

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
        application: [
          { state: { type: SubnetStateType.New } },
          { state: { type: SubnetStateType.New } },
          { state: { type: SubnetStateType.New } },
        ],
        processingTimeoutMs: 1000 * 120 * 5,
      } );

      subnet1 = pic.getApplicationSubnets()[0].id;
      subnet2 = pic.getApplicationSubnets()[1].id;
      subnet3 = pic.getApplicationSubnets()[2].id;

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
      assert(subnet1);
      assert(subnet2);
      assert(subnet3);

        // Step 1: Initialize the Orchestrator
      const orchestratorFixture = await pic.setupCanister<OrchestratorService>({
        sender: admin.getPrincipal(),
        idlFactory: orchestratorIDLFactory,
        wasm: orchestrator_WASM_PATH,
        targetCanisterId : Principal.fromText("tqzl2-p7777-77776-aaaaa-cai"),
        targetSubnetId: subnet1,
        arg: IDL.encode(orchestratorInit({ IDL }), [
          [
            {
              icrc72OrchestratorArgs: [],
              icrc72SubscriberArgs: [],
              icrc72PublisherArgs: [],
              ttArgs: [],
            },
          ],
        ]),
      });
      await orchestratorFixture.actor.file_subnet_canister(subnet1, orchestratorFixture.canisterId);
      await orchestratorFixture.actor.setIdentity(admin);
      console.log("Orchestrator deployed with Canister ID:", orchestratorFixture.canisterId.toText());

      // Step 2: Deploy broadcasters to 3 subnets
      const subnetIds = [subnet1, subnet2, subnet3]; // Replace with actual subnet IDs
      const canisterIds = ["7tjcv-pp777-77776-qaaaa-cai", "lxzze-o7777-77777-aaaaa-cai", "txyno-ch777-77776-aaaaq-cai" ]
      const broadcasterFixtures = [];
      for (const subnetId of subnetIds) {
        assert(canisterIds.length > 0);
        let canisterId : any = canisterIds.pop();
        await orchestratorFixture.actor.file_subnet_canister(subnetId, Principal.fromText(canisterId));
        
        const broadcasterFixture = await pic.setupCanister<BroadcasterService>({
          
          sender: admin.getPrincipal(),
          idlFactory: broadcasterIDLFactory,
          wasm: broadcaster_WASM_PATH,
          targetCanisterId: Principal.fromText(canisterId),
          arg: IDL.encode(broadcasterInit({ IDL }), [
            [
              {
                orchestrator: orchestratorFixture.canisterId,
                icrc72BroadcasterArgs: [],
                icrc72SubscriberArgs: [],
                icrc72PublisherArgs: [],
                ttArgs: [],
              },
            ],
          ]),
          targetSubnetId: subnetId, // Assigning to specific subnet
        });
        
        //await orchestratorFixture.actor.file_subnet_canister(subnetId, broadcasterFixture.canisterId);
        await broadcasterFixture.actor.setIdentity(admin);
        broadcasterFixtures.push(broadcasterFixture);
        console.log(`Broadcaster deployed to ${subnetId} with Canister ID:`, broadcasterFixture.canisterId.toText());
        //expect("temp stop").toBe("Ok"); 
        await pic.tick(5);
        await pic.advanceTime(60_000);
        
      };

      broadcasterFixtures1 = broadcasterFixtures[0];
      broadcasterFixtures2 = broadcasterFixtures[1];
      broadcasterFixtures3 = broadcasterFixtures[2];



      //register each broadcaster with the orchestrator
      await orchestratorFixture.actor.file_subnet_broadcaster(broadcasterFixtures1.canisterId);
      console.log("Broadcaster 1 registered with Orchestrator");
      

      await pic.tick(5);
      await pic.advanceTime(60_000);

      console.log("Broadcaster 1 about to initialized");

      await broadcasterFixtures1.actor.initialize();

      
      await pic.tick(5);
      await pic.advanceTime(60_000);

      console.log("Broadcaster 1 initialized");

      await orchestratorFixture.actor.file_subnet_broadcaster(broadcasterFixtures2.canisterId);
      console.log("Broadcaster 2 registered with Orchestrator");

      await pic.tick(5);
      await pic.advanceTime(60_000);

      console.log("Broadcaster 2 about to initialized");

      await broadcasterFixtures2.actor.initialize();

      console.log("Broadcaster 2 initialized");

      await pic.tick(5);
      await pic.advanceTime(60_000);

      expect("temp stop").toBe("Ok");
      
      
      
      await orchestratorFixture.actor.file_subnet_broadcaster(broadcasterFixtures3.canisterId);
      console.log("Broadcaster 3 registered with Orchestrator");


      


      

      await pic.tick(5);
      await pic.advanceTime(60_000);

      await broadcasterFixtures2.actor.initialize();

      await pic.tick(5);
      await pic.advanceTime(60_000);

      
      await broadcasterFixtures3.actor.initialize();


      expect("temp").toEqual("ok");

     let subscriberIds : any =["tf62x-ox777-77776-aaadq-cai","72kjj-zh777-77776-qaabq-cai","l62sy-yx777-77777-aaabq-cai","tc74d-dp777-77776-aaada-cai",

     "tl4x7-vh777-77776-aaacq-cai","75lp5-u7777-77776-qaaba-cai","lz3um-vp777-77777-aaaba-cai", "tm5rl-y7777-77776-aaaca-cai",

     "tz2ag-zx777-77776-aaabq-cai","7uieb-cx777-77776-qaaaq-cai","lqy7q-dh777-77777-aaaaq-cai","t63gs-up777-77776-aaaba-cai"]




      // Step 3: Deploy 4 subscribers each to each subnet
      const subscribersPerSubnet = 4;
      const subscriberFixtures = [];
      for (const broadcasterFixture of broadcasterFixtures) {
        for (let i = 0; i < subscribersPerSubnet; i++) {
          const subscriberFixture = await pic.setupCanister<SubscriberService>({
            sender: admin.getPrincipal(),
            idlFactory: subscriberIDLFactory,
            wasm: subscriber_WASM_PATH,
            targetCanisterId : Principal.fromText(subscriberIds.pop()),
            arg: IDL.encode(subscriberInit({ IDL }), [
              [
                {
                  orchestrator: orchestratorFixture.canisterId,
                  icrc72SubscriberArgs: [],
                  ttArgs: [],
                },
              ],
            ]),
            targetSubnetId: pic.getApplicationSubnets()[i % 3].id, // Assigning to the same subnet as Broadcaster
          });
          await orchestratorFixture.actor.file_subnet_canister(pic.getApplicationSubnets()[i % 3].id, subscriberFixture.canisterId);
          await subscriberFixture.actor.setIdentity(admin);
          subscriberFixtures.push(subscriberFixture);
          console.log(`Subscriber ${i + 1} deployed to subnet ${pic.getApplicationSubnets()[i % 3].id} with Canister ID:`, subscriberFixture.canisterId.toText());
          await pic.tick(5);
          await pic.advanceTime(60_000);
        }
      }

      //expect("temp pause").toBe("Ok");

      // Step 4: Deploy the Publisher
      const publisherFixture = await pic.setupCanister<PublisherService>({
        sender: admin.getPrincipal(),
        idlFactory: publisherIDLFactory,
        wasm: publisher_WASM_PATH,
        targetSubnetId: subnet1,
        targetCanisterId: Principal.fromText("siq6z-b7777-77776-aaaea-cai"),
        arg: IDL.encode(publisherInit({ IDL }), [
          [
            {
              orchestrator: orchestratorFixture.canisterId,
              icrc72PublisherArgs: [],
              ttArgs: [],
            },
          ],
        ]),
      });
      await orchestratorFixture.actor.file_subnet_canister(subnet1, publisherFixture.canisterId);

      await publisherFixture.actor.setIdentity(admin);
      console.log("Publisher deployed with Canister ID:", publisherFixture.canisterId.toString());

      // Step 5: Initialize the Publisher

      let publicationResult = await publisherFixture.actor.simulatePublicationCreation();
      let publicationId;

      if (publicationResult[0] && publicationResult[0][0] && 'Ok' in publicationResult[0][0]) {
        publicationId = publicationResult[0][0].Ok;
      } else {
        expect("Publication creation failed").toBe("Ok");
      }

      await pic.tick(5);
      await pic.advanceTime(60_000);
      

      // Step 6: Initialize the Subscribers - Some with Filters
      for (const subscriberFixture of subscriberFixtures) {
        // Example: Initialize with a filter for every second subscriber
        if (subscriberFixtures.indexOf(subscriberFixture) % 4 === 0) {
          subscriberFixture.actor.setIdentity(admin);
          await subscriberFixture.actor.simulateSubscriptionCreation(true,"com.test.counter", [
            [["icrc72:subscription:filter", {Text : "data != 2"} ]]]);
          console.log(`Subscriber ${subscriberFixtures.indexOf(subscriberFixture) + 1} initialized with a filter.`);
        } else if (subscriberFixtures.indexOf(subscriberFixture) % 2 === 0){
          subscriberFixture.actor.setIdentity(admin);
          await subscriberFixture.actor.simulateSubscriptionCreation(true,"com.test.counter", [
            [["icrc72:subscription:skip", {Array : [{Nat: 3n}]} ]]]);
          console.log(`Subscriber ${subscriberFixtures.indexOf(subscriberFixture) + 1} initialized with a skip.`);
        } else if (subscriberFixtures.indexOf(subscriberFixture) % 2 === 0){
          subscriberFixture.actor.setIdentity(admin);
          await subscriberFixture.actor.simulateSubscriptionCreation(true,"com.test.counter", [
            [["icrc72:subscription:skip", {Array : [{Nat: 3n},{Nat: 1n}]} ]]]);
          console.log(`Subscriber ${subscriberFixtures.indexOf(subscriberFixture) + 1} initialized with a skip and offset.`);
        } else {
          subscriberFixture.actor.setIdentity(admin);
          await subscriberFixture.actor.simulateSubscriptionCreation(true,"com.test.counter", [
            []]);
          console.log(`Subscriber ${subscriberFixtures.indexOf(subscriberFixture) + 1} initialized with no skip or filter.`);
        }
      }

      // Allow some time for Subscribers to initialize
      await pic.tick(5);
      await pic.advanceTime(60_000);
      await pic.tick(5);

      // Step 7: Confirm that the broadcasters are all wired up between the publisher and the subscribers
      for (const broadcasterFixture of broadcasterFixtures) {
        const stats = await broadcasterFixture.actor.get_stats();
        console.log("Broadcaster stats:", stats);
        expect(stats.subscriptions.length).toEqual(subscribersPerSubnet);
        console.log(`Broadcaster ${broadcasterFixture.canisterId} is wired up with ${subscribersPerSubnet} subscribers.`);
      }

      await pic.tick(5);
      await pic.advanceTime(60_000);

      // Step 8: Produce a set of messages that will be sent to the subscribers
      const messages : ICRC72NewEvent [] = [
        {
          namespace: "com.test.counter",
          data: { Map: [["counter", { Nat: 1n }]] },
          headers: []
        },
        {
          namespace: "com.test.counter",
          data: { Map: [["counter", { Nat: 2n }]] },
          headers: []
        },
        {
          namespace: "com.test.counter",
          data: { Map: [["counter", { Nat: 1n }]] },
          headers: []
        },
        {
          namespace: "com.test.counter",
          data: { Map: [["counter", { Nat: 2n }]] },
          headers: []
        },
        {
          namespace: "com.test.counter",
          data: { Map: [["counter", { Nat: 3n }]] },
          headers: []
        },
        {
          namespace: "com.test.counter",
          data: { Map: [["counter", { Nat: 4n }]] },
          headers: []
        },
        {
          namespace: "com.test.counter",
          data: { Map: [["counter", { Nat: 5n }]] },
          headers: [],
        },
        {
          namespace: "com.test.counter",
          data: { Map: [["counter", { Nat: 6n }]] },
          headers: [],
        },
      ];

      await publisherFixture.actor.simulatePublish(messages);
      console.log("Publisher published messages:", messages);

      // Allow time for messages to propagate
      await pic.tick(5);
      await pic.advanceTime(60_000);
      await pic.tick(5);

      // Step 9: Confirm that the subscribers receive the messages as expected
      let counters = [];
      for (const subscriberFixture of subscriberFixtures) {
        const counterStatus = await subscriberFixture.actor.getCounter();
        console.log("counterStatus", counterStatus);
        counters.push(counterStatus);
      }

      expect(counters[0]).toEqual(1n);
      expect(counters[1]).toEqual(2n);
      expect(counters[2]).toEqual(1n);
      expect(counters[3]).toEqual(2n);
      expect(counters[4]).toEqual(4n);
      expect(counters[5]).toEqual(6n);
      expect(counters[6]).toEqual(5n);
      expect(counters[7]).toEqual(6n);
      expect(counters[8]).toEqual(1n);
      expect(counters[9]).toEqual(2n);
      expect(counters[10]).toEqual(1n);
      expect(counters[11]).toEqual(2n);
      expect(counters[12]).toEqual(4n);

      // Step 10: Confirm that the subscribers can confirm the messages as expected
      for (const broadcasterFixture of broadcasterFixtures) {
        const confirmations = await broadcasterFixture.actor.getHandledNotifications();
        console.log(`Broadcaster ${broadcasterFixture.canisterId} received confirmations:`, confirmations);
        expect(confirmations.length).toBeGreaterThanOrEqual(2);
      }

  });
});