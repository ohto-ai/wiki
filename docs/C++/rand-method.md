---
comments: true
---
# 自定义随机数

```cpp
class rand_generator {
public:
    rand_generator(int seed = 0)
        : seed_{ seed } {}

    operator int() {
        seed_ = (seed_ * 214013 + 2531011) & 0x7fffffff;
        return seed_;
    }
private:
    int seed_{};
};
```