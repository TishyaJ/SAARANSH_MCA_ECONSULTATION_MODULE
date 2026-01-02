// inspect_paths_only.js
async function inspect() {
    try {
        const res = await fetch('http://192.168.1.16:8364/openapi.json');
        if (res.ok) {
            const json = await res.json();
            const paths = Object.keys(json.paths);
            console.log('--- API PATHS ---');
            paths.forEach(p => console.log(p));
        }
    } catch (e) { console.error(e.message); }
}
inspect();
