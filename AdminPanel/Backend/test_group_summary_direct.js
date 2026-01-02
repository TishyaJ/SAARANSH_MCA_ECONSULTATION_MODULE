// test_group_summary_direct.js
// Direct test of the FastAPI /api/summarize_group endpoint

async function test() {
    const comments = [
        "The bill is fantastic and will improve the economy.",
        "I support this bill because it helps small businesses.",
        "This is a great step forward for our country."
    ];

    console.log('--- Testing /api/summarize_group ---');
    try {
        const res = await fetch('http://192.168.1.16:8364/api/summarize_group', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comments: comments })
        });

        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Raw Response:', text);
    } catch (e) {
        console.error('Error:', e.message);
    }
}

test();
