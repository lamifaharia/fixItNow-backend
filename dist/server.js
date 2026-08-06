
        import { createRequire } from 'module';
        const require = createRequire(import.meta.url);
        
import o from"express";var e=o();e.get("/",(t,n)=>{n.send("FixItNow Backend Running")});process.env.NODE_ENV!=="production"&&e.listen(3e3,()=>{console.log("Server running on http://localhost:3000")});var s=e;export{s as default};
