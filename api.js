let data = await fetch('./test.json').catch(err => {data = err}).then(res => res.json())

export { data };