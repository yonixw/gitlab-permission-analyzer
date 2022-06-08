c = {} //JSON report

// Get only js urls
d= c.map(u=>u.projects.map(p=>p.fullurl))            

// Make one long list
e= d.reduce((a,b,c)=>a.concat(b))

// remove duplicats
f = [...new Set( e.map(u=>u.toLowerCase()) )]

// url -> folder
g = f.map(u=>[u,u.replace('https://gitlab.com/','')])

// clone
h = g.map(u=>`git clone ${u[0]} "${u[1]}" `)

// print shell file with 3 sec cooldown
console.log(h.join('\nping 127.0.0.1 -n 3 -w 3 \n')) // wait for 3 sec between calls

// verify you can download private gits first...
// then run
