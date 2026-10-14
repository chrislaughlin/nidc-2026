console.log('demo poc');


import { Constants, NodeJSSerialConnection } from "@liamcottle/meshcore.js";

// serial connections are supported by "companion_radio_usb" firmware
const connection = new NodeJSSerialConnection("/dev/tty.usbserial-0001");

// tcp connections are supported by "companion_radio_wifi" firmware
// const connection = new TCPConnection("10.1.0.226", 5000);

// wait until connected
connection.on("connected", async () => {

    // we are now connected
    console.log("connected!");
    // log contacts
    // const contacts = await connection.getContacts();
    // for(const contact of contacts) {
    //     console.log(`Contact: ${contact.advName}`);
    //     if (contact.advName === "D0D35F75") {
    //         console.log("Found contact, sending message");
    //         await connection.sendTextMessage(contact.publicKey, "Hello from demo-poc!", 0);
    //     }
    //     count++
    // }

    await connection.findContactByName("D0D35F75").then(async (contact) => {
        console.log(`Contact: ${contact.advName}`);
        console.log("Found contact, sending message");
        await connection.sendTextMessage(contact.publicKey, "Hello from demo-poc!", 0);
    }).catch((err) => {
        console.log("Contact not found");
    });

    let readingMessages = false;

connection.on(Constants.PushCodes.MsgWaiting, async () => {
  if (readingMessages) return;

  readingMessages = true;

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
  } finally {
    readingMessages = false;
  }
});

    // disconnect
    // connection.close();

    

});

// connect to meshcore device
await connection.connect();
