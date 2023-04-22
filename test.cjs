const test = require('node:test');
const assert = require('node:assert');

const command = import("./blueprint-command.js");

const TEST_BP = "ffblueprintstartH4sIAAAAAAAACu2YW0/bMBTHv0rk57bYiR07fWOFCaQNWKttDxMPVnraWkqTzHGAgvjuO6WUkRAETKSMy0trnYsv56e/L7kg26WbZZb0yVGiF2BJh+xoBwML+DtGM9+KtnzqB0sHFLE1uTNZio5tL85yA2NvarMy97KJVzhbxq60UGDwvoN5Qfq/LsjA6okbQmxywDR0DUprIXU7xkK86oyu4g/0fBkyyObgvIF28exqQl8gnboZ6fMO+WnGy5ZAYzY1hTNxMYTfJRRuPd5xhxxaMzWpTqoDrK24zhjGR1lhVq4Lckb6XSF6GLPAyOX/OVoYl9i+vJV4nXI4mRTgrhNpLa2aMsycXo9yopMSalld1pNKsSAKeOCHTDKloCvXHXXI6VUIvcQuh5BgVydQm3jz+KNcn6Zgb9UUy/i9gFGOGCYmrhcPCzfRSQEd8tkkrp64bI13U2fc4q/xqz77VkIJI3OOFhz0UaBZBfSemc68HUhxRQtvtCqVN8gsNELnT4XOHoLui3r5uky0T532JJWMhjKMqOJRQHmF+F33q+S/O8/d4tFq39P2BCdS0XvQot59flfwgor20dMK69cq7v0YHqHv+9GKG7TBs6taNZANN0D2PYj6Pu7/g6TZy0i6q3qS+76UoZABl0KF0FXv5gi/764m2jy2WcOx/aHwFpkHFeajLNHWO9IpJLeIsxvi/lOJBw8SD+8S53xzxGnEFfWVCKu6XvuVUn6Ee8DbAf7yD7Km3XwTL7J3tpv7bYP2/+UmvgHQrHYTR/ARp2EUShYGVImII/i3w/nlT+3Gt/bHod3yW7tJ3898MX9Q4Q3f1jZwL38zAj9exaHzAE69T7jS3JrUYeQPsMXqYyztMdHjjFz+AYQZlEbRFQAA";

test('blueprint decode', async (t) => {
    const validate = reply => {
        assert.strictEqual("got blueprint with 11 items", reply);
    }

    await command.then(c => c.handler({
        options: {
            getString: v => TEST_BP
        },
        reply: validate
    }));

  });