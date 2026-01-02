// inspect_group_summary.js
async function inspect() {
    try {
        const res = await fetch('http://192.168.1.16:8364/openapi.json');
        if (res.ok) {
            const json = await res.json();

            console.log('\n--- GroupSummaryRequest Schema ---');
            if (json.components && json.components.schemas && json.components.schemas.GroupSummaryRequest) {
                console.log(JSON.stringify(json.components.schemas.GroupSummaryRequest, null, 2));
            }

            console.log('\n--- Paths ---');
            const paths = Object.keys(json.paths);
            console.log(JSON.stringify(paths, null, 2));

            // Check for likely group endpoints
            const groupPath = paths.find(p => p.includes('group') || p.includes('batch'));
            if (groupPath) {
                console.log(`\n--- Details for ${groupPath} ---`);
                console.log(JSON.stringify(json.paths[groupPath], null, 2));
            }
        }
    } catch (e) {
        console.error(e.message);
    }
}
inspect();
