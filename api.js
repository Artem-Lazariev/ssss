let data = await fetch('./test.json').then(res => res.json())
console.log(data["_embedded"]["events"][0])
console.log(JSON.stringify(data, null, 2));
export { data };