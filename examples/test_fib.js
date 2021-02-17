  
/* example of JS module importing a C module */

import { fib, atob, btoa } from "libfib.so";

console.log("Hello World", btoa("hello,world"));
console.log("Hello World", btoa(btoa("hello,world")));
console.log("Hello World", btoa(btoa(btoa("hello,world"))));
console.log("btoa()", atob(btoa("hello,world")));
console.log("fib(10)=", fib(10));
