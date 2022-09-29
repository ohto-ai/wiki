---
comments: true
---
# 打印调用堆栈

```cpp
#include <execinfo.h>
#include <cstdio>
#include <cstdlib>

void dumpTraceback() {
    const int size = 200;
    void *buffer[size];
    char **strings;
    int nptrs = backtrace(buffer, size);
    printf("backtrace() returned %d address\n", nptrs);
    // backtrace_symbols函数不可重入， 可以使用backtrace_symbols_fd替换
    strings = backtrace_symbols(buffer, nptrs);
    if (strings) {
        for (int i = 0; i < nptrs; ++i) {
            printf("%s\n", strings[i]);
        }
        free(strings);
    }
}

int main()
{
    dumpTraceback();
    return 0;
}
```
示例结果
```
backtrace() returned 3 address
0   test                                0x000000010d074e44 _Z13dumpTracebackv + 52
1   test                                0x000000010d074f24 main + 20
2   dyld                                0x000000011299c52e start + 462
```
