git submodule add https://github.com/glfw/glfw deps/glfw

https://github.com/JerrySievert/node-judy

https://www.freertos.org/FreeRTOS-Plus/WolfSSL/Using-SSL-TLS-in-a-server-site-application.html

https://www.freertos.org/FreeRTOS-Plus/WolfSSL/Using-SSL-TLS-in-a-client-site-application.html

https://gist.github.com/joni/3760795/8f0c1a608b7f0c8b3978db68105c5b1d741d0446
function toUTF8Array(str) {
    var utf8 = [];
    for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6), 
                      0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(0xe0 | (charcode >> 12), 
                      0x80 | ((charcode>>6) & 0x3f), 
                      0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
            i++;
            charcode = ((charcode&0x3ff)<<10)|(str.charCodeAt(i)&0x3ff) + 0x010000;
            utf8.push(0xf0 | (charcode >>18), 
                      0x80 | ((charcode>>12) & 0x3f), 
                      0x80 | ((charcode>>6) & 0x3f), 
                      0x80 | (charcode & 0x3f));
        }
    }
    return utf8;
}

function fromUTF8Array(data) { // array of bytes
    var str = '',
        i;

    for (i = 0; i < data.length; i++) {
        var value = data[i];

        if (value < 0x80) {
            str += String.fromCharCode(value);
        } else if (value > 0xBF && value < 0xE0) {
            str += String.fromCharCode((value & 0x1F) << 6 | data[i + 1] & 0x3F);
            i += 1;
        } else if (value > 0xDF && value < 0xF0) {
            str += String.fromCharCode((value & 0x0F) << 12 | (data[i + 1] & 0x3F) << 6 | data[i + 2] & 0x3F);
            i += 2;
        } else {
            // surrogate pair
            var charCode = ((value & 0x07) << 18 | (data[i + 1] & 0x3F) << 12 | (data[i + 2] & 0x3F) << 6 | data[i + 3] & 0x3F) - 0x010000;

            str += String.fromCharCode(charCode >> 10 | 0xD800, charCode & 0x03FF | 0xDC00); 
            i += 3;
        }
    }

    return str;
}

https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
// suppose buf contains the bytes [0x02, 0x01, 0x03, 0x07]
// notice the multibyte values respect the hardware endianess, which is little-endian in x86
var bufView = new Uint16Array(buf);
if (bufView[0]===258) {   // 258 === 0x0102
  console.log("ok");
}
bufView[0] = 255;    // buf now contains the bytes [0xFF, 0x00, 0x03, 0x07]
bufView[0] = 0xff05; // buf now contains the bytes [0x05, 0xFF, 0x03, 0x07]
bufView[1] = 0x0210; // buf now contains the bytes [0x05, 0xFF, 0x10, 0x02]

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}
function str2ab(str) {
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return bufView;
}


https://stackoverflow.com/questions/18148827/convert-buffer-to-array

https://stackoverflow.com/questions/13356493/decode-utf-8-with-javascript
function encode_utf8(s) {
  return unescape(encodeURIComponent(s));
}

function decode_utf8(s) {
  return decodeURIComponent(escape(s));
}



https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
In this example, we create a 8-byte buffer with a Int32Array view referring to the buffer:
const buffer = new ArrayBuffer(8);
const view = new Int32Array(buffer);


https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCodePoint

Javascript String and binary array is a mess

In C's world. all we need is the raw 8-byte array buffer. that is it!
https://www.wolfssl.com/doxygen/group__MD5.html
https://www.wolfssl.com/doxygen/group__Base__Encoding.html

JS_XX method that convert between C types and JS types
 2053  grep -r JS_New deps/quickjs/include/
 2055  grep -r JS_To deps/quickjs/include/
 2056  grep -r JS_GetArrayBuffer deps/quickjs/include/

// quickjs_libc.c
static JSValue js_printf_internal(JSContext *ctx,
        int argc, JSValueConst *argv, FILE *fp)
JSValueConst *argv 
fmt_str = JS_ToCStringLen(ctx, &fmt_len, argv[0]);
JS_ToInt32(ctx, &int32_arg, argv[i++])
if(  JS_IsString(argv[i]) ) {
  const char *string_arg = JS_ToCString(ctx, argv[i++])
  int32_arg = unicode_from_utf8((uint8_t *)string_arg, UTF8_CHAR_LEN_MAX, &p);
  JS_FreeCString(ctx, string_arg);
} else {
  if (JS_ToInt32(ctx, &int32_arg, argv[i++]))
                        goto fail;
}

https://bellard.org/quickjs/quickjs.html#Strings
3.4 QuickJS C API
The C API was designed to be simple and efficient. The C API is defined in the header quickjs.h.
3.4.2 JSValue
JSValue represents a Javascript value which can be a primitive type or an object. Reference counting is used, so it is important to explicitly duplicate (JS_DupValue(), increment the reference count) or free (JS_FreeValue(), decrement the reference count) JSValues.
3.4.3 C functions
C functions can be created with JS_NewCFunction(). JS_SetPropertyFunctionList() is a shortcut to easily add functions, setters and getters properties to a given object.

Unlike other embedded Javascript engines, there is no implicit stack, so C functions get their parameters as normal C parameters. As a general rule, C functions take constant JSValues as parameters (so they don’t need to free them) and return a newly allocated (=live) JSValue.

3.4.4 Exceptions
Exceptions: most C functions can return a Javascript exception. It must be explicitly tested and handled by the C code. The specific JSValue JS_EXCEPTION indicates that an exception occurred. The actual exception object is stored in the JSContext and can be retrieved with JS_GetException().

3.4.6 JS Classes
C opaque data can be attached to a Javascript object. The type of the C opaque data is determined with the class ID (JSClassID) of the object. Hence the first step is to register a new class ID and JS class (JS_NewClassID(), JS_NewClass()). Then you can create objects of this class with JS_NewObjectClass() and get or set the C opaque point with JS_GetOpaque()/JS_SetOpaque().

When defining a new JS class, it is possible to declare a finalizer which is called when the object is destroyed. A gc_mark method can be provided so that the cycle removal algorithm can find the other objects referenced by this object. Other methods are available to define exotic object behaviors.

The Class ID are globally allocated (i.e. for all runtimes). The JSClass are allocated per JSRuntime. JS_SetClassProto() is used to define a prototype for a given class in a given JSContext. JS_NewObjectClass() sets this prototype in the created object.

Examples are available in quickjs-libc.c.

4.2.2 Binary JSON
qjsc works by compiling scripts or modules and then serializing them to a binary format. A subset of this format (without functions or modules) can be used as binary JSON. The example test_bjson.js shows how to use it.

Warning: the binary JSON format may change without notice, so it should not be used to store persistent data. The test_bjson.js example is only used to test the binary object format functions.

4.3.1 Strings
Strings are stored either as an 8 bit or a 16 bit array of characters. Hence random access to characters is always fast.

The C API provides functions to convert Javascript Strings to C UTF-8 encoded strings. The most common case where the Javascript string contains only ASCII characters involves no copying.
// I found that it has TOCString.. functions.. the result should be a UTF8 string

4.3.6 JSValue
It is a Javascript value which can be a primitive type (such as Number, String, ...) or an Object. NaN boxing is used in the 32-bit version to store 64-bit floating point numbers. The representation is optimized so that 32-bit integers and reference counted values can be efficiently tested.

In 64-bit code, JSValue are 128-bit large and no NaN boxing is used. The rationale is that in 64-bit code memory usage is less critical.

In both cases (32 or 64 bits), JSValue exactly fits two CPU registers, so it can be efficiently returned by C functions.


The full regexp library weights about 15 KiB (x86 code), excluding the Unicode library.
The full Unicode library weights about 45 KiB (x86 code).


https://github.com/gfx-rs/wgpu-native/releases
https://github.com/gfx-rs/wgpu-native/tree/master/examples/triangle

