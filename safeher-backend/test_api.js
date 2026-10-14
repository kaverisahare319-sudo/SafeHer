// End-to-end API test. Start the backend first with:
//   MONGO_URI= JWT_SECRET=test ADMIN_EMAIL=admin@college.edu ADMIN_PASSWORD=Admin@12345 DEV_SHOW_OTP=true node index.js
// then run: node test_api.js
const B='http://localhost:5000';
const j=async(m,p,b,t)=>{const r=await fetch(B+p,{method:m,headers:{'Content-Type':'application/json',...(t?{Authorization:'Bearer '+t}:{})},body:b?JSON.stringify(b):undefined});let d;try{d=await r.json()}catch{d={}};return{s:r.status,d}};
const ok=(n,c,x='')=>console.log((c?'PASS':'FAIL')+' '+n+(c?'':' -> '+x));
(async()=>{
 const img='data:image/jpeg;base64,'+Buffer.from('fakejpegbytes').toString('base64');
 let r=await j('POST','/api/auth/signup',{name:'Asha Patil',email:'asha@x.com',phone:'9876543210',password:'Pass@1234',declaration:true});
 ok('signup w/o ID rejected',r.s===400,JSON.stringify(r));
 r=await j('POST','/api/auth/signup',{name:'Asha Patil',email:'asha@x.com',phone:'9876543210',password:'Pass@1234',declaration:true,idCardImage:img});
 ok('signup ok + devOtp',r.s===201&&r.d.devOtp,JSON.stringify(r)); const otp=r.d.devOtp;
 r=await j('POST','/api/auth/login',{email:'asha@x.com',password:'Pass@1234'}); ok('login blocked: email not verified',r.s===403&&r.d.code==='EMAIL_NOT_VERIFIED');
 r=await j('POST','/api/auth/verify-email',{email:'asha@x.com',otp:'000000'}); ok('wrong otp rejected',r.s===400);
 r=await j('POST','/api/auth/verify-email',{email:'asha@x.com',otp}); ok('otp verifies',r.s===200,JSON.stringify(r));
 r=await j('POST','/api/auth/login',{email:'asha@x.com',password:'Pass@1234'}); ok('login blocked: pending approval',r.s===403&&r.d.code==='PENDING_APPROVAL');
 let a=await j('POST','/api/auth/login',{email:'admin@college.edu',password:'Admin@12345'}); ok('admin login',a.s===200&&a.d.user.role==='admin'); const at=a.d.token;
 r=await j('GET','/api/admin/users?status=pending',null,at); ok('admin sees pending',r.s===200&&r.d.length===1&&r.d[0].hasIdCard,JSON.stringify(r)); const uid=r.d[0].id;
 ok('list has no id image/password',!JSON.stringify(r.d).includes('base64')&&!JSON.stringify(r.d).includes('password'));
 r=await j('GET',`/api/admin/users/${uid}/id-card`,null,at); ok('admin sees ID card',r.s===200&&r.d.idCardImage);
 r=await j('POST',`/api/admin/users/${uid}/approve`,{},at); ok('approve',r.s===200);
 r=await j('GET',`/api/admin/users/${uid}/id-card`,null,at); ok('ID photo deleted after decision',r.s===404);
 let u=await j('POST','/api/auth/login',{email:'asha@x.com',password:'Pass@1234'}); ok('student login after approval',u.s===200&&u.d.user.role==='user'); const ut=u.d.token;
 r=await j('GET','/api/admin/users',null,ut); ok('student cannot use admin API',r.s===403);
 r=await j('GET','/api/admin/users'); ok('no token => 401',r.s===401);
 r=await j('POST','/api/complaints',{category:'Harassment',description:'Someone followed me near the library gate yesterday evening.',location:'Library gate'},ut); ok('complaint filed',r.s===201,JSON.stringify(r));
 r=await j('POST','/api/complaints',{description:'short'},ut); ok('short complaint rejected',r.s===400);
 r=await j('GET','/api/admin/complaints',null,at); const raw=JSON.stringify(r.d);
 ok('admin sees complaint',r.s===200&&r.d.length===1);
 ok('ANONYMITY: no name/email/id/ownerKey in admin view',!/Asha|asha@|userId|ownerKey|9876543210/.test(raw),raw);
 const cid=r.d[0].id;
 r=await j('PATCH',`/api/admin/complaints/${cid}`,{status:'in_review',adminReply:'We are looking into it.'},at); ok('admin replies',r.s===200&&r.d.status==='in_review');
 r=await j('GET','/api/complaints/mine',null,ut); ok('student sees own complaint + reply',r.s===200&&r.d.length===1&&r.d[0].adminReply,JSON.stringify(r));
 ok('mine has no ownerKey',!JSON.stringify(r.d).includes('ownerKey'));
 r=await j('POST','/api/location/update',{lat:21.1,lng:79.0},ut); ok('location NOT accepted without active alert',r.s===409,JSON.stringify(r));
 r=await j('POST','/api/nightout/walk/start',{durationMinutes:9999,initialLocation:{lat:21.1,lng:79.0}},ut); ok('walk start capped',r.s===201); const sid=r.d.sessionId;
 r=await fetch(B+`/api/nightout/walk/${sid}`).then(x=>x.json()); ok('public walk link exposes only position/expiry',Object.keys(r).sort().join()==='expiresAt,lastPosition,status',Object.keys(r).join());
 await j('POST',`/api/nightout/walk/${sid}/safe`,{},ut); r=await j('GET',`/api/nightout/walk/${sid}`); ok('walk link dead after safe',r.s===404);
 r=await j('POST','/api/auth/forgot-password',{email:'asha@x.com'}); ok('forgot gives otp',r.s===200&&r.d.devOtp);
 r=await j('POST','/api/auth/reset-password',{email:'asha@x.com',otp:r.d.devOtp,newPassword:'NewPass@999'}); ok('reset ok',r.s===200,JSON.stringify(r));
 r=await j('POST','/api/auth/login',{email:'asha@x.com',password:'NewPass@999'}); ok('login with new password',r.s===200);
 r=await j('POST','/api/auth/forgot-password',{email:'nobody@x.com'}); ok('unknown email same answer, no otp',r.s===200&&!r.d.devOtp);
 await j('POST','/api/admin/users/'+uid+'/block',{reason:'misuse'},at); r=await j('GET','/api/contacts',null,ut); ok('blocked user token stops working',r.s===403);
})();
