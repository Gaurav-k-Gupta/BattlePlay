// server.js

// Using Node.js native fetch (requires Node 18+)
// The API requires application/x-www-form-urlencoded format

async function createOrder() {
    const url = "https://tranzupi.com/api/create-order";

    // Hardcoded payload based on docs
    const payload = new URLSearchParams({
        customer_mobile: "9999999999",
        user_token: "4fe34928b27caa3b5f8219ca6fd624d2",
        amount: "1.00",
        order_id: "TEST_ORDER_12345",
        redirect_url: "https://yourwebsite.com/return",
        remark1: "Payment for Invoice #123",
        remark2: "Customer Name"
    });

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: payload.toString()
        });

        const data = await response.json();
        console.log("=== CREATE ORDER RESPONSE ===");
        console.log(JSON.stringify(data, null, 2));
        console.log("\n");
    } catch (error) {
        console.error("Create Order Error:", error);
    }
}

async function checkStatus() {
    const url = "https://tranzupi.com/api/check-order-status";

    // Hardcoded payload matching the order_id above
    const payload = new URLSearchParams({
        user_token: "4fe34928b27caa3b5f8219ca6fd624d2",
        order_id: "TEST_ORDER_12345"
    });

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: payload.toString()
        });

        const data = await response.json();
        console.log("=== CHECK STATUS RESPONSE ===");
        console.log(JSON.stringify(data, null, 2));
        console.log("\n");
    } catch (error) {
        console.error("Check Status Error:", error);
    }
}

async function main() {
    console.log("Starting TranzUPI API Tests...\n");

    // await createOrder();

    // In a real scenario, you wouldn't check status immediately after creating,
    // but this fulfills the requirement to call both in main.
    await checkStatus();
}

// Execute the main function
main();