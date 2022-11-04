---
comments: true
tag: UE4, 宏, UFUNCTION
---


# UE4 UFUNCTION常用的的元信息宏

参考原文： [UE4-常见的宏-UFUNCTION](https://blog.csdn.net/wmy19890322/article/details/125598935)

## BlueprintCallable

该函数可以在蓝图或关卡蓝图图表中执行

```cpp
public: 
    UFUNCTION(BlueprintCallable, Category = "Snowing,BlueprintFunc")
    void BlueprintCallableFunction();
```

![img](https://img-blog.csdnimg.cn/2a1f39348030481e8c035558b1593c05.png)



## BlueprintImplementableEvent

此函数可以在蓝图或关卡蓝图图表内进行重载
不能修饰private级别的函数，函数在C++代码中不需要实现定义

```cpp
public:
    UFUNCTION(BlueprintImplementableEvent, meta = (DisplayName = "Blueprint Implementable Event Function"), Category = "Snowing|BlueprintFunc")
    float BlueprintImplementableEventFunction(float In_Float);
```

![img](https://img-blog.csdnimg.cn/cefc8fce87604a75b53de269e6fff3fa.png)

## Category

Category = TopCategory|SubCategory|Etc

指定函数在编辑器中的显示分类层级，`|` 是分层级的符号

```cpp
UFUNCTION(BlueprintPure, Category = "Snowing|BlueprintFunc")
AActor* BlueprintPureFunction();
```

![img](https://img-blog.csdnimg.cn/98a3c91a8c134549949336619530a50f.png)

## 元数据说明符

用法：UFUNCTION( [函数说明符], meta = (元数据说明符) )

### CommutativeAssociativeBinaryOperator=”true”

指示BlueprintCallable函数应该使用“Commutative Associative Binary”节点。该节点缺少引脚名称，但具有创建附加输入引脚的“Add Pin”按钮

```cpp
//.h文件函数声明
UFUNCTION(BlueprintPure, meta = (DisplayName = "Add Pin Function", CommutativeAssociativeBinaryOperator = "true"), Category = "Snowing|Parameters")
    float CommutativeAssociativeBinaryOperatorFunction(const float A, const float B);
 
//.cpp文件行数定义
float AActorTest::CommutativeAssociativeBinaryOperatorFunction(const float A, const float B)
{
    float Result{0.f};
    Result += A;
    Result += B;
 
    return Result;
}
```

![img](https://img-blog.csdnimg.cn/87750f73d75b4ccb943b11e91c69871c.png)



### CompactNodeTitle=”Name”

指示BlueprintCallable函数应在紧凑显示模式下显示，并提供在该模式下显示的名称 

```cpp
UFUNCTION(BlueprintCallable, meta = (AutoCreateRefTerm = "In_Int32", CompactNodeTitle = "CompactNodeTitleFunction"), Category = "Snowing|Parameters")
    int32 AutoCreateRefTermFunction(UPARAM(Ref) int32& In_Int32);
```

![img](https://img-blog.csdnimg.cn/4e4d06c26b1f48ae8f7c5600f17a74e5.png)



### DisplayName=”Blueprint Node Name”

蓝图中此节点的名称将替换为此处提供的值，而不是代码生成的名称（在蓝图中搜索被修饰函数也用这里提供的值）

### HidePin=”Parameter”

对于BlueprintCallable函数，这表示参数引脚应该隐藏在用户的视图中。请注意，每个功能只能有一个参数引脚以这种方式隐藏 

```cpp
UFUNCTION(BlueprintCallable, meta = (HidePin = "In_Float"), Category = "Snowing|Parameters")
    void HidePinFunction(int In_Int, float In_Float, FString In_FString, TArray<AActor*> In_TArray);
```

![img](https://img-blog.csdnimg.cn/65d3e60dba0c43ea98a8d308057db4db.png)

