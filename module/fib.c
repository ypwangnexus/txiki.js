/*
 * QuickJS: Example of C module
 * 
 * Copyright (c) 2017-2018 Fabrice Bellard
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
#include "../deps/quickjs/include/quickjs.h"
#include "../deps/quickjs/src/cutils.h"
#include "./wolfssl.h"

#define countof(x) (sizeof(x) / sizeof((x)[0]))

static int fib(int n)
{
    if (n <= 0)
        return 0;
    else if (n == 1)
        return 1;
    else
        return fib(n - 1) + fib(n - 2);
}

static JSValue js_fib(JSContext *ctx, JSValueConst this_val,
                      int argc, JSValueConst *argv)
{
    int n, res;
    if (JS_ToInt32(ctx, &n, argv[0]))
        return JS_EXCEPTION;
    res = fib(n);
    JS_ThrowReferenceError(ctx, "Too long for decoding for");
    return JS_NewInt32(ctx, res);
}

static DynBuf dbuf;
#define MAX_RESERVED_BUFFER1 65535
static char b64_buffer[MAX_RESERVED_BUFFER1];
static const char* base64_enc(JSContext *ctx, const char* str, int len)
{
  int outlen = len*2+1;
  if (outlen >  MAX_RESERVED_BUFFER1) {
    JS_ThrowReferenceError(ctx, "Too Long for encoding for %s\n", str);
    return NULL;
  }
    
  int res = Base64_Encode(str, len, b64_buffer, &outlen);
  if (res != 0) {
    JS_ThrowReferenceError(ctx, "Could not do base64 encoding for %s\n", str);
    return NULL;
  }
  if ( b64_buffer[outlen-1] == '\n') outlen--;
  b64_buffer[outlen] = 0;
  return b64_buffer;
}
static const char* base64_dec(JSContext *ctx, const char* str, int len)
{
  int outlen = (len*3+3)/4;
  if (outlen > MAX_RESERVED_BUFFER1) {
    JS_ThrowReferenceError(ctx, "Too long for decoding for %s\n", str);
    return NULL;
  }
  int res = Base64_Decode(str, len, b64_buffer, &outlen);
  if (res != 0) { 
    printf("Base64_Decode %d\n", res);
    JS_ThrowTypeError(ctx, "Could not do base64 decoding for %s\n", str);
    return NULL; 
  }
  b64_buffer[outlen] = 0;
  return b64_buffer;
}
typedef enum {
  JS_ATOB = 100,
  JS_BTOA
} JSCMD;

static JSValue js_base64(JSContext *ctx, JSValueConst this_val,
                        int argc, JSValueConst *argv, JSCMD cmd) 
{
 int n;
 JSValue res;
 const char* str = JS_ToCStringLen(ctx, &n, argv[0]);
 dbuf_init(&dbuf);
 const char* out = NULL;
 if (cmd == JS_BTOA) out = base64_enc(ctx, str, n); 
 else if (cmd == JS_ATOB) out = base64_dec(ctx, str, n);
 if (out == NULL) goto fail;
 dbuf_putstr(&dbuf, out); 
fail:
 res = JS_NewStringLen(ctx, (char *)dbuf.buf, dbuf.size);
 dbuf_free(&dbuf);
 return res; 
}

static JSValue js_atob(JSContext *ctx, JSValueConst this_val,
                      int argc, JSValueConst *argv)
{
  return js_base64(ctx, this_val, argc, argv, JS_ATOB);
}
static JSValue js_btoa(JSContext *ctx, JSValueConst this_val,
                      int argc, JSValueConst *argv)
{
  return js_base64(ctx, this_val, argc, argv, JS_BTOA);
}

static const JSCFunctionListEntry js_fib_funcs[] = {
    JS_CFUNC_DEF("fib", 1, js_fib ),
    JS_CFUNC_DEF("atob", 1, js_atob ),
    JS_CFUNC_DEF("btoa", 1, js_btoa ),
};

static int js_fib_init(JSContext *ctx, JSModuleDef *m)
{
    return JS_SetModuleExportList(ctx, m, js_fib_funcs,
                                  countof(js_fib_funcs));
}

#ifdef JS_SHARED_LIBRARY
#define JS_INIT_MODULE js_init_module
#else
#define JS_INIT_MODULE js_init_module_fib
#endif

JSModuleDef *JS_INIT_MODULE(JSContext *ctx, const char *module_name)
{
    JSModuleDef *m;
    m = JS_NewCModule(ctx, module_name, js_fib_init);
    if (!m)
        return NULL;
    JS_AddModuleExportList(ctx, m, js_fib_funcs, countof(js_fib_funcs));
    return m;
}
