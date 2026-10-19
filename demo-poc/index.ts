console.log('weather station poc');


// @ts-ignore -- this package does not provide TypeScript declarations.
import { Constants, NodeJSSerialConnection } from "@liamcottle/meshcore.js";

type MeshConnection = NodeJSSerialConnection & {
    on(event: string | number | symbol, listener: (...args: any[]) => void): MeshConnection;
};


// Utils 
async function connectToContact(connection: MeshConnection) {
    console.log("Connected to meshcore device!");
    console.log("Searching for contact 'D0D35F75'...");
    await connection.findContactByName("D0D35F75").then(async (contact: Awaited<ReturnType<typeof connection.findContactByName>>) => {
        console.log(`Contact: ${contact.advName}`);
        console.log("Found contact, sending message");
        await connection.sendTextMessage(contact.publicKey, "Hello from weather station!", 0);
    }).catch((err: any) => {
        console.log("Contact not found, trying again in 5 seconds...");
        setTimeout(() => {
            connectToContact(connection);
        }, 5000);
    });
}

// Main 
const connection = new NodeJSSerialConnection("/dev/tty.usbserial-0001") as MeshConnection;

// Listen for messages
connection.on(Constants.PushCodes.MsgWaiting, async () => {
    console.log("Messages waiting to be read");
    try {
        const messages = await connection.getWaitingMessages();
        for (const message of messages) {
            if (message.contactMessage) {
                console.log("CONTACT MESSAGE");
                console.log("Text:", message.contactMessage.text);
                console.log("Timestamp:", message.contactMessage.senderTimestamp);
            }
        }
    } catch (error) {
        console.error("Failed to read messages:", error);
    }
});

console.log("Connecting to meshcore device on /dev/tty.usbserial-0001...");
// wait until connected
connection.on("connected", async () => {
    await connectToContact(connection);
});

// connect to meshcore device
await connection.connect();
