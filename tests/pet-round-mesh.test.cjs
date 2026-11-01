const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
test('rounded pet ellipsoids have outward nondegenerate triangles including both poles',()=>{
 const s=fs.readFileSync('dist/island-3d.js','utf8'),faces=[],ctx={Math,face:v=>faces.push(v)};
 vm.createContext(ctx);vm.runInContext(s.slice(s.indexOf(' function petOval('),s.indexOf(' function drawPetMesh(')),ctx);
 ctx.petOval(0,0,0,.49,.34,.49,'#fff');
 assert.equal(faces.length,196);
 for(const [a,b,c] of faces){const u=b.map((x,i)=>x-a[i]),v=c.map((x,i)=>x-a[i]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],mid=a.map((x,i)=>(x+b[i]+c[i])/3);assert(Math.hypot(...n)>1e-6);assert(n.reduce((sum,x,i)=>sum+x*mid[i],0)>0)}
});
